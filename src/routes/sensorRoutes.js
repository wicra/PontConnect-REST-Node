import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { addMesureSensor, GetSensorValues} from '../controllers/sensorController.js';

// VARIABLES DE ROUTAGE
const router = express.Router();

` ╔════════════════════════════╗
  ║     ROUTES DES CAPTEURS    ║
  ╚════════════════════════════╝`
router.post('/mesures', verifyToken, addMesureSensor );
router.get('/mesures', verifyToken, GetSensorValues);

// EXPORTATION DU MODULE
export default router;