const express = require('express');
const authRoutes = require('./routes/authRoutes');

// CREATION DE L'APPLICATION EXPRESS
const app = express();

// POUR PARSER LE JSON
app.use(express.json()); 

// ROUTES DE L'AUTHENTIFICATION
app.use('/auth', authRoutes); 

// EXPORTATION DU MODULE
module.exports = app;
