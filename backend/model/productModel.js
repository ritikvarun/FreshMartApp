import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image1:{
        type:String,
        required:true
    },
    image2:{
        type:String,
        default:""
    },
    image3:{
        type:String,
        default:""
    },
    image4:{
        type:String,
        default:""
    },
    image5:{
        type:String,
        default:""
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    sizes:{
        type:Array,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    bestseller:{
        type:Boolean
    }

},{timestamps:true})

const Product = mongoose.model("Product" , productSchema)

export default Product