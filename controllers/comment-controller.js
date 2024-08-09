const { prisma } = require('../prisma/prisma-client');

const createComment = async (req, res) => {
    const { postId, content } = req.body;
    const { userId } = req.user;

    if (!content) res.status(400).json({ error: 'Все поля обязательны!' });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: 'Пост не найден.' });

    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                content
            }
        });

        res.status(200).json(comment);
    } catch (err) {
        console.log('Error in createComment', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteComment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const comment = await prisma.comment.findUnique({ where: { id } });

        if (!comment) return res.status(401).json({ error: 'Комментарий не найден.' });
        if (comment.userId !== userId) return res.status(403).json({ error: 'Нет доступа.' });

        const deletedComment = await prisma.comment.delete({ where: { id } });

        res.status(200).json(deletedComment);
    } catch (err) {
        console.log('Error in deleteComment', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const CommentController = {
    createComment,
    deleteComment
};

module.exports = CommentController;