const express = require('express');
const Router = express.Router();
const coursController = require('../Controllers/Cours.controller');
const VerifyToken=require('../Middleware/VerifToken')
const enseignantOnly = require('../Middleware/TeacherRoleMiddleware');


// Routes accessibles seulement aux enseignants
Router.post('/CreerCours', VerifyToken, enseignantOnly, coursController.creerCours);
Router.put('/:id', VerifyToken, coursController.modifierCours);
Router.delete('/:id', VerifyToken, coursController.supprimerCours);
Router.get('/mes-cours', VerifyToken, enseignantOnly, coursController.getMesCours);

// Routes accessibles à tous les utilisateurs authentifiés
Router.get('/', VerifyToken, coursController.getAllCours);
Router.get('/:id', VerifyToken, coursController.getCoursById);
Router.get('/enseignant/:enseignantId', VerifyToken, coursController.getCoursParEnseignant);

module.exports = Router;