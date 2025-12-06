import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

//local module
import errorHandler from './utils/errorHandler.js'
import authRouter from './routers/auth.routes.js'

const app = express()

app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(urlencoded({ extended: false }))
app.use(express.json())

//routers
app.use('/api/v1/auth', authRouter)

//server working check
app.get('/', (req, res) => {
    res.send('hello chat server is running...')
})

//global error handler
app.use(errorHandler)

export default app