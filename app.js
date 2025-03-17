import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// CREATION DE L'APPLICATION EXPRESS
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cors());

// LES ROUTES
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// DEMARRAGE DU SERVEUR
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
})

// EXPORTATION DE L'APPLICATION
export default app;
