import express from 'express';
import { verifyToken, checkUserAccess, isAdmin} from '../middleware/verifyToken.js';
import { 
    adminAddHoraireCreneau,adminDeleteHoraireCreneau,adminGetFormDataHorairesCreneaux,
    adminGetHorairesCreneaux,adminUpdateHoraireCreneau,getPendingReservations
    } from '../controllers/adminController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔═════════════════════════╗
  ║     ROUTES DE L'ADMIN   ║
  ╚═════════════════════════╝`
router.post('/adminAddHoraireCreneau', verifyToken, checkUserAccess, isAdmin, adminAddHoraireCreneau );
router.post('/adminDeleteHoraireCreneau', verifyToken, checkUserAccess, isAdmin, adminDeleteHoraireCreneau);
router.post('/adminUpdateHoraireCreneau', verifyToken, checkUserAccess, isAdmin, adminUpdateHoraireCreneau);
router.get('/adminGetFormDataHorairesCreneaux', verifyToken, checkUserAccess, isAdmin, adminGetFormDataHorairesCreneaux);
router.get('/adminGetHorairesCreneaux', verifyToken, checkUserAccess, isAdmin, adminGetHorairesCreneaux);
router.get('/getPendingReservations', verifyToken, checkUserAccess, isAdmin, getPendingReservations);

// EXPORTATION DU MODULE
export default router;
