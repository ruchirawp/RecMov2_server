import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 5,        
        },
        likedMovies: {
            type: Array,
            default: [],  
        },
        likedShows: {
            type: Array,
            default: [],  
        },
    },
    //automatic dates and times for things are created, updated etc
    { timestamps: true }
);

const User = mongoose.model("Users", UserSchema);
export default User;