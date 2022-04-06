const jwt = require('jsonwebtoken');

export const verify = (req,res,next)=> {

    const authHeader = req.headers.authorization;

    if(authHeader){
        const token = authHeader.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET, (err,user)=> {
            if(err){
                return res.status(403).json('token is not valid!'); 
            }
            req.user=user;
            next();
        })
    } else {
        res.status(401).json('you are not authenticated')
    }
}