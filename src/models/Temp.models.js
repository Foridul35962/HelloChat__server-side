import mongoose from "mongoose";

const tempSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    expiredOtp:{
        type: Date,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 600
    }
}, {timestamps: true})

const Temp = mongoose.model('temp', tempSchema)

export default Temp