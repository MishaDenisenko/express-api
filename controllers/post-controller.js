const { prisma } = require('../prisma/prisma-client');

const createPost = async (req, res) => {
    const { content } = req.body;
    const { userId: authorId } = req.user;

    if (!content) return res.status(400).json({ error: 'Все поля обязательны!' });

    try {
        const post = await prisma.post.create({
            data: {
                content,
                authorId
            }
        });

        res.status(200).json(post);
    } catch (err) {
        console.error('Error in createPost', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllPosts = async (req, res) => {
    const { userId } = req.user;

    try {
        const posts = await prisma.post.findMany({
            include: {
                likes: true,
                author: true,
                comments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const postsWithLikesInfo = posts.map(post => ({
            ...post,
            likedByUser: post.likes.some(like => like.userId === userId)
        }));

        res.status(200).json(postsWithLikesInfo);
    } catch (err) {
        console.error('Error in getAllPosts', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                likes: true,
                author: true,
                comments: {
                    include: {
                        user: true
                    }
                },
            }
        });

        if (!post) return res.status(404).json({ error: 'Пост не найден' });

        const postWithLikeInfo = {
            ...post,
            likedByUser: post.likes.some(like => like.userId === userId)
        };

        res.status(200).json(postWithLikeInfo);
    } catch (err) {
        console.error('Error in getPostById', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deletePostById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) return res.status(404).json({ error: 'Пост не найден' });

    if (post.authorId !== userId) return res.status(403).json({ error: 'Нет доступа' });

    try {
        const transaction = await prisma.$transaction([
            prisma.comment.deleteMany({ where: { postId: id } }),
            prisma.like.deleteMany({ where: { postId: id } }),
            prisma.post.delete({ where: { id } })
        ]);

        res.status(200).json(transaction);
    } catch (err) {
        console.error('Error in deletePostById', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const PostController = {
    createPost,
    getAllPosts,
    getPostById,
    deletePostById
};

module.exports = PostController;