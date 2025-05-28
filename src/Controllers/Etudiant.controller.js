const Utilisateur=require('../Models/Utilisateur.model')
const Abonnement=require("../Models/Abonnement.model")
const Cours=require("../Models/Cours.model")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const SendEmail = require('../Middleware/SendMail');
const buy=require('../Middleware/payment')
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const generator = require('generate-password');
const axios = require("axios");
const generatePassword=()=>{
    return password = generator.generate({
        length: 6,
        numbers: true
    });
}


exports.register = async (req, res) => {
    try {
      const { nom, prenom, email, password, role } = req.body;
  
      
      if (!nom || !prenom || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all fields' });
      }
  
      
      
      const userExists = await Utilisateur.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const genCode=generatePassword()
      
      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role,
        verificationCode:genCode,
      })
      console.log("user",user);
      if(user){
        res.status(201).json({
            success:true,
            message:'register successfully'  
        })
        //const verificationLink = `${process.env.URL_BACK}verification?email=${email}`;
        
        // Construct the email request body
        
            const emailBody = {
                to: email,
                subject: 'Please verify your email address',
                name: nom+"\t"+prenom,
                //link: verificationLink,
                buttonText:genCode,
                emailMessage:'Thank you for signing up! To complete your registration, please click the button below:'
            }; 
        SendEmail({ body: emailBody }, res); 
    }
    
  
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.Verif_Mail=async(req,res)=>{
    try{
        const { email,Vcode } = req.body;
        const userExists=await Utilisateur.findOne({email})
        if(userExists.verificationCode==Vcode){
            userExists.isVerified=true; 
            await userExists.save();
            return res.status(200).json({
                success:true,
                message:'Verification done !',
            })
        }else{
        res.status(400).json({
            success:false,
            message:"code incorrect"
        })
    }
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        });
    }
}

exports.LoginEtudiant=async(req,res)=>{ 
    try{
    let {email,password}=req.body;
    let userExists=await Utilisateur.findOne({email:email});
    if(userExists){
        let verifPassword=await bcrypt.compare(password,userExists.password);
        if(verifPassword){
            if(userExists.isVerified==false){
                const genCode=generatePassword()
                userExists.verificationCode=genCode
                await userExists.save();
                //const verificationLink = `${process.env.URL_BACK}verification?email=${userExists.email}`;
                // Construct the email request body
                    let EmailBody = {
                        to: userExists.email,
                        subject: 'Please verify your email address',
                        name: userExists.nom+"\t"+userExists.prenom,
                        //link: verificationLink,
                        buttonText:genCode,
                        emailMessage:'Thank you for signing up! To complete your registration, please click the button below:'
                    }; 
                    
             SendEmail({ body: EmailBody }, res); 
                return res.status(401).json({
                    success:false,
                    message:'You need to verify your email first!',
                })
            }
            let token =jwt.sign( { id:userExists._id } , process.env.TOKEN_SECRET, { expiresIn: '12h' });
            res.status(200).json({
                success:true,
                message:'welcome back',
                result:{
                    token:token,
                     id: userExists._id,
                     avatar: userExists.avatar,
                     nom: userExists.nom,
                     prenom: userExists.prenom,
                     role: userExists.role,
                }
            })
            
        }else{
            res.status(400).json({
                success:false,
                message:'Email and password incorrect'
            }) 
        }

    }else{
        res.status(400).json({
            success:false,
            message:'Email and password incorrect'
        })
    }
}catch(error){
    res.status(500).json({message: "Internal server error" });
}
}
exports.LoginWithGoogle=async () => {
   console.log("login success!!");
    
}
exports.buy=async(req,res)=>{
    let {amount}=req.body
    console.log("buy",amount);
    
    buy({ body: amount }, res); 
}

