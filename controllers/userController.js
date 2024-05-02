const User = require("../model/User")
const jwt = require("jsonwebtoken")

const createJWT = (data) => {
    return jwt.sign(data, "123")
}

  
class UserController {
    async getUserInfo(req,res,next) {
        try {
            const optionUser = await User.findOne({email: req.user.email, password: req.user.password})
            if(!optionUser) return next({status:400, message: "Данный пользователь не найден"})
            return res.status(200).json({
              success:true,
              user: optionUser
            })
          } catch (e) {
            console.log(e)
            next({status:500, message: "Sever error"})
          }
    }

    

    async registerUser(req,res,next) {
        try {
            const {email, password} = req.body
            if(!email || !password) return next({status:400, message: "Введите все данные"})
            const optionUser = await User.findOne({email: email})
            if(optionUser) return next({status:400, message: "Данный пользователь уже существует"})
            const user = await User.create({email, password})
            const token = await createJWT({email: user.email, password: user.password, id: user.id})
            return res.status(200).json({
              success:true,
              user: user,
              jwt: token
            })
          } catch (e) {
            console.log(e)
            next({status:500, message: "Sever error"})
          }
    }


    async authUser(req,res,next) {
        try {
            const {email, password} = req.body
            if(!email || !password) return next({status:400, message: "Введите все данные"})
            const optionUser = await User.findOne({email: email})
            if(!optionUser) return next({status:400, message: "Данный пользователь не найден"})
            if(password !== optionUser.password) return next({status:400, message: "Пароль не верный"})
            const token = await createJWT({email: optionUser.email, password: optionUser.password, id: optionUser.id})
            return res.status(200).json({
              success:true,
              user: optionUser,
              jwt: token
            })
          } catch (e) {
            console.log(e)
            next({status:500, message: "Sever error"})
          }
    }


    
}

module.exports = new UserController()