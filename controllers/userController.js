const Organizations = require("../model/Organizations")
const User = require("../model/User")
const jwt = require("jsonwebtoken")

const createJWT = (data) => {
    return jwt.sign(data, "123")
}

  
class UserController {
    async getUserInfo(req,res,next) {
        try {console.log(req.user)
            const optionUser = await User.findOne({_id: req.user.id}).populate(
              "organizations"
            )
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
            const optionUser = await User.findOne({email: email}).populate(
              "organizations"
            )
            if(optionUser) return next({status:400, message: "Данный пользователь уже существует"})
            const user = await User.create({email, password})
            const token = await createJWT({email: user.email, password: user.password, id: user._id})
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
            const optionUser = await User.findOne({email: email}).populate(
              "organizations"
            )
            if(!optionUser) return next({status:400, message: "Данный пользователь не найден"})
            if(password !== optionUser.password) return next({status:400, message: "Пароль не верный"})
            const token = await createJWT({email: optionUser.email, password: optionUser.password, id: optionUser._id})
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


    async createOrganizations(req,res,next) {
      try {
        const {title, email} = req.body
        console.log(req.user)
        if(!title || !email) return next({status:400, message: "Введите все данные"})
        const user = await User.findById(req.user.id).populate(
          "organizations"
        )
        console.log(user)
        if(!user) return next({status:400, message: "Данный пользователь не найден"})
        if(user.organizations.filter(org => org.title == title).length > 0) return next({status:400, message: "Такая организация уже сущестует"})
        const newOrganization = await Organizations.create({title, email, owner: user._id })
        user.organizations.push(newOrganization.id)
        await user.save()
        const userResult = await User.findById(req.user.id).populate(
          "organizations"
        )
        return res.status(200).json({
          success:true,
          user: userResult
        })
      } catch (e) {
        console.log(e)
        next({status:500, message: "Sever error"})
      }
    }


    
    
}

module.exports = new UserController()