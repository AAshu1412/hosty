require("dotenv").config();  
const express=require("express");
const cors=require("cors");
const app=express();
const githubAuthRouter=require("./router/github-auth-router");
app.use(express.json());

app.use("/api/auth",githubAuthRouter);


const PORT=5000;

app.listen(PORT,()=>{
    console.log(`Port is running at ${PORT}`);
})