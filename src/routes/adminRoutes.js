import express from 'express';
import { 
    adminAddHoraireCreneau,adminDeleteHoraireCreneau,adminGetFormDataHorairesCreneaux,
    adminGetHorairesCreneaux,adminUpdateHoraireCreneau,getPendingReservations
    } from '../controllers/adminController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔═════════════════════════╗
  ║     ROUTES DE L'ADMIN   ║
  ╚═════════════════════════╝`
router.post('/adminAddHoraireCreneau',adminAddHoraireCreneau );
router.post('/adminDeleteHoraireCreneau',adminDeleteHoraireCreneau);
router.post('/adminUpdateHoraireCreneau',adminUpdateHoraireCreneau);
router.get('/adminGetFormDataHorairesCreneaux',adminGetFormDataHorairesCreneaux);
router.get('/adminGetHorairesCreneaux',adminGetHorairesCreneaux);
router.get('/getPendingReservations',getPendingReservations);

// EXPORTATION DU MODULE
export default router;
