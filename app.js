import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

// CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
dotenv.config();

// CREATION DE L'APPLICATION EXPRESS
const app = express();

// POUR PARSER LE JSON
app.use(express.json());

// ROUTES DE L'AUTHENTIFICATION
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
})

// EXPORTATION DE L'APPLICATION
export default app;
