const { prisma } = require('../prisma/prisma-client');

const bcrypt = require('bcryptjs');
const jd = require('jdenticon');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const register = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) return res.status(400).json({ error: 'Все поля обязательны!' });

    try {
        const existingUser = await prisma.user.findUnique(({ where: { email } }));

        if (existingUser) return res.status(400).json({ error: 'Пользователь с таким email уже существует!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const png = jd.toPng(`${ name }${ Date.now() }`, 200);
        const avatarName = `${ name }_${ Date.now() }.png`;
        const avatarPath = path.join(__dirname, '/../uploads', avatarName);
        fs.writeFileSync(avatarPath, png);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                avatarUrl: `/uploads/${ avatarName }`,
            }
        });

        res.status(200).json(user);
    } catch (err) {
        console.error('Error in reg', err);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Все поля обязательны!' });

    try {
        const user = await prisma.user.findUnique(({ where: { email } }));
        if (!user) return res.status(400).json({ error: 'Неверный логин или пароль!' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Неверный логин или пароль!' });

        const token = jwt.sign(({ userId: user.id }), process.env.SECRET_KEY);

        res.status(200).json({ token });
    } catch (err) {
        console.error('Error in login', err);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                followers: true,
                following: true
            }
        });

        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        const isFollowing = await prisma.follows.findFirst({
            where: {
                AND: [
                    { followerId: userId },
                    { followingId: id }
                ]
            }
        });

        res.status(200).json({ ...user, isFollowing: !!isFollowing });
    } catch (err) {
        console.error('Error in getUserById', err);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const { email, name, dateOfBirth, bio, location } = req.body;

    const filePath = req.file?.path;

    if (id !== userId) return res.status(403).json({ error: 'Нет доступа' });

    try {
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: { email }
            });

            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({ error: 'Такой email уже используется' });
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                email: email || undefined,
                name: name || undefined,
                avatarUrl: filePath ? `/${ filePath }` : undefined,
                dateOfBirth: dateOfBirth || undefined,
                bio: bio || undefined,
                location: location || undefined
            }
        });

        res.status(200).json(user);
    } catch (err) {
        console.error('Error in updateUser', err);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const currentUser = async (req, res) => {
    const { userId: id } = req.user;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                followers: {
                    include: {
                        follower: true
                    }
                },
                following: {
                    include: {
                        following: true
                    }
                }
            }
        });

        if (!user) return res.status(400).json({ error: 'Не удалось найти пользователя' });

        res.status(200).json(user);
    } catch (err) {
        console.error('Error in currentUser', err);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const UserController = {
    register,
    login,
    getUserById,
    updateUser,
    currentUser,
};

module.exports = UserController;