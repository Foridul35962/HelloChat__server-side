import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/AsyncHandler.js'
import ApiErrors from '../utils/ApiError.js'
import Users from '../models/User.models.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiErrors(401, "Unathorization request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiErrors(401, "Wrong access token")
        }

        const user = await Users.findById(decodedToken.userId).select("-password -refreshToken")
        if (!user) {
            throw new ApiErrors(404, 'user not found')
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401, error.message || "Invalid Access Token")
    }
})

export default verifyJWT