import dotEnv from 'dotenv'
dotEnv.config()
import connectDB from './src/db/database.js'
import { server } from './src/app.js'

const PORT = process.env.PORT || 3000

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    })
}).catch((err) => {
    console.log('server connection failed: ', err);
})