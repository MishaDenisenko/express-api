const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController, PostController, CommentController, LikeController, FollowController } = require('../controllers');
const { authToken } = require('../middleware/auth');

const destination = 'uploads';

// Показываем, где хранить файлы
const storage = multer.diskStorage({
    destination,
    filename: function (req, file, next) {
        next(null, file.originalname);
    }
});

const uploads = multer({ storage });

// Роуты пользователя
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authToken, UserController.currentUser);
router.get('/users/:id', authToken, UserController.getUserById);
router.put('/users/:id', authToken, uploads.single('avatar'), UserController.updateUser);

// Роуты постов
router.post('/posts', authToken, PostController.createPost);
router.get('/posts', authToken, PostController.getAllPosts);
router.get('/posts/:id', authToken, PostController.getPostById);
router.delete('/posts/:id', authToken, PostController.deletePostById);

// Роты комментариев
router.post('/comments', authToken, CommentController.createComment);
router.delete('/comments/:id', authToken, CommentController.deleteComment);

// Роуты лайков
router.post('/likes', authToken, LikeController.likePost);
router.delete('/likes/:id', authToken, LikeController.unlikePost);

// Роуты подписок
router.post('/follow', authToken, FollowController.followUser)
router.delete('/follow/:id', authToken, FollowController.unfollowUser)

module.exports = router;