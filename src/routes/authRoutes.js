import express from 'express';
import { register, login } from '../controllers/authController.js'; // Utilisation de l'import pour authController

// VARIABLES DE ROUTAGE
const router = express.Router();

// ROUTES DE L'AUTHENTIFICATION
router.post('/register', register);
router.post('/login', login);

// EXPORTATION DU MODULE
export default router;
