const { prisma } = require('../prisma/prisma-client');

const followUser = async (req, res) => {
    const { followingId } = req.body;
    const { userId } = req.user;

    if (followingId === userId) return res.status(500).json({ message: 'Вы не можете подписаться на себя.' });

    try {
        const alreadyFollowed = await prisma.follows.findFirst({
            where: {
                AND: [
                    { followerId: userId },
                    { followingId }
                ]
            }
        });

        if (alreadyFollowed) return res.status(400).json({ error: 'Вы уже подписаны.' });

        await prisma.follows.create({
            data: {
                follower: { connect: { id: userId } },
                following: { connect: { id: followingId } }
            }
        });

        res.status(201).json({ message: 'Подписка успешно создана' });
    } catch (err) {
        console.log('Error in followUser', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unfollowUser = async (req, res) => {
    const { followingId } = req.body;
    const { userId } = req.user;

    try {
        const follow = await prisma.follows.findFirst({
            where: {
                AND: [
                    { followerId: userId },
                    { followingId }
                ]
            }
        });

        if (!follow) return res.status(400).json({ error: 'Вы еще не подписаны.' });

        await prisma.follows.delete({ where: { id: follow.id } });

        res.status(201).json({ message: 'Подписка отменена' });
    } catch (err) {
        console.log('Error in unfollowUser', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const FollowController = {
    followUser,
    unfollowUser
};

module.exports = FollowController;