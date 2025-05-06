import express from 'express';
import { verifyToken, checkUserAccess } from '../middleware/verifyToken.js';
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
router.get('/GetAllAvailabilities', verifyToken, checkUserAccess, GetAllAvailabilities);
router.get('/GetSensorValues', verifyToken, checkUserAccess, GetSensorValues);
router.post('/addBoat', verifyToken, checkUserAccess, addBoat);
router.get('/deleteBoat', verifyToken, checkUserAccess, deleteBoat);
router.get('/getUserBateaux', verifyToken, checkUserAccess, getUserBateaux);
router.get('/getUserReservations', verifyToken, checkUserAccess, getUserReservations);
router.post('/updateReservationStatus', verifyToken, checkUserAccess, updateReservationStatus);
router.get('/getCreneaux', verifyToken, checkUserAccess, getCreneaux);
router.post('/reserveCreneau', verifyToken, checkUserAccess, reserveCreneau);

// EXPORTATION DU MODULE
export default router;
