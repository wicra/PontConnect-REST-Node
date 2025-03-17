import { createHash } from 'crypto';
import db from '../models/db.js';

// FONCTIONS POUR L'INSCRIPTION
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // VERIFICATION DES CHAMPS
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // VERIFICATION DE L'EXISTENCE DE L'UTILISATEUR
    const [rows] = await db.execute('SELECT USER_ID FROM users WHERE EMAIL = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // HASHAGE DU MOT DE PASSE
    const hashedPassword = createHash('sha256').update(password).digest('hex');

    // INSERTION DE L'UTILISATEUR
    await db.execute('INSERT INTO users (USER_NAME, EMAIL, PASSWORD, TYPE_USER_ID, CREATED_AT) VALUES (?, ?, ?, ?, NOW())', [name, email, hashedPassword, 2]);

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// FONCTION POUR LA CONNEXION
export const login = async (req, res) => {

  // RECUPERATION DES CHAMPS
  const { email, password } = req.body;

  // VERIFICATION DES CHAMPS
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    // RECUPERATION DE L'UTILISATEUR
    const [rows] = await db.execute('SELECT * FROM USERS WHERE EMAIL = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];

    // COMPARAISON DES MOTS DE PASSE
    const hashedPassword = createHash('sha256').update(password).digest('hex');

    if (hashedPassword !== user.PASSWORD) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // DATE DE DERNIERE CONNEXION
    await db.execute('UPDATE USERS SET LAST_SIGN = NOW() WHERE USER_ID = ?', [user.USER_ID]);

    // RETOUR DE L'UTILISATEUR
    return res.status(200).json({
      success: true,
      user: {
        id: user.USER_ID,
        name: user.USER_NAME,
        email: user.EMAIL,
        type_user_id: user.TYPE_USER_ID
      }
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
