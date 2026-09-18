import mongoose from "mongoose";
const connectDb = async () => {
    try {
        const dbUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
        await mongoose.connect(dbUrl);
        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB error:", error.message)
    }
    
}
export default connectDb