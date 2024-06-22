const BigPromise=require('../middleware/bigPromise')

exports.home=BigPromise((req,res)=>{
    res.status(200).json({
        success:true,
        greeting:"Hello from API"
    })
});
exports.homedummy=(req,res)=>{
    res.status(200).json({
        success:true,
        greeting:"Hello from another  API"
    });
};