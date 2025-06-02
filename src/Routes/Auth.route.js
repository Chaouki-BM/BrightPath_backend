const express=require('express');
const Router=express.Router();
const passport = require('passport');
const EtudiantController=require("../Controllers/Etudiant.controller")
const VerifyToken=require('../Middleware/VerifToken')
const upload = require('../Middleware/multer');
Router.post("/ERegister",EtudiantController.register);
Router.put("/verification",EtudiantController.Verif_Mail);
Router.post("/ELogin",EtudiantController.LoginEtudiant);
Router.post("/EForgetMail",EtudiantController.SendEmailFrogetPassword);
Router.post("/EUpdatePassword",EtudiantController.UpdateForgetPassword);
// Route to trigger Google login
Router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google callback
Router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/'}),
  EtudiantController.LoginWithGoogle,
  
);
Router.post("/buy",EtudiantController.buy);
Router.post("/VrifyPayment/:id/:coursId",VerifyToken,EtudiantController.VerifyPayment);
Router.put("/updateProfile",VerifyToken,EtudiantController.modifierIdentiteProfil)
Router.put('/updateAvatar', VerifyToken, upload.single('avatar'), EtudiantController.modifierAvatarProfil);
Router.put('/updateMotdepasse', VerifyToken, EtudiantController.modifierMotDePasse);
Router.get('/getUser', VerifyToken, EtudiantController.getuser);
module.exports=Router;