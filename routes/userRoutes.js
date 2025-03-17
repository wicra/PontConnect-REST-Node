import express from 'express';
import { GetAllAvailabilities, GetSensorValues } from '../controllers/userController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

// ROUTES DE L'UTILISATEUR
router.get('/GetAllAvailabilities', GetAllAvailabilities);
router.get('/GetSensorValues', GetSensorValues);

// EXPORTATION DU MODULE
export default router;
