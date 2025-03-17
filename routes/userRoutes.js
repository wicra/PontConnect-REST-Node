import express from 'express';
import { GetAllAvailabilities } from '../controllers/userController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

// ROUTES DE L'UTILISATEUR
router.get('/GetAllAvailabilities', GetAllAvailabilities);

// EXPORTATION DU MODULE
export default router;
