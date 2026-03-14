
const home=async(req,res)=>{
    try{
        res.status(200).send("Hello Ashu 1")
    }
    catch(error){
res.status(400).send({msg:"home not found"});
    }
}

module.exports={home};