import jwt from 'jsonwebtoken';

` ╔═════════════════════════════════╗
  ║    VERIFICATION D'UN TOKEN      ║
  ╚═════════════════════════════════╝
`
export const verifyToken = (req, res, next) => {
    // RECUPERATION DU TOKEN DEPUIS LE HEADER
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
    }

    try {
        // VERIFICATION DU TOKEN & DECODAGE
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

`
 ╔════════════════════════════════╗
 ║    VERIFICATION UTILISATEUR    ║
 ╚════════════════════════════════╝
`
export const checkUserAccess = (req, res, next) => {
    // RECUPERATION DE L'ID UTILISATEUR DEPUIS LA REQUETE
    const requestUserId = parseInt(
        req.params.user_id ||
        req.query.user_id ||
        req.body.user_id
    );

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Utilisateur non authentifié"
        });
    }

    if (!requestUserId) {
        return res.status(400).json({
            success: false,
            message: "Aucun identifiant utilisateur fourni dans la requête"
        });
    }

    // VERIFICATION DE LA CORRESPONDANCE ENTRE L'ID DU TOKEN ET CELUI DE LA REQUETE
    if (req.user.id === requestUserId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Accès refusé. L'identifiant ne correspond pas à votre compte."
    });
};

`
 ╔══════════════════════════════════════════╗
 ║       VERIFICATION  ADMINISTRATEUR       ║
 ╚══════════════════════════════════════════╝
`
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Utilisateur non authentifié"
        });
    }
    // VERIFICATION DU TYPE UTILISATEUR (1 = ADMIN)
    if (req.user.type_user_id === 1) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Accès réservé aux administrateurs"
    });
};