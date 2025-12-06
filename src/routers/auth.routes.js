import express from 'express'
import * as authController from '../controller/auth.controller.js'

const auth = express.Router()

auth.post('/register', authController.registration)
auth.post('/verify-register', authController.verifyRegistration)

export default auth