const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET;

async function authMiddleware(req,res,next){
    try{
        const token = req.headers.token;
        if(!token){
            return res.status(400).json({
                message: "No token provided"
            })
        }
        const checkToken = await jwt.verify(token,SECRET);
        const decodedToken = checkToken;
        next();
    }
    catch(err){
        return res.status(500).json({
            message: err
        })
    }
}

module.exports = {authMiddleware};