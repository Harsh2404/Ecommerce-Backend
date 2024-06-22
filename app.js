const express= require('express')
const cors = require('cors');

const app=express()
const morgan = require('morgan')
const cookieParser=require('cookie-parser')
const fileUpload=require('express-fileupload')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

app.use(cors());

//regular middleware
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

//swagger docs middleware
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//morgan middleware
app.use(morgan('tiny'));

//cookie and fileupload middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
//temp check
app.set("view engine","ejs");

//import all routes here
const home=require('./route/home');
const user=require('./route/user');
const product=require('./route/product');
const order=require('./route/order');
const payment=require('./route/payment');

app.get("/signuptest", (req, res) => {
    res.render("signuptest");
});

//router middleware
app.use('/api/v1',home);
app.use('/api/v1',user);
app.use('/api/v1',product);
app.use('/api/v1',payment);
app.use('/api/v1',order);

module.exports=app;