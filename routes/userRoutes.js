import express from 'express';
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
router.get('/GetAllAvailabilities', GetAllAvailabilities);
router.get('/GetSensorValues', GetSensorValues);
router.post('/addBoat', addBoat);
router.get('/deleteBoat', deleteBoat);
router.get('/getUserBateaux', getUserBateaux);
router.get('/getUserReservations', getUserReservations);
router.post('/updateReservationStatus', updateReservationStatus);
router.get('/getCreneaux', getCreneaux);
router.post('/reserveCreneau', reserveCreneau);

` ╔═════════════════════════╗
  ║     ROUTES DE L'ADMIN   ║
  ╚═════════════════════════╝`

// EXPORTATION DU MODULE
export default router;
