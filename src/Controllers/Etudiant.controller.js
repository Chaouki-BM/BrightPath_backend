const Utilisateur=require('../Models/Utilisateur.model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const SendEmail = require('../Middleware/SendMail');

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
      
      
      const user = await Utilisateur.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role
      })
      console.log("user",user);
      if(user){
        res.status(201).json({
            success:true,
            message:'register successfully'  
        })
        const verificationLink = `${process.env.URL_BACK}verification?email=${email}`;

        // Construct the email request body
            const emailBody = {
                to: email,
                subject: 'Please verify your email address',
                name: nom+"\t"+prenom,
                link: verificationLink,
                buttonText:'Verify Your Account',
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
        const { email } = req.query;
        console.log(email);
        
        const user=await Utilisateur.findOne({email})
        if(user){
           user.isVerified=true; 
           await existEmp.save();
           res.redirect(`http://localhost:5173/login`);
        //    res.status(200).json({
        //     success:true,
        //     message:"verification done."
        //    })
    
    }else{
        res.status(400).json({
            success:false,
            message:"Email incorrect"
        })
    }
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        });
    }
}