const User=require('../model/userModel')

const isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {  
            
            next()
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}


const isLogout = async (req, res, next) => {
    try {
        if (req.session.userId) {
           return res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error);
    }
}

const checkBlocked = async (req, res, next) => {
    const userId = req.session.userId;
    console.log(userId);

    if (userId) {
        try {
            const user = await User.findOne({ _id: userId });
            if (user && user.isBlocked === true) {
                req.session.userId=null;
                return res.redirect('/login');
            } 
        } catch (error) {
            console.log(error);
        }
    }
    next();
};

module.exports = {
    isLogin,
    isLogout,
    checkBlocked
}