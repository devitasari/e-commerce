const User = require('../models/user')
const { hashPassword, checkPassword} = require('../helpers/bcrypt')
const { generateToken, verifyToken} = require('../helpers/jwt')

class UserController {

    static register(req, res, next) {
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
            .then((newUser) => {
                res.status(201).json( {newUser, message: 'success sign up'})
            }).catch(next)
    }

    static login(req, res, next) {
        if (!req.body.identity) throw {message: 'identity required'}
        if (!req.body.password) throw {message: 'password required'}
        User.findOne({
            $or: [{ name: req.body.identity }, { email: req.body.identity }]
        })
            .then((user) => {
            if (!user) throw {message: 'invalid email/password'}
            let passwordInput = req.body.password
            let passwordDb = user.password
            let isPassword = checkPassword(passwordInput, passwordDb)
            if (!isPassword) throw {message: 'invalid email/password'}
            let payload = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
            let token = generateToken(payload)
            res.status(200).json({message: 'success sign in', token, user})
            }).catch(next)
    }
}

module.exports = UserController
