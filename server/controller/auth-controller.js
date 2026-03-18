const User=require("../models/user-model");
const bcrypt=require("bcryptjs");



const register=async(req,res)=>{
    try{
        console.log(req.body)
        const {username,email,phone,password}=req.body;


        const userExist=await User.findOne({email});
        if (userExist){
            return res.status(500).json({msg:"email already exists"});

        }

        const userCreated=  await User.create({username,email,phone,password});

        res.status(201).json({msg:userCreated, token: await userCreated.generateToken(),userId:userCreated._id.toString()});     
    }
    catch(error){

res.status(500).json("register not found");


    }
}

const login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        const userExist=await User.findOne({email});
        console.log(`This is the LOGIN in auth-controllers == ${userExist}`);
        if (!userExist){
            return res.status(500).json({msg:"invalid credential"});

        }

        const user = await bcrypt.compare(password,userExist.password);
        
        if (user){
            res.status(200).json({msg:"Login successfull", token: await userExist.generateToken(),userId:userExist._id.toString()});  
        }
        else{
            return res.status(401).json({msg:"invalid email or password"});
        }

    }
    catch(error){
res.status(500).send({msg:"login error"});
    }
}


const user=async(req,res)=>{
    try{
      const userData= req.user; 
      console.log(userData);

return res.status(200).json({msg:userData});
    }
    catch(error){
res.status(500).send({msg:"user error"});
    }
}

module.exports={home,register,login,user};