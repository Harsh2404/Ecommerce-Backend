const mogoose=require('mongoose')


const connectWithDb=()=>{
    mogoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
           .then(console.log('db connected successfully'))
           .catch(err=>{
               console.log('db connection issue')
               console.log(err)
               process.exit(1);
           });
}

module.exports=connectWithDb;