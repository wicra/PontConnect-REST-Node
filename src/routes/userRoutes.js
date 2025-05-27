import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { rateLimitAddBoat, rateLimitAddReservation } from '../middleware/rateLimit.js';
import { 
    GetAllAvailabilities, addBoat,
    deleteBoat, getUserBateaux, getUserReservations,
    updateReservationStatus, getCreneaux, reserveCreneau 
    } from '../controllers/userController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔═════════════════════════╗
  ║ ROUTES DE L'UTILISATEUR ║
  ╚═════════════════════════╝`
router.get('/availabilities', verifyToken, GetAllAvailabilities);
router.post('/boats', verifyToken, rateLimitAddBoat, addBoat);
router.delete('/boats', verifyToken, deleteBoat);
router.get('/boats', verifyToken, getUserBateaux);
router.get('/reservations', verifyToken, getUserReservations);
router.patch('/reservations-status', verifyToken, updateReservationStatus);
router.get('/creneaux', verifyToken, getCreneaux);
router.post('/reservations-creneaux', verifyToken, rateLimitAddReservation, reserveCreneau);

// EXPORTATION DU MODULE
export default router;
