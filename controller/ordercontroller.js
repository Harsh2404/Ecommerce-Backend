const Order=require('../model/order');
const Product=require('../model/product');

const BigPromise=require('../middleware/bigPromise');
const customError = require('../utils/customError');

exports.createOrder=BigPromise(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    }=req.body;

    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user:req.user._id,
    });
    res.status(200).json({
        success:true,
        order
    })


});

exports.getOneOrder=BigPromise(async(req,res,next)=>{
    //further dive under user model from its id for name and email
    const order=await Order.findById(req.params.id)
                           .populate('user','name email');

    if(!order){
        return next(new customError('order with passed id does not exist',401));
    }
    res.status(200).json({
        success:true,
        order
    })
});

exports.getOrdersOfLoggedInUser=BigPromise(async(req,res,next)=>{
    const orders=await Order.find({
        user:req.user._id
    })

    res.status(200).json({
        success:true,
        orders
    })
});

exports.adminGetAllOrders=BigPromise(async(req,res,next)=>{
    const orders=await Order.find()
    res.status(200).json({
        success:true,
        orders
    })
});

exports.adminUpdateOrder=BigPromise(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(order.orderStatus=='Delivered'){
        return next(new customError('order is alredy marked for delivery',401));
    }
    order.orderStatus=req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product,prod.quantity);        
    });
    //update stock as order is marked as delivered
    
    await order.save();

    res.status(200).json({
        success:true,
        order
    })
});

exports.adminDeleteOrder=BigPromise(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    await order.remove();
    res.status(200).json({
        success:true,
        message:'order delete successful',
        order
    })
});

//func to update stock in product model
async function updateProductStock(productId, quantity){
        const product=await Product.findById(productId);
        product.stock=product.stock-quantity;
        await product.save({
            validateBeforeSave: false
        });
}