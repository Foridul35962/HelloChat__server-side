import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hello chat server is running...')
})

export default app