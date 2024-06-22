const mongoose = require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
//crypto is default library of node
const crypto=require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please provide a name'],
        maxlength: [40,'name should be under 40 character']
    },
    email:{
        type: String,
        required: [true,'Please provide a name'],
        validate:[validator.isEmail,'Please enter email in correct format'],
        unique:true
    },
    password:{
        type: String,
        required: [true,'Please provide a proper password'],
        minlength:[6,'password should be atleast 6 char long'],
        select: false
    },
    role:{
        type: String,
        default: 'user'
    },
    photo:{
        id:{
            type:String,
            // required: true
        },
        secure_url:{
            type: String
            // required: true
        }
    },
    forgotPasswordToken:String,
    forgotpasswordExpiry:Date,
    createdAt:{
        type: Date,
        default:Date.now,
    }

});

//prehook- to encrypt password before save in db
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10)
});

//method-validate password with passed on user password
userSchema.methods.isValidatedPassword= async function(rpassword){
    return bcrypt.compare(rpassword, this.password);
}

//method-create and return jwt token
userSchema.methods.getjwttoken=function(){
    return jwt.sign(
        {
            id:this._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        });
}

//method-create forgotpassword token(random string to verify)
userSchema.methods.getforgotpasstoken=async function(){
    //generate long and random string
    const forgotpasstoken=crypto.randomBytes(20).toString('hex');
    
    //getting hash-make sure that we receive string's hash on backend while do varification
    this.forgotPasswordToken=crypto
            .createHash('sha256')
            .update(forgotpasstoken)
            .digest('hex');

    //set 20 minutes
    this.forgotpasswordExpiry=Date.now() + 20* 60* 1000;

    return forgotpasstoken;
}


module.exports=mongoose.model('User',userSchema);

