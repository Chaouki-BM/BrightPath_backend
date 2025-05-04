const express = require('express');
const Router = express.Router();
const VerifyToken=require('../Middleware/VerifToken')
const supportCoursController = require('../Controllers/SupportCours.controller');
const multer = require('multer');
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }
 });
// Routes pour les enseignants (création, modification, suppression)

Router.post('/cours/:coursId', VerifyToken,upload.single('File'), supportCoursController.creerSupportCours);

Router.delete('/:supportId', VerifyToken, supportCoursController.supprimerSupportCours);

// Routes pour tous les utilisateurs authentifiés
Router.get('/cours/:coursId', VerifyToken, supportCoursController.getSupportsCours);


module.exports=Router;
