const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// FONCTIONS POUR L'INSCRIPTION
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // VERIFICATION DES CHAMPS
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // VERIFICATION DE L'EXISTENCE DE L'UTILISATEUR
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // HASHAGE DU MOT DE PASSE
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERTION DE L'UTILISATEUR
    const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// FONCTION POUR LA CONNEXION
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // VERIFICATION DES CHAMPS
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    // RECHERCHE DE L'UTILISATEUR
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = rows[0];

    // VERIFICATION DU MOT DE PASSE
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
