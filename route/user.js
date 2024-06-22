const express=require('express')
const router=express.Router()
const {
        signup,
        login,
        logout,
        forgotpass,
        passreset,
        getLoggedInUserDetails,
        changePassword,
        updateUserDetails,
        adminAllUser,
        managerAllUser,
        adminGetOneUser,
        adminUpdateOneUserDetails,
        adminDeleteOneUser
    }
    =   require('../controller/usercontroller');
const { isLoggedIn,customRole} = require('../middleware/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpass').post(forgotpass);
router.route('/password/reset/:token').post(passreset);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn,changePassword);
router.route('/userdashboard/update').post(isLoggedIn,updateUserDetails);

//admin routes
router.route('/admin/users').get(isLoggedIn,customRole('admin'),adminAllUser);
router.route('/admin/user/:id')
    .get(isLoggedIn,customRole('admin'),adminGetOneUser)
    .put(isLoggedIn,customRole('admin'),adminUpdateOneUserDetails)
    .delete(isLoggedIn,customRole('admin'),adminDeleteOneUser);

//manager route
router.route('/manager/users').get(isLoggedIn,customRole('manager'),managerAllUser);


module.exports=router;