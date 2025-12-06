import express from 'express'
import * as authController from '../controller/auth.controller.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import upload from '../middlewares/upload.js'

const auth = express.Router()

auth.post('/register', authController.registration)
auth.post('/verify-register', authController.verifyRegistration)
auth.post('/login', authController.login)
auth.post('/logout',verifyJWT, authController.logout)
auth.post('/refresh-token', authController.refreshAccessToken)
auth.patch('/update-profile', verifyJWT, upload, authController.updateProfile)

export default auth