import express from 'express';
import { verifyToken } from '../auth/verifyToken.js';
import { 
    GetAllAvailabilities, GetSensorValues, addBoat,
    deleteBoat, getUserBateaux, getUserReservations,
    updateReservationStatus, getCreneaux, reserveCreneau 
    } from '../controllers/userController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔═════════════════════════╗
  ║ ROUTES DE L'UTILISATEUR ║
  ╚═════════════════════════╝`
router.get('/GetAllAvailabilities', verifyToken, GetAllAvailabilities);
router.get('/GetSensorValues', verifyToken, GetSensorValues);
router.post('/addBoat', verifyToken, addBoat);
router.get('/deleteBoat', verifyToken, deleteBoat);
router.get('/getUserBateaux', verifyToken, getUserBateaux);
router.get('/getUserReservations', verifyToken, getUserReservations);
router.post('/updateReservationStatus', verifyToken, updateReservationStatus);
router.get('/getCreneaux', verifyToken, getCreneaux);
router.post('/reserveCreneau', verifyToken, reserveCreneau);

// EXPORTATION DU MODULE
export default router;
