import mongoose from "mongoose"; 

const connectDB = async ()=>{
    await mongoose.connect(`${process.env.MONGODB_URL}/hellochat`).then(()=>{
        console.log('database is connected');
    }).catch((err)=>{
        console.log('database connected failed',err);
    })
}

export default connectDB