const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    },
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.PASSWORD, // Your email password or app-specific password
      },
      // Verify connection configuration
     
    });
    
    module.exports = transporter;