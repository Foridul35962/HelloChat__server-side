import dotEnv from 'dotenv'
dotEnv.config()
import nodeMailer from 'nodemailer'

const transport = nodeMailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

export default transport