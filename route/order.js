const express=require('express')
const router=express.Router();

const {
    createOrder, 
    getOneOrder,
    getOrdersOfLoggedInUser,
    adminGetAllOrders,
    adminUpdateOrder, 
    adminDeleteOrder
    }=require('../controller/ordercontroller');

const { isLoggedIn,customRole} = require('../middleware/user');

router.route('/order/create').post(isLoggedIn,createOrder);

router.route('/orders').get(isLoggedIn,getOrdersOfLoggedInUser);
//order of route is imp 
// after this any other request would be consider as id so make sure that order is proper
router.route('/order/:id').get(isLoggedIn,getOneOrder);


//admin routes
router.route('/admin/orders').get(isLoggedIn,customRole('admin'),adminGetAllOrders);

router.route('/admin/order/:id')
        .put(isLoggedIn,customRole('admin'),adminUpdateOrder)
        .delete(isLoggedIn,customRole('admin'),adminDeleteOrder);



module.exports=router;