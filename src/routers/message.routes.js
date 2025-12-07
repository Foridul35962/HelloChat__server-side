import express from 'express'
import * as messageController from '../controller/message.controller.js'
import verifyJWT from '../middlewares/verifyJWT.js'
import upload from '../middlewares/upload.js'
import arcjetProtection from '../middlewares/arjetCheck.js'


const message = express.Router()
message.get('/contacts', arcjetProtection, verifyJWT, messageController.getAllContacts)
message.get('/chats', arcjetProtection, verifyJWT, messageController.getChatPartners)
message.get('/:id', arcjetProtection, verifyJWT, messageController.getMessagesByUserId)
message.post('/send/:id', arcjetProtection, verifyJWT, upload, messageController.sendMessage)

export default message