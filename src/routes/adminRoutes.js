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
router.post('/adminAddHoraireCreneau', verifyToken, adminAddHoraireCreneau );
router.post('/adminDeleteHoraireCreneau', verifyToken, adminDeleteHoraireCreneau);
router.post('/adminUpdateHoraireCreneau', verifyToken, adminUpdateHoraireCreneau);
router.get('/adminGetFormDataHorairesCreneaux', verifyToken, adminGetFormDataHorairesCreneaux);
router.get('/adminGetHorairesCreneaux', verifyToken, adminGetHorairesCreneaux);
router.get('/getPendingReservations', verifyToken, getPendingReservations);

// EXPORTATION DU MODULE
export default router;
