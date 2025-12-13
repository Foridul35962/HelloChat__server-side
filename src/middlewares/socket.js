import jwt from "jsonwebtoken"
import Users from "../models/User.models.js"

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token

        if (!token) {
            return next(new Error("Unauthorized: no token"))
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user = await Users.findById(decodedToken.userId)
            .select("-password -refreshToken")

        if (!user) {
            return next(new Error("User not found"))
        }

        socket.user = user
        socket.userId = user._id.toString()

        next()
    } catch (error) {
        return next(new Error(error.name === "TokenExpiredError"
            ? "Token expired"
            : "Authentication failed"
        ))
    }
}