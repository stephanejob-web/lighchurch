const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileType = require('file-type');

// Ensure upload directories exist
const uploadDir = 'uploads';
const sireneDir = 'uploads/sirene';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(sireneDir)) {
    fs.mkdirSync(sireneDir, { recursive: true });
}

// Storage Strategy
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Safe filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    // Limits
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. (JPEG, PNG, WEBP uniquement)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Endpoint
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier envoyé' });
        }
        // Return full URL relative to server root
        // Assuming server serves static files from root/uploads
        // Note: Client might need to adjust URL if behind Nginx proxy without host forwarding
        // For simplicity: Return relative path or absolute if we know domain. 
        // Returning path relative to API base URL is safest if frontend constructs full URL.
        // But here we return absolute URL assuming standard Docker networking or localhost.
        // Better: Return `/uploads/filename` and let frontend prepend API_URL if needed.
        // Actually, simplest is full URL if we trust req.get('host').
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            message: 'Upload réussi',
            url: fileUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'upload' });
    }
});

// Configuration spécifique pour les documents SIRENE
const sireneStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sirene/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sirene-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const sireneFileFilter = (req, file, cb) => {
    // Formats autorisés : PDF, JPG, PNG
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non autorisé. Seuls les PDF, JPG et PNG sont acceptés.'), false);
    }
};

const uploadSirene = multer({
    storage: sireneStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB pour les documents officiels
    fileFilter: sireneFileFilter
});

// Types MIME autorisés pour les documents SIRENE (vérification par magic bytes)
const ALLOWED_SIRENE_MIMES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png'
};

// Route d'upload pour les documents SIRENE (pas de token requis pour l'inscription)
router.post('/sirene', uploadSirene.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Document SIRENE obligatoire' });
        }

        const filePath = req.file.path;

        // Vérifier le vrai type du fichier via les magic bytes
        const fileTypeResult = await FileType.fromFile(filePath);

        // Vérifier si le type est autorisé
        if (!fileTypeResult || !ALLOWED_SIRENE_MIMES[fileTypeResult.mime]) {
            // Supprimer le fichier invalide
            fs.unlinkSync(filePath);

            const detectedType = fileTypeResult ? fileTypeResult.mime : 'inconnu';
            return res.status(400).json({
                message: `Format de fichier invalide. Le fichier uploadé est de type "${detectedType}". Seuls les PDF, JPG et PNG sont acceptés.`
            });
        }

        // Corriger l'extension si elle ne correspond pas au contenu réel
        const correctExtension = ALLOWED_SIRENE_MIMES[fileTypeResult.mime];
        const currentExtension = path.extname(req.file.filename).toLowerCase();

        let finalFilename = req.file.filename;
        let finalPath = filePath;

        if (currentExtension !== correctExtension) {
            // Renommer le fichier avec la bonne extension
            const baseName = path.basename(req.file.filename, currentExtension);
            finalFilename = baseName + correctExtension;
            finalPath = path.join(path.dirname(filePath), finalFilename);
            fs.renameSync(filePath, finalPath);
        }

        // Retourner le chemin relatif (sera stocké en BDD)
        const relativePath = `/uploads/sirene/${finalFilename}`;

        res.json({
            message: 'Document SIRENE uploadé avec succès',
            path: relativePath,
            filename: finalFilename
        });
    } catch (error) {
        console.error('Erreur upload SIRENE:', error);
        // Nettoyer le fichier en cas d'erreur
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Erreur lors de l\'upload du document' });
    }
});

module.exports = router;
