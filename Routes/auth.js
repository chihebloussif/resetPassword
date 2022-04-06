const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const  sendEmail  = require('../Mailers/nodeMailer');
const _ = require('lodash');
// Register Router 
router.post("/register", async (req , res ) => {


    // check if email is already exist in databse
    const emailExist = await User.findOne({email:req.body.email})
    if(emailExist) return res.status(500).send('Email already exists')
   // Hash the password
   const salt= await bcrypt.genSalt(10)
   const hashedPassword = await bcrypt.hash(req.body.password,salt)
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password:hashedPassword ,
    });
    try {
        const savedUser = await user.save()
        res.status(201).json(savedUser)
    } catch (err) {
        res.status(500).json(err)
    }
});

// Login router
router.post('/login', async (req,res)=> {

      try {
          const user = await User.findOne({email:req.body.email})
         if (!user) return res.status(401).json("Invalid Email or Password !")

           const validPass = await bcrypt.compare(req.body.password,user.password);
           if (!validPass) return res.status(401).json("Invalid Email or Password !")
      
          const accessToken = jwt.sign({id:user.id, isAdmin:user.isAdmin},process.env.JWT_SECRET);
          res.json({username:user.username,isAdmin:user.isAdmin,accessToken})
      } catch (err) {
          res.status(500).json(err);
      }
});



// Forgot-password router
router.put('/forgot-password', async (req,res)=> {

    const user = await User.findOne({email:req.body.email});
    if (!user) return res.status(400).send('User with this email does not exist !')
      try {
           const token = jwt.sign({ _id: user.id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '10m' })
           const url = `localhost:3000/password-reset/${user._id}/${token}`
           await User.updateOne({resetLink:token});
           await sendEmail(user.email,"Password Reset",url);
           res.status(200).send('password reset link has sent to your email')
          }  catch(err){
           res.status(500).send('There was a problem sending reset link')
           console.log(err)
           }
});

// Password-reset router
router.put('/reset-password', async (req,res)=> {

    const {resetLink,newPassword} = req.body;
    if(resetLink){
        jwt.verify(resetLink,process.env.RESET_PASSWORD_KEY, (error,decodeData)=>{
            if (error) {
                return res.status(401).json({
                    error:"Invalid token or expired"
                })
            }
            User.findOne({resetLink},(err,user)=>{
                if (err || !user) {
                    return res.status(400).json({error:"User with this token does not exist"})
                }
                const obj = {
                    password:newPassword,
                    resetLink:''
                }
                user = _.extend(user,obj);
                user.save((err,result)=>{
                    if(err){
                        return res.status(400).json({error:'reset password error'})
                    } else {
                        return res.status(200).json({message:'your password has been changed'})
                    }
                })
            })
        })
    }
});


module.exports = router 