import { check, validationResult } from 'express-validator'
import asyncHandler from '../utils/AsyncHandler.js'
import ApiError from '../utils/ApiError.js'
import Users from '../models/User.models.js'
import Temp from '../models/Temp.models.js'
import transport from '../nodeMailer/config.js'
import ApiResponse from '../utils/ApiResponse.js'
import { generateVerificationMail } from '../nodeMailer/verificationEmail.js'
import { generateAccessToken, generateRefreshToken } from '../utils/token.js'

export const registration = [
    check('fullName')
        .notEmpty()
        .withMessage('full name is required'),
    check('email')
        .trim()
        .isEmail()
        .withMessage('need a valid email'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),

    asyncHandler(async (req, res) => {
        const { fullName, email, password } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiError(400, 'entered wrong value', error.array())
        }

        const dublicateUser = await Users.findOne({ email })
        if (dublicateUser) {
            throw new ApiError(400, 'this email is already registered')
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiredOtp = Date.now() + 1000 * 60 * 5
        const mailOption = generateVerificationMail(email, otp)

        await Temp.findOneAndUpdate(
            { email },
            { otp, expiredOtp, fullName, password, createdAt: Date.now() },
            { upsert: true, new: true }
        )

        try {
            await transport.sendMail(mailOption)
        } catch (error) {
            console.log(error);

            throw new ApiError(500, 'otp send failed')
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp send successfully')
            )
    })
]

export const verifyRegistration = asyncHandler(async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) {
        throw new ApiError(400, 'email and otp are required')
    }

    const alreadyUser = await Users.findOne({ email })
    if (alreadyUser) {
        throw new ApiError(400, 'user already verified')
    }

    const tempUser = await Temp.findOne({ email })

    if (!tempUser) {
        throw new ApiError(404, 'temporary user not found')
    }
    if (tempUser.otp !== String(otp)) {
        throw new ApiError(400, 'otp is not matched')
    }

    if (tempUser.expiredOtp < Date.now()) {
        throw new ApiError(400, 'otp is expired')
    }

    const user = await Users.create({
        fullName: tempUser.fullName,
        email: tempUser.email,
        password: tempUser.password,
    })
    user.password = undefined

    await Temp.findOneAndDelete({ email })

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, 'user registration successfully')
        )
})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, 'all field are required')
    }

    const user = await Users.findOne({ email })
    if (!user) {
        throw new ApiError(404, 'user is not found')
    }

    const isPassMatched = await user.isPasswordCorrect(password)
    if (!isPassMatched) {
        throw new ApiError(400, 'password is not matched')
    }

    const refreshToken = generateRefreshToken(user)
    const accessToken = generateAccessToken(user)

    user.refreshToken = refreshToken
    await user.save()

    user.refreshToken = undefined
    user.password = undefined

    const tokenOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 24 * 60 * 60 * 1000,
    }

    return res
        .status(200)
        .cookie(
            'refreshToken', refreshToken, tokenOption
        )
        .json(
            new ApiResponse(200, {user, accessToken}, 'user logged in successfully')
        )
})