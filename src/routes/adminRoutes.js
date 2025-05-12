import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
    adminAddHoraireCreneau,adminDeleteHoraireCreneau,adminGetFormDataHorairesCreneaux,
    adminGetHorairesCreneaux,adminUpdateHoraireCreneau,getPendingReservations
    } from '../controllers/adminController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔═════════════════════════╗
  ║     ROUTES DE L'ADMIN   ║
  ╚═════════════════════════╝`
router.post('/horaires-creneaux', verifyToken, adminAddHoraireCreneau );
router.delete('/horaires-creneaux', verifyToken, adminDeleteHoraireCreneau);
router.patch('/horaires-creneaux/:id', verifyToken, adminUpdateHoraireCreneau);
router.get('/horaires-creneaux/form-data', verifyToken, adminGetFormDataHorairesCreneaux);
router.get('/horaires-creneaux', verifyToken, adminGetHorairesCreneaux);
router.get('/reservations/pending', verifyToken, getPendingReservations);


// EXPORTATION DU MODULE
export default router;
