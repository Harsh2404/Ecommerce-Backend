const User=require('../model/user')
const BigPromise=require('./bigPromise')
const customError=require('../utils/customError');
const jwt=require('jsonwebtoken');


exports.isLoggedIn=BigPromise(async (req,res,next)=>{
    const token=req.cookies.token;
    // console.log(token);
    if(!token){
        return next(new customError('log in first to have access',400));
    }
    //return signing value of user
    const decoded= jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //setting req.user middleware
    req.user = await User.findById(decoded.id);

    next();
})

exports.customRole=(...roles)=>{
    // console.log(roles);
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new customError('you are not allowed for this resource',400));
        }
        next(); 
    }
}