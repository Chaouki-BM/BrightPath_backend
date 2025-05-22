const axios = require("axios");

const payment = async (req, res) => {
    try {
        console.log(req.body);
        
        // Validate required fields
         if (!req.body || isNaN(req.body)) {
             return res.status(400).json({
                 success: false,
                 message: "Amount is required and must be a number"
             });
         }

        // Validate environment variables
        if (!process.env.App_Token_Flouci || !process.env.App_Secret_Flouci) {
            return res.status(500).json({
                success: false,
                message: "Payment configuration error"
            });
        }

        const url = "https://developers.flouci.com/api/generate_payment";
        const payload = {
            "app_token": process.env.App_Token_Flouci, 
            "app_secret": process.env.App_Secret_Flouci,
            "amount": req.body,
            "accept_card": "true",
            "session_timeout_secs": 1200,
            "success_link": process.env.SUCCESS_URL || "http://localhost:3500/success",
            "fail_link": process.env.FAIL_URL || "http://localhost:3500/fail",
            "developer_tracking_id":process.env.Dev_Tracking_ID_Flouci 
        };
        
        const response = await axios.post(url, payload);
        
        res.status(200).json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error("Payment error:", error);
        
        // Handle axios errors specifically
        if (error.response) {
            // The request was made and the server responded with a status code
            return res.status(error.response.status).json({
                success: false,
                message: "Payment gateway error",
                error: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(503).json({
                success: false,
                message: "No response from payment gateway"
            });
        } else {
            // Something happened in setting up the request
            return res.status(500).json({
                success: false,
                message: "Payment processing error"
            });
        }
    }
};

module.exports = payment;