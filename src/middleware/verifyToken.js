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