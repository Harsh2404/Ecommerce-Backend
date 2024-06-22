const User=require('../model/user')
const BigPromise=require('../middleware/bigPromise')
const customError=require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
// const fileUpload=require('express-fileupload')
const cloudinary=require('cloudinary')
const emailHelper=require('../utils/emailHelper')
const crypto=require('crypto')

exports.signup=BigPromise(async (req, res, next)=>{
    // photo upload
    // if (!req.files) {
    //     return next(new customError('photo upload is required!',400));
    //   }
    
    const { name, email, password,role} = req.body;

    if (!email || !name || !password) {
    return next(new customError('email  name password is required!',400));
    }
    // let file = req.files.photo;
    // console.log(file);

    // const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    // folder: "users",
    // width: 150,
    // crop: "scale",
    // });
    // console.log(result);
     
    const user=await User.create({
        name,
        email,
        password,
        // photo: {
        // id: result.public_id,
        // secure_url: result.secure_url,
        // },
        role
    })

    cookieToken(user,res);
})

exports.login=BigPromise(async (req,res,next)=>{
    const {email,password}=req.body;

    //check presence for email and pass
    if(!email || !password){
        return next(new customError('please provide email and password',400));   
    }
    //get user from db
    const user = await User.findOne({email}).select('+password');
    //user not found in db
    if(!user){
        return next(new customError('you are not registered',400));
    }
    //match pass
    const ispasscorrect=await user.isValidatedPassword(password);
    // console.log(ispasscorrect);
    
    //pass does not match
    if(!ispasscorrect){
        return next(new customError('pass and emai are not correct'),400);
    }
    //all goes well send token    
    cookieToken(user,res);

})
exports.logout=BigPromise(async (req,res,next)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        meassage:'logout success'
    })
})

exports.forgotpass=BigPromise(async (req,res,next)=>{
    const {email}=req.body;
    //email does not entered
    if(!email){
        return next(new customError('email id required!',400));
    }
    //find user with registered email id
    const user=await User.findOne({email});
    if(!user){
        return next(new customError('user does not exist',400));
    }
    //create forgotpasstoken of user
    const forgottoken=await user.getforgotpasstoken();

    //save forgotpasstoken and expiry in db
    await user.save({validateBeforeSave:true});

    //create url to send
    const myUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgottoken}`;
    
    //craft message to show in email
    const message=`copy paste this link in url and press enter \n\n\n ${myUrl}`;
    //sending email and update about status
    try{
        await emailHelper({
            email: user.email,
            subject:'password reset email',
            message

        });
        res.status(200).json({
            success: true,
            message:'mail sent success'
        })
        
    }catch(err){
        //delete updated value in db if mail is not sent
        user.forgotPasswordToken=undefined;
        user.forgotpasswordExpiry=undefined;
        await user.save({validateBeforeSave:true});

        return next(new customError('mail send issue',500))
    }


})

exports.passreset=BigPromise(async (req,res,next)=>{
    //taking token from url
    const token=req.params.token;
    //encryption of token
    const encrytoken=crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    //getting user from db
    const user=await User.findOne({
        encrytoken,
        forgotpasswordExpiry:{
            $gt:Date.now()
        }
    })

    if(!user){
        return next(new customError('token is not valid/expired',400));
    }
    console.log(user);
    if(req.body.password !== req.body.confirmpassword){
        return next(new customError('pass and confirm pass does not match',400));
    }
    user.password=req.body.password;
    user.forgotPasswordToken=undefined;
    user.forgotpasswordExpiry=undefined;
    await user.save();
    //send json response or give token for login
    cookieToken(user,res);

})

exports.getLoggedInUserDetails=BigPromise(async (req,res,next)=>{
    const user=await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    })
})

exports.changePassword=BigPromise(async (req,res,next)=>{

    const user=await User.findById(req.user.id).select("+password");
    
    const isCorrectOldpass=await user.isValidatedPassword(req.body.oldPassword);
    if(!isCorrectOldpass){
        return next(new customError('old password passed is incorrect'));
    }
    user.password=req.body.password;

    await user.save();

    cookieToken(user,res);

    res.status(200).json({
        success:true,
        user
    })
})
exports.updateUserDetails=BigPromise(async (req,res,next)=>{
    const {name,email}= req.body;
    if(!name || !email){
        return customError('name and email fields are missing',400);
    }

    const newData={
        name:req.body.name,
        email:req.body.email
    }

    if(req.files){
        //geting user from userId
        const user=await User.findById(req.user.id);
        //get existing image id of user
        const imageId=user.photo.id;
        //delete existing photo from cloudinary
        await cloudinary.v2.uploader.destroy(imageId);

        //upload the new photo
        const result=await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder: "users",
            width: 150,
            crop: "scale",
        })
        //updating neData
        newData.photo={
            id:result.public_id,
            secure_url:result.secure_url
        }
    }

    const user=await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    
    

    res.status(200).json({
        success:true,
        user
    })
})

//admin methods
exports.adminAllUser=BigPromise(async (req,res,next)=>{
    const users=await User.find({});
    return res.status(200).json({
        success:true,
        users
    })
})
exports.adminGetOneUser=BigPromise(async (req,res,next)=>{
    const user = await User.findById(req.params.id);
    
    if(!user){
        return next(new customError('user not found',400));
    }

    return res.status(200).json({
        success:true,
        user
    })
})
exports.adminUpdateOneUserDetails=BigPromise(async (req,res,next)=>{

    const newData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user=await User.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    
    

    res.status(200).json({
        success:true,
        user
    })
    
    if(!user){
        return next(new customError('user not found',400));
    }

    return res.status(200).json({
        success:true,
        user
    })
})
exports.adminDeleteOneUser=BigPromise(async (req,res,next)=>{
    
    const user=await User.findById(req.params.id);
    if(!user){
        return next(new customError('user not found',400));
    }

    //delete photo from clodinary
    const imageId=user.photo.id;
    
    await cloudinary.v2.uploader.destroy(imageId);
    
    //delete user from db
    await user.remove();
    
    

    res.status(200).json({
        success:true,
    })
    
    if(!user){
        return next(new customError('user not found',400));
    }

    return res.status(200).json({
        success:true,
        user
    })
})

//manager methods
exports.managerAllUser=BigPromise(async (req,res,next)=>{
    const users=await User.find({role:'user'});
    return res.status(200).json({
        success:true,
        users
    })
})