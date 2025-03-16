const express = require('express');
const { register, login } = require('../controllers/authController');

// VARIABLES DE ROUTAGE
const router = express.Router();

// ROUTES DE L'AUTHENTIFICATION
router.post('/register', register);
router.post('/login', login);

// EXPORTATION DU MODULE
module.exports = router;
