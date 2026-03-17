const register=async(req,res)=>{
    try{
        console.log(req.body)
        const {username,email,phone,password}=req.body;


        const userExist=await User.findOne({email});
        if (userExist){
            return res.status(500).json({msg:"email already exists"});

        }

        const userCreated=  await User.create({username,email,phone,password});

        res.status(201).json({msg:userCreated, token: await userCreated.generateToken(),userId:userCreated._id.toString()});      // userCreated.generateToken() is getting from the user-model
        // res.status(200).json({message:req.body});
    }
    catch(error){

res.status(500).json("register not found");


    }
}

module.exports={register};