//base-//Product.find()

//bigQ-//search=coder&page=2&limit=6&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199

class WhereClause{
    constructor(base,bigQ){
        this.base=base;
        this.bigQ=bigQ;
    }

    search(){
        const searchword=this.bigQ.search?{
            //add regex based search
            name:{
                $regex:this.bigQ.search,
                //i for case insensitivity
                $options:'i'
            }
        }:{};
        this.base=this.base.find({...searchword});
        //return this means object with base and bigQ both
        return this;
    }
    pager(resultperpage){
        let currentpage=1;

        //if page passed in bigQ
        if(this.bigQ.page){
            currentpage=this.bigQ.page;
        }

        const skipVal=(currentpage-1)*resultperpage;
        
        this.base=this.base.limit(resultperpage).skip(skipVal);

        return this;

    }

    filter(){
        const copyQ={...this.bigQ};
        
        //delete some values from bigQ
        delete copyQ['search'];
        delete copyQ['page'];
        delete copyQ['limit'];

        //convert copyQ into string
        let stringOfCopyQ=JSON.stringify(copyQ);
        //add regex
        stringOfCopyQ=stringOfCopyQ.replace(
            /\b(gte|lte|gt|lt)\b/g,m=>`$${m}`
            );

        let jsonOfcopyQ=JSON.parse(stringOfCopyQ);

        this.base=this.base.find(jsonOfcopyQ);
        
        return this;
    }

}

module.exports=WhereClause;