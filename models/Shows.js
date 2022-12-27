import mongoose from "mongoose";

const ShowSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
        },
        tagline: {
            type: String,
            default: "No tagline :("
        },
        name: {
            type: String,
            default: "No Title Given", 
        },
        overview: {
            type: String,
            default: "No overview available :("
        },
        poster_path: { 
            type: String,
            default: "../assets/noPosterImage.jpg",
        },
        first_air_date: {
            type:Date,
            default: null,
        },
        number_of_episodes: {
            type: Number,
        },
        number_of_seasons: {
            type: Number, 
        },
        vote_average: {
            type: Number, 
        },
        genres : Array,
    },
    //automatic dates and times for things are created, updated etc
    { timestamps: true }
);

const Show = mongoose.model("Show", ShowSchema);
export default Show;