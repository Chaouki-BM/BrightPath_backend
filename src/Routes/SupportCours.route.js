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
Router.put('/cours/:supportId', VerifyToken, upload.single('File'), supportCoursController.modifierSupportCours);
Router.delete('/cours/:supportId', VerifyToken, supportCoursController.supprimerSupportCours);
Router.get('/cours/:coursId', VerifyToken, supportCoursController.getSupportsCours);

module.exports=Router;