exports.VerifyPayment = async (req, res) => {
    try {
       
        const paymentId = req.params.id;
        const coursId = req.params.coursId;
        
        if (!coursId) {
            return res.status(400).json({ 
                success: false,
                message: "Course ID is required" 
            });
        }
        
        if (!paymentId) {
            return res.status(400).json({ 
                success: false,
                message: "Payment ID is required" 
            });
        }
        
        const verifyUrl = `https://developers.flouci.com/api/verify_payment/${paymentId}`;
        
        
        const response = await axios.get(verifyUrl, {
            headers: {
                'Content-Type': 'application/json',
                'apppublic': process.env.App_Token_Flouci,
                'appsecret': process.env.App_Secret_Flouci
            }
        });
        
        
        if (response.data.result.status === "FAILURE") {
            return res.status(400).json({
                success: false,
                message: "Payment failed"
            });
        }
        
        
        const cours = await Cours.findById(coursId);
        if (!cours) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        
        
        const existingSubscription = await Abonnement.findOne({
            etudiant: req.userId,
            cours: coursId
        });
        
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "You already have a subscription for this course"
            });
        }
        
        
        const abonnement = await Abonnement.create({
            etudiant: req.userId,
            cours: coursId,
            etat: "paye",
            date_payement: new Date(),
            montant: cours.prix
        });
        
        res.status(200).json({
            success: true,
            message: "Payment verified and subscription created successfully",
            data: {
                subscriptionId: abonnement._id,
                courseTitle: cours.titre,
                amount: cours.prix
            }
        });
        
    } catch (err) {
        console.error('Payment verification error:', err.message);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
}

exports.SendEmailFrogetPassword=async(req,res)=>{
    try{
    let { email }=req.body
    let userExists=await Utilisateur.findOne({email:email});
    if(userExists){
        const genCode=generatePassword()
        userExists.verificationCode=genCode
        await userExists.save();  
    let EmailBody = {
        to: userExists.email,
        subject: 'Please verify your email address',
        name: userExists.nom+"\t"+userExists.prenom,
        //link: verificationLink,
        buttonText:genCode,
        emailMessage:'Thank you for signing up! To complete your registration, please click the button below:'
    }; 
    
    SendEmail({ body: EmailBody }, res);
    return res.status(200).json({
        success:true,
        message:'We send you a verification code !',
    })
    }
    return res.status(401).json({
        success:false,
        message:'Use not existe!',
    })
}catch(err){
    res.status(500).json({message: "Internal server error " });
}
}

exports.UpdateForgetPassword=async (req,res) => {
    try{
    let {email,Vcode,NewPassword}=req.body
    
    let userExists=await Utilisateur.findOne({email:email});
    
    if(userExists.verificationCode==Vcode){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(NewPassword, salt);
        userExists.password=hashedPassword
        
        await userExists.save()
        return res.status(200).json({
            success:true,
            message:'Passwrod Updated',
        })
    }
        return re.status(400).json({
            success:false,
            message:'data error !', 
        })
    
    }catch(error){
        res.status(500).json({message: "Internal server error" });
    }
}
exports.modifierIdentiteProfil = async (req, res) => {
    try {
      const { nom, prenom, email, date_nais } = req.body;
      const utilisateur = await Utilisateur.findById(req.userId);
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      utilisateur.nom = nom || utilisateur.nom;
      utilisateur.prenom = prenom || utilisateur.prenom;
      utilisateur.email = email || utilisateur.email;
      utilisateur.date_nais = date_nais || utilisateur.date_nais;
      const utilisateurMisAJour = await utilisateur.save();
      res.status(200).json(utilisateurMisAJour);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.modifierAvatarProfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const utilisateur = await Utilisateur.findById(req.userId);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    utilisateur.avatar = req.file.path;

    const utilisateurMisAJour = await utilisateur.save();

    res.status(200).json(utilisateurMisAJour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.modifierMotDePasse = async (req, res) => {
    try {
      const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  
      const utilisateur = await Utilisateur.findById(req.userId);
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      // Vérifier l'ancien mot de passe
      const motDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.password);
      if (!motDePasseValide) {
        return res.status(401).json({ message: "Ancien mot de passe incorrect" });
      }
  
      // Hacher et enregistrer le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      utilisateur.password = await bcrypt.hash(nouveauMotDePasse, salt);
      await utilisateur.save();
  
      res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  exports.getuser = async (req, res) => {
    try {
      const utilisateur = await Utilisateur.findById(req.userId).select('email nom prenom date_nais avatar');
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      res.status(200).json(utilisateur);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };