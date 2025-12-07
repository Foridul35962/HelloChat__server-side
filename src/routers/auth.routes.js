import express from 'express'
import * as authController from '../controller/auth.controller.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import upload from '../middlewares/upload.js'
import arcjetProtection from '../middlewares/arjetCheck.js'

const auth = express.Router()

auth.post('/register', arcjetProtection, authController.registration)
auth.post('/verify-register', arcjetProtection, authController.verifyRegistration)
auth.post('/login', arcjetProtection, authController.login)
auth.post('/logout',arcjetProtection, verifyJWT, authController.logout)
auth.post('/refresh-token', authController.refreshAccessToken)
auth.patch('/update-profile',arcjetProtection, verifyJWT, upload, authController.updateProfile)
auth.get('/user', arcjetProtection, verifyJWT, authController.getUser)

export default auth