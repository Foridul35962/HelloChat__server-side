import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import cookieParser from "cookie-parser"

// local imports
import errorHandler from "./utils/errorHandler.js"
import authRouter from "./routers/auth.routes.js"
import messageRouter from "./routers/message.routes.js"
import { socketAuthMiddleware } from "./middlewares/socket.js"

const app = express()
const server = http.createServer(app)

/* =======================
   EXPRESS MIDDLEWARES
======================= */

app.use(cookieParser())

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

/* =======================
   EXPRESS ROUTES
======================= */

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/message", messageRouter)

app.get("/", (req, res) => {
  res.send("hello chat server is running...")
})

/* =======================
   SOCKET.IO SETUP
======================= */

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
})

export function getReceiverSocketId(userId){
  return userSocketMap[userId]
}

// socket authentication middleware
io.use(socketAuthMiddleware)

// online users store
const userSocketMap = {} // { userId: Set<socketId> }

io.on("connection", (socket) => {
  const userId = socket.userId

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set()
  }

  userSocketMap[userId].add(socket.id)

  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  socket.on("disconnect", () => {
    userSocketMap[userId].delete(socket.id)

    if (userSocketMap[userId].size === 0) {
      delete userSocketMap[userId]
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})

/* =======================
   GLOBAL ERROR HANDLER
======================= */

app.use(errorHandler)

export { server, io }