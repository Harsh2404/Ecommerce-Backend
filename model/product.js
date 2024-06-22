const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Provide product name'],
        trim: true,
        maxlength:[120,'Product name should not be more than 120 char']
    },
    price:{
        type: Number,
        required:[true, 'please provide price of product' ],
        maxlength:[6,'Product price should not be more than 6 digit']
    },
    description:{
        type:String ,
        required:[true, 'please provide description of product' ],
    },
    photos:[{
        id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String ,
        required:[true, 'please select category from: shortsleeve, longsleeve, sweatshirt, hoodies' ],
        enum:{
            values:[
                'shortsleeve',
                'longsleeve',
                'sweatshirt',
                'hoodies'
            ],
            message:'please select category from enum values'

        }

    },
    stock:{
        type:Number,
        required:[true,'please add available stock value']
    },
    brand:{
        type:String ,
        required:[true, 'please provide brand of product' ],
    },
    ratings:{
        type:Number ,
        default:0
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:true
        },
        name:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    }],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    
    
    

});

module.exports=mongoose.model('Product',productSchema);