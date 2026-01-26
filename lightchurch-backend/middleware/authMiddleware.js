const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Un token est requis pour l\'authentification' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_super_secret');
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
    return next();
};

const requireSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Rôle SUPER_ADMIN requis.' });
    }
};

const requirePastor = (req, res, next) => {
    // Both PASTOR and SUPER_ADMIN can likely do pastor things, or just PASTOR. 
    // Usually admin can do everything, but strict requirement says Pastor manages THEIR church.
    // For now, let's allow both or just check valid user.
    // Spec: "pasteurs... une fois connecter" -> implies role PASTOR.
    // Spec: "je validerais se compte avec compte superadmin"
    if (req.user && (req.user.role === 'PASTOR' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Rôle PASTOR requis.' });
    }
};

module.exports = { verifyToken, requireSuperAdmin, requirePastor };
