const express = require('express');
const router = express.Router();
const coursController = require('../Controllers/Cours.controller');
const VerifyToken=require('../Middleware/VerifToken')
const enseignantOnly = require('../middleware/enseignantOnly');


// Routes accessibles seulement aux enseignants
router.post('/CreerCours', VerifyToken, enseignantOnly, coursController.creerCours);
router.put('/:id', VerifyToken, coursController.modifierCours);
router.delete('/:id', VerifyToken, coursController.supprimerCours);
router.get('/mes-cours', VerifyToken, enseignantOnly, coursController.getMesCours);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', VerifyToken, coursController.getAllCours);
router.get('/:id', VerifyToken, coursController.getCoursById);
router.get('/enseignant/:enseignantId', VerifyToken, coursController.getCoursParEnseignant);

module.exports = router;