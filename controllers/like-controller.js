const { prisma } = require('../prisma/prisma-client');

const likePost = async (req, res) => {
    const { postId } = req.body;
    const { userId } = req.user;

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: 'Пост не найден.' });

    try {
        const exist = await prisma.like.findFirst({ where: { postId, userId } });

        if (exist) return res.status(400).json({ error: 'Лайк уже существует.' });

        const like = await prisma.like.create({
            data: {
                postId,
                userId
            }
        });

        res.status(200).json(like);
    } catch (err) {
        console.log('Error in likePost', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unlikePost = async (req, res) => {
    const { id: postId } = req.params;
    const { userId } = req.user;

    try {
        const like = await prisma.like.findFirst({ where: { postId, userId } });

        if (!like) return res.status(404).json({ error: 'Такого лайка не существует.' });
        if (like.userId !== userId) return res.status(403).json({ error: 'Нет доступа.' });

        const unliked = await prisma.like.deleteMany({ where: { postId, userId } });

        res.status(200).json(unliked);
    } catch (err) {
        console.log('Error in unlikePost', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const LikeController = {
    likePost,
    unlikePost
};

module.exports = LikeController;