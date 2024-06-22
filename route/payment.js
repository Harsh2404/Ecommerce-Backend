const express=require('express')
const router=express.Router();

const {
    sendStripeKey, 
    sendRazorpayKEy,
    captureStripePayment,
    captureRazorpayPayment
    }=require('../controller/paymentcontroller')
const { isLoggedIn,customRole} = require('../middleware/user');

router.route('/stripeKey').get(isLoggedIn,sendStripeKey);
router.route('/stripePayment').post(isLoggedIn,captureStripePayment);

router.route('/razorpaykey').get(isLoggedIn,sendRazorpayKEy);
router.route('/razropayPayment').post(isLoggedIn,captureRazorpayPayment);


module.exports=router;