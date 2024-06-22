const express=require('express')
const router=express.Router();

const {
    addProduct,
    getAllProducts,
    adminGetAllProducts,
    getOneProduct,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getAllReviewsForOneProduct
        }=require('../controller/productcontroller');

const { isLoggedIn,customRole} = require('../middleware/user');

// router.route('/testproduct').get(testProduct);

router.route('/products').get(isLoggedIn,getAllProducts);
router.route('/product/:id').get(getOneProduct);

router.route('/review')
    .put(isLoggedIn,addReview)
router.route('/review')
    .delete(isLoggedIn,deleteReview);

router.route('/reviews').get(isLoggedIn,getAllReviewsForOneProduct);



//admin route
router.route('/admin/products').get(isLoggedIn,customRole('admin'),adminGetAllProducts);
router.route('/admin/product/add').post(isLoggedIn,customRole('admin'),addProduct); 
router.route('/admin/product/:id')
      .put(isLoggedIn,customRole('admin'),adminUpdateOneProduct)
      .delete(isLoggedIn,customRole('admin'),adminDeleteOneProduct);



module.exports=router;