import express from "express"

const router = express.Router();

router.get("/film",(req,res)=>{

    res.json({message: "Welcome to the movies page!"})
})

router.get("/hd",(req,res)=>{
    res.json({message: "Welcome to the HD movies page!"})
})


export default router;