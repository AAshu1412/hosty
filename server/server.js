require("dotenv").config();  
const express=require("express");
const cors=require("cors");
const app=express();
const githubAuthRouter=require("./router/github-auth-router");
const jenkinsRouter=require("./router/jenkins-router");
const authRouter=require("./router/auth-router");
const webhookRouter=require("./router/webhook-router");
const connectDb = require("./utils/db");
const errorMiddleWare = require("./middlewares/error-middleware");

const corsOptions={
    origin:"http://localhost:5173",
    methods:"GET,POST,PUT ,DELETE,PATCH,HEAD",
    credentials:true
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/github",githubAuthRouter);
app.use("/api/jenkins",jenkinsRouter);
app.use("/api/auth",authRouter);
app.use("/api/webhook",webhookRouter);

app.use(errorMiddleWare);

const PORT=5000;

connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Port is running at ${PORT}`);
    })
});