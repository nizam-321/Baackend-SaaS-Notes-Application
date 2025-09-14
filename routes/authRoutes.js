//path: backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
    res.json({message: `welcome ${req.user.username}, you are authenticated!`});
});
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;