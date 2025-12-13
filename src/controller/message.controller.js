import { getReceiverSocketId, io } from "../app.js";
import Message from "../models/Message.models.js";
import Users from "../models/User.models.js";
import ApiErrors from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const getAllContacts = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiErrors(400, 'user id is required')
    }

    const users = await Users.find({ _id: { $ne: userId } }).select("-password -refreshToken")

    if (!users) {
        throw new ApiErrors(404, 'contacts is not found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, users, 'contacts fetched successfully')
        )
})

export const getMessagesByUserId = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiErrors(400, 'user id is required')
    }

    const {id: friendId} = req.params

    if (!friendId) {
        throw new ApiErrors(400, 'friend id is required')
    }

    const messages = await Message.find({
        $or:[
            {senderId: userId, receiverId: friendId},
            {senderId: friendId, receiverId: userId}
        ]
    })

    if (!messages) {
        throw new ApiErrors(404, 'no messages found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, messages, 'messages fetched successfully')
        )
})

export const sendMessage = asyncHandler(async (req, res) => {
    const senderId = req.user?._id
    if (!senderId) {
        throw new ApiErrors(400, 'Sender id is required')
    }

    const { id: receiverId } = req.params
    if (!receiverId) {
        throw new ApiErrors(400, 'Receiver id is required')
    }

    if (String(senderId) === String(receiverId)) {
        throw new ApiErrors(400, 'can not send message to yourself')
    }

    const receiverExists = await Users.findById(receiverId)
    if (!receiverExists) {
        throw new ApiErrors(400, 'receiver does not exists')
    }

    const { message } = req.body
    const image = req?.files?.[0]

    if (!message && !image) {
        throw new ApiErrors(400, 'Message or image is required')
    }

    let uploaded = null

    if (image) {
        uploaded = await uploadToCloudinary(image.buffer, 'hello-chat')
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text: message,
        image: uploaded?.secure_url || null
    })

    await newMessage.save()

    //todo: send message in real-time if user is online - socket.io
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId && receiverSocketId.size > 0) {
        io.to([...receiverSocketId]).emit('newMessage', newMessage)
    }

    return res.status(201).json(
        new ApiResponse(201, newMessage, 'New message added successfully')
    )
})


export const getChatPartners = asyncHandler(async(req, res)=>{
    const userId = req.user._id
    if (!userId) {
        throw new ApiErrors(400, 'user id is required')
    }

    const messages = await Message.find({
        $or:[{senderId: userId}, {receiverId:userId}]
    })

    if (!messages) {
        throw new ApiErrors(404, 'no messages found')
    }

    const chatPartnerIds = [
        ...new Set(
            messages.map((msg)=>
                msg.senderId.toString()===userId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
            )
        )
    ]

    const chatPartners = await Users.find({_id:{$in:chatPartnerIds}}).select("-password -refreshToken")

    if (!chatPartners) {
        throw new ApiErrors(404, 'chat partner not found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, chatPartners, 'chat partners fetch successfully')
        )
})