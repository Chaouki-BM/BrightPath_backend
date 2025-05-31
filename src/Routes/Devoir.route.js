const express=require('express');
const Router=express.Router();
const Devoire=require("../Controllers/Devoir.controller")
const VerifyToken=require('../Middleware/VerifToken')
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
Router.post("/creerDevoir",VerifyToken,Devoire.creerDevoir);
Router.post("/mettreAJourDevoir",VerifyToken,Devoire.mettreAJourDevoir);
Router.delete("/supprimerDevoir/:idDevoir",VerifyToken,Devoire.supprimerDevoir);
Router.get("/GetAllDevoir/:CoursId",VerifyToken,Devoire.GetAllDevoir);
Router.get("/getdevoir/:coursId",VerifyToken,Devoire.obtenirDevoirsParCours)
Router.post('/soumettreCompteRendu/:devoirId', VerifyToken, upload.single('file'),Devoire.soumettreCompteRendu);
module.exports=Router;