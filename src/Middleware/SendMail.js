const transporter = require('./ConfigNodeMailer');



const SendEmailMiddleware = (req, res) => {
        const { to, subject,name,link,emailMessage,buttonText} = req.body;

         // Check if required fields are missing
        if (!to || !subject || !name || !link ||!emailMessage || !buttonText) {
            return res.status(400).json({ message: 'Missing required email fields' });
        }

        // Email options
    const mailOptions ={
      from: `BrightPath <${process.env.EMAIL}>`,  // Sender address
      to: to,                                        // List of recipients
      subject: subject,                              // Subject line
                                        
      html:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            padding: 20px;
            background-color: #f4f4f7;
        }
        .email-content {
            max-width: 600px;
            background-color: white;
            margin: 0 auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
        }
             a:link {
        color: white;
        }
        .verification-button {
            background-color: #4CAF50;
            color: white;
            font-size: 18px;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
            text-align: center;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
        @media (max-width: 600px) {
            .email-content {
                padding: 10px;
            }
        }
       
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <h1>Email Verification</h1>
            <p>Hi ${name},</p>
            <p>${emailMessage}</p>
            <a href="${link}" class="verification-button">${buttonText}</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>SkillLink Team</p>
            <div class="footer">
                <p>&copy; 2024 BrightPath, Inc. All rights reserved.</p>
                <p>Route de Ceinture, Sahloul, Sousse 4021</p>
            </div>
        </div>
    </div>
</body>
</html>`
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          // if the mail doesn't send
          console.log('Error sending email:',error);
          res.status(500).json({ message: "Failed to send email" });
        } else {
            console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent successfully', info });
        }
      });
};
module.exports = SendEmailMiddleware;
   