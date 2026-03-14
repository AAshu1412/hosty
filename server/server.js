require("dotenv").config();  
const express=require("express");
const cors=require("cors");
const app=express();
const githubAuthRouter=require("./router/github-auth-router");

const corsOptions={
    origin:"http://localhost:5173",
    methods:"GET,POST,PUT ,DELETE,PATCH,HEAD",
    credentials:true
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/github",githubAuthRouter);


const PORT=5000;

app.listen(PORT,()=>{
    console.log(`Port is running at ${PORT}`);
})