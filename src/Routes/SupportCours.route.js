const express = require('express');
const router = express.Router();
const supportCoursController = require('../Controllers/SupportCours.controller');
const VerifyToken=require('../Middleware/VerifToken')


// Routes pour les enseignants (création, modification, suppression)
router.post('/cours/:coursId', VerifyToken, supportCoursController.creerSupportCours);
router.delete('/:supportId', VerifyToken, supportCoursController.supprimerSupportCours);

// Routes pour tous les utilisateurs authentifiés
router.get('/cours/:coursId', VerifyToken, supportCoursController.getSupportsCours);