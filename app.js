import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import sensorRoutes from "./src/routes/sensorRoutes.js";

// CREATION DE L'APPLICATION EXPRESS
const app = express();

// ACCEPTER LES REQUÊTES VIA PROXY
app.set("trust proxy", 1);

// MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// LES ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sensor", sensorRoutes);

// DEMARRAGE DU SERVEUR
const PORT = 3000;
app.listen(PORT, () => {
  // ASCII ART POUR PONTCONNECT
  const pontConnectAscii = `
###############################################################
#  ____             _    ____                            _    #
# |  _ \\ ___  _ __ | |_ / ___|___  _ __  _ __   ___  ___| |_  #
# | |_) / _ \\| '_ \\| __| |   / _ \\| '_ \\| '_ \\ / _ \\/ __| __| #
# |  __/ (_) | | | | |_| |__| (_) | | | | | | |  __/ (__| |_  #
# |_|   \\___/|_| |_|\\__|\\____\\___/|_| |_|_| |_|\\___|\\___|\\__| #
#                                                             #
#              SERVEUR DEMARRE SUR LE PORT ${PORT}               #
###############################################################                                
    `;

  const menu = `
    COMMANDES PRATIQUES DOCKER COMPOSE DB :
    1 - Construire : docker compose -f compose.db.yaml up -d
    2 - Supprimer  : docker compose -f compose.db.yaml down
    3 - Suppression de la DB locale :rm -r ./data
    `;
  console.log(pontConnectAscii, menu);
});

// EXPORTATION DE L'APPLICATION
export default app;
