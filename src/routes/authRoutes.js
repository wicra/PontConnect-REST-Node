import express from 'express';
import { rateLimitLogin, rateLimitRegister } from '../middleware/rateLimit.js';
import { register, login } from '../controllers/authController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

// ROUTES DE L'AUTHENTIFICATION
router.post('/register', rateLimitRegister, register);
router.post('/login', rateLimitLogin, login);

// EXPORTATION DU MODULE
export default router;
