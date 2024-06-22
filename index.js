const app=require('./app');
const connectWithDb = require('./config/db');
require('dotenv').config();
const cloudinary=require('cloudinary')


//connect with db
connectWithDb()

//cloudinary config
cloudinary.config({
    cloud_name:process.env.CLODINARY_NAME,
    api_key:process.env.CLODINARY_API_KEY,
    api_secret:process.env.CLODINARY_SECRET
})

app.listen(process.env.PORT,()=>{
    console.log(`server is running at port:${process.env.PORT}`); 
})