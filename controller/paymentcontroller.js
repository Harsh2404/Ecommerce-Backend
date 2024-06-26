const BigPromise = require("../middleware/bigPromise");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.sendStripeKey=(BigPromise(async(req,res,next)=>{
    res.status(200).json({
        success:true,
        stripeKey:process.env.STRIPE_API_KEY
    })
}))
exports.captureStripePayment=(BigPromise(async(req,res,next)=>{
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        automatic_payment_methods: {
          enabled: true,
        },

        //optional
        metadata:{
            integration_check:'accept_a_payment'
        }

      });
    
    
    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret
    })
}))

exports.sendRazorpayKEy=(BigPromise(async(req,res,next)=>{
    res.status(200).json({
        success:true,
        stripeKey:process.env.RAZORPAY_API_KEY
    })
}))

exports.captureRazorpayPayment=(BigPromise(async(req,res,next)=>{
    
    var instance = new Razorpay({ 
        key_id:process.env.RAZORPAY_API_KEY , 
        key_secret:process.env.RAZORPAY_SECRET  })

    var myorder=await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    })

    
    res.status(200).json({
        success:true,
        amount:req.body.amount,
        order:myorder
    })
}))
