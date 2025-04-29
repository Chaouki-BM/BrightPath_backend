const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    const authHeader  = req.headers['authorization'];
    
    if (!authHeader ) 
        return res.status(403).send('Token is required');
    
    const token = authHeader.split(' ')[1]; // This will get the actual token part
    // Verify the token
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        
        if (err) {
            return res.status(401).send('Invalid token provided');
        }
        req.userId = decoded.id;// Save decoded token (user info) to request
        next(); // Continue to the next middleware or route
    });
};
module.exports=VerifyToken