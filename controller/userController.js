const User = require("../model/userModel");
const product = require('../model/product')
const sharp = require('sharp')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const userOTPverification= require('../model/userOTPverification')



// Define the verifySignup function
const verifySignup = async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    // Your client-side validation logic
    if (username.length < 3) {
      req.flash('message', 'Username must be at least 3 characters long');
      return res.redirect('/signup');
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('message', 'Invalid email address');
      return res.redirect('/signup');
    }

    if (phone.length !== 10) {
      req.flash('message', 'Mobile number must be 10 digits');
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('message', 'Password mismatch');
      return res.redirect('/signup');
    }

    let strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      req.flash('message', 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.');
      return res.redirect('/signup');
    }

    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
      req.flash('message', 'Existing User');
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newuser = new User({
      username,
      phone,
      email,
      password: hashedPassword,
      isAdmin: 0,
      verified: false,
    });

    await newuser.save();
    await sendMail(newuser, res);
    console.log('success');
  } catch (error) {
    console.log(error);
    req.flash('message', 'An error occurred. Please try again.');
    return res.redirect('/signup');
  }
};


// const verifyLogin = async (req,res)=>{
//   try {

//     const {email , password}  = req.body;
//     const userData = await User.findOne({email:email});
    
//     if(!userData){
//       res.render('login',req.flash('User not Found'))
//     }else{
//       const passwordMatch = await bcrypt.compare(password, userData.password);

//       if(passwordMatch) {
//         req.session.userId = userData._id;
//         console.log(req.session.userId);
//         res.redirect('/');
       
//       } else {
//         res.render("login", { message: "Incorrect email and password" });
//   }
// }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });

    if (!userData) {
      req.flash('error', 'User not Found');
      return res.redirect('/login');  // Return here to exit the function after redirect
    }

    if (userData.isBlocked) {
      req.flash('error', 'User is blocked');
      return res.redirect('/login');  // Return here to exit the function after redirect
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    
    if (!passwordMatch) {
      req.flash('message', 'Password does not match');
      console.log('password does not match');
      return res.redirect('/login');  
    }

  
    req.session.userId = userData._id;
    console.log(req.session.userId);
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
    req.flash('error', 'Internal Server Error');
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// C
const sendMail = async ({ email }, res) => {
  try {
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: true,
          auth: {
              user: "pa772250@gmail.com",
              pass: "ozsq enxc hswi rvzt"
          }
      })
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`


      const mailOption = {
          from: "pa772250@gmail.com",
          to: email,
          subject: "Verify Your Email",
          html: `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0; background-color: #c7ecc7; border-radius: 8px;">
            <div style="border-bottom: 1px solid #eee;">
            <a href="hidden" style="font-size: 1.4em; color: #4caf50; text-decoration: none; font-weight: 600;">MINI SHOP</a>
          </div>
            <p style="font-size: 1.1em;">Hi,</p>
            <p>Thank you for choosing MINI SHOP. Use the following OTP to complete your Sign Up procedures. OTP is valid for 2 minutes</p>
            <h2 style="background: #4caf50; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
            <p style="font-size: 0.9em;">Regards,<br />MINI SHOP</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
              <p>MINI SHOP Inc</p>
              <p>MALAPPURAM 670692</p>
              <p>India</p>
            </div>
          </div>
        </div>`
      }

      const hashedOTP = await bcrypt.hash(otp, 10);
      const newOTPverification = await new userOTPverification({
          email: email,
          otp: hashedOTP,
          createdAt: Date.now(),
          expiresAt: Date.now() + 60000
      })

      await newOTPverification.save();
      await transporter.sendMail(mailOption);
      console.log(`OTP send for ${email} will be deleted in 1 minutes`);
      setTimeout(async () => {
          await userOTPverification.deleteOne({ email: email });
          console.log(`OTP for ${email} has been deleted after 1 minutes.`);
      }, 60000);


      res.redirect(`/otp?email=${email}`);

  } catch (error) {
      console.log(error);
  }
}

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error);
  }
};

const ITEMS_PER_PAGE = 3;

// ... Other code ...

const loadShop = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    let query = {};

    // Check if there is a search query in the request
    if (req.query.search) {
      // Case-insensitive search by product name
      query = { name: { $regex: new RegExp(req.query.search, 'i') } };
    }

    let sortOption = {};

    // Check the selected sorting option for price
    if (req.query.sort === 'lowToHigh') {
      sortOption = { price: 1 }; // Sort by price in ascending order
    } else if (req.query.sort === 'highToLow') {
      sortOption = { price: -1 }; // Sort by price in descending order
    }

    const totalProducts = await product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const productData = await product
      .find(query)
      .sort(sortOption) // Apply the price sorting option
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .exec();

    // Pass sorting information to the view
    res.render("shop", {
      product: productData,
      currentPage: page,
      totalPages: totalPages,
      sort: req.query.sort, // Pass the sort option to the view
    });
  } catch (error) {
    console.log(error);
  }
};

// ... Other code ...






const loadSingle= async(req,res)=>{
  try {
    const id = req.query.id
    const productData = await product.findOne({_id:id})
    console.log(productData);
    res.render('productDetails',{product:productData})
  } catch (error) {
    console.log(error);
  }
}

const loadAbout = async (req, res) => {
  try {
    res.render("about");
  } catch (error) {
    console.log(error);
  }
};


const loadContact = async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.log(error);
  }
};


const loadCheckout = async (req, res) => {
  try {
    res.render("checkout");
  } catch (error) {
    console.log(error);
  }
};


const loadCart = async (req, res) => {
  try {
    res.render("cart");
  } catch (error) {
    console.log(error);
  }
};


const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};


const loadSign = async (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error);
  }
};


const loadData = async (req, res) => {
  try {
    const {email} = req.query;
    res.render("otp",{email});
  } catch (error)
   {

  }
};


const verifyOtp= async(req,res)=>{
  try {
   const { email, otp } = req.body;
    const user = await userOTPverification.findOne({email:email});

    const hashedOtp = user.otp;

    const otpVerified = await bcrypt.compare(otp,hashedOtp);
    // console.log(otpVerified);
    if(otpVerified === true){
      await User.findOneAndUpdate({email:email},{verified:true});
      await userOTPverification.deleteOne({email:email});

      res.redirect('/login');
    }else{
      res.render('otp',{message:"otp is incorrect",email});
      
    }
  } catch (error) {
    
  }
}


const logout = async(req,res)=>{
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  loadHome,
  loadShop,
  loadAbout,
  loadContact,
  loadCheckout,
  loadCart,
  loadLogin,
  loadSign,
  loadData,
  verifySignup,
  verifyOtp,
  verifyLogin,
  logout,
  loadSingle
};
