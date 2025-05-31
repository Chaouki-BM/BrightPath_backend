const express = require('express');
const Router = express.Router();
const VerifyToken=require('../Middleware/VerifToken')
const supportCoursController = require('../Controllers/SupportCours.controller');
const multer = require('multer');
const path = require('path');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour n'accepter que les fichiers PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Routes pour les enseignants (création, modification, suppression)
Router.post('/cours/:coursId', VerifyToken, upload.single('File'), supportCoursController.creerSupportCours);
Router.put('/cours/:supportId', VerifyToken, upload.single('File'), supportCoursController.modifierSupportCours);
Router.delete('/cours/:supportId', VerifyToken, supportCoursController.supprimerSupportCours);
Router.get('/cours/:coursId', VerifyToken, supportCoursController.getSupportsCours);

module.exports=Router;