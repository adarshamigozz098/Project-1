const express=require('express')

const userRouter=express()
const userController=require('../controller/userController')
const auth = require('../middleware/auth')


userRouter.set('view engine','ejs')
userRouter.set('views','./views/user')


userRouter.get('/',userController.loadHome)
userRouter.get('/shop',userController.loadShop)
userRouter.get('/single',userController.loadSingle)
userRouter.get('/about',userController.loadAbout)
userRouter.get('/contact',auth.isLogin,userController.loadContact)
userRouter.get('/checkout',auth.isLogin,userController.loadCheckout)
userRouter.get('/cart',auth.isLogin,userController.loadCart)
userRouter.get('/login',auth.isLogout,userController.loadLogin)
userRouter.post('/login',userController.verifyLogin);
userRouter.get('/signup',userController.loadSign)
userRouter.post('/signup',userController.verifySignup)
userRouter.get('/otp',userController.loadData)
userRouter.post('/otp',userController.verifyOtp)
userRouter.get('/logout',auth.isLogin,userController.logout);
userRouter.get('/productDetails',userController.loadSingle)



module.exports=userRouter



// const express=require('express');
// const userRouter=express()
// const userController=require('../controller/user_controller')

// const auth=require('../middleware/auth')

// userRouter.get("/",auth.isLogout,auth.checkBlocked,userController.loadHome)
// userRouter.get("/home",auth.isLogin,auth.checkBlocked,userController.loadHome)
// userRouter.get("/shop",auth.checkBlocked,userController.loadShop)
// userRouter.get('/about',auth.checkBlocked,userController.loadAbout)
// userRouter.get("/contact",auth.checkBlocked,userController.loadContact)
// userRouter.get('/login',auth.checkBlocked,auth.isLogout,userController.loadLogin)
// userRouter.post('/login',userController.verifyLogin)
// userRouter.get('/signup',auth.checkBlocked,userController.loadSignup)
// userRouter.post('/signup',userController.verifySignup)
// userRouter.get('/otpVerify',auth.checkBlocked,auth.isLogout,userController.loadOTP)
// userRouter.post('/otpVerify',userController.verifyOTP)
// userRouter.get('/item',auth.checkBlocked,userController.loadSingleshop)
// userRouter.get('/userLogout',auth.checkBlocked,userController.userLogout)
// userRouter.get('/forgotPassword',auth.checkBlocked,userController.forgotPass)
// userRouter.post('/forgotPassword',userController.forgotPassSendMail)

// module.exports=userRouter