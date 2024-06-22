const BigPromise=require('../middleware/bigPromise')
const customError=require('../utils/customError')
const cloudinary=require('cloudinary')
const Product=require('../model/product')
const WhereClause = require('../utils/whereClause')



// exports.testProduct=BigPromise((req,res,next)=>{
//     res.status(200).json({
//         success:true,
//         message:'product route working properly'
//     })
// })

exports.addProduct=BigPromise(async (req,res,next)=>{

    let imageArray=[];

    if(!req.files){
        return next(new customError('photo upload is required!',400));
    }

    if(req.files){
        for(let i=0;i<req.files.photos.length;i++){
            const result=await cloudinary.v2.uploader.upload(
                req.files.photos[i].tempFilePath,{
                    folder:'products'
                });
            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            });

        }
    }
    req.body.photos=imageArray;
    req.body.user=req.user.id;

    const product=await Product.create(req.body);

    res.status(200).json({
        success:true,
        message:'Product created Successfully',
        product
    });
})

exports.getAllProducts=BigPromise(async (req,res,next)=>{
    const resultPerPage=6;
    const totalcountProducts=await Product.countDocuments();
    
    const productsObj=new WhereClause(Product.find(),req.query).search().filter();

    let products=await productsObj.base;

    const filteredProductscount=products.length;

    productsObj.pager(resultPerPage);

    products=await productsObj.base.clone();

    res.status(200).json({
        success: true,
        filteredProductscount,
        totalcountProducts,
        products

    })

})

exports.getOneProduct=BigPromise(async (req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
        return next(new customError('no product exist with this id',401));
    }

    res.status(200).json({
        success: true,
        product

    })

})
//add and update method to product - review method 
exports.addReview=BigPromise(async (req,res,next)=>{
    const {rating,comment,productId}=req.body;
    console.log(productId);
    const review={
        user:req.user._id ,
        name:req.user.name,
        rating:Number(rating),
        comment

    }

    const product =await Product.findById(productId);
    console.log(`fetched product \n ${product}`);
    
    //check if user gave review or not before
    
    const alreadyReviewed=product.reviews.find((rev)=>rev.user.toString() === req.user._id.toString());
    console.log(req.user._id.toString());
    console.log(alreadyReviewed);

    if(alreadyReviewed){
        //update existing review
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString()){
                rev.comment=comment;
                rev.rating=rating;
            }
        })

    }else{
        //push new review in products database for that specific userId
        product.reviews.push(review);
        product.numberOfReviews=product.reviews.length;
        
    }
    //adjust ratings
    product.ratings=product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length;
     //save review of product 
     await product.save({
        validateBeforeSave:false
    })


    res.status(200).json({
        success: true,
        message:'review added successfully',
        review

    })

})
exports.deleteReview=BigPromise(async (req,res,next)=>{
    //get productId from query
    const {productId}=req.query;
    console.log(productId);

    const product =await Product.findById(productId);
    // console.log(`fetched product \n ${product}`);
    
    const reviews= await product.reviews.filter(
        (rev)=>rev.user.toString() !== req.user._id.toString()
    )
    
    console.log(reviews);
    // const numberOfReviews=reviews.length;
    const numberOfReviews=reviews.length;

    const ratings=reviews.reduce(
        (acc,item)=>item.rating+acc,0)/reviews.length;
    
    // product.ratings=ratings;

    //update product data in db
    await Product.findByIdAndUpdate(
        productId,
        {
            reviews,
            ratings,
            numberOfReviews
        },{
            new:true,
            runValidators:true,
            useFindAndModify:false
        }

    );

    res.status(200).json({
        success: true,
        message:'review deleted successfully',

    })

})

exports.getAllReviewsForOneProduct=(BigPromise(async (req,res,next)=>{
    // console.log(req.query);
    const product=await Product.findById(req.query.productId);

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
}))

exports.adminGetAllProducts=BigPromise(async (req,res,next)=>{
    const products= await Product.find({});

    if(!products){
        return customError('products does not exist',400);
    }
    res.status(200).json({
        success:true,
        products
    })
})

exports.adminUpdateOneProduct=BigPromise(async (req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new customError('product with id does not exist',401));
    }
    let imageArray=[];
    if(req.files){
        //destroy existing files
        for (let index = 0; index < product.photos.length; index++) {
            const res=await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }
         //upload new files
        for(let i=0;i<req.files.photos.length;i++){
            const result=await cloudinary.v2.uploader.upload(
                req.files.photos[i].tempFilePath,{
                    folder:'products'
                });
            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            });
        }
        req.body.photos=imageArray;
    
    }
    
    const productUpdated =await Product.findByIdAndUpdate(
        req.params.id,
        req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        
    res.status(200).json({
        success: true,
        productUpdated

    })

})

exports.adminDeleteOneProduct=BigPromise(async (req,res,next)=>{

    const product=await Product.findById(req.params.id);
    
    if(!product){
        return next(new customError('product with id does not exist',401));
    }

    if(product.photos){
         //destroy existing files
        for (let index = 0; index < product.photos.length; index++) {
            const res=await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }
    }
   
    const result=await product.remove();

    res.status(200).json({
        success: true,
        message: 'product deleted successfully',
        result
    })

})

