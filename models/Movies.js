import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    id: Number,
    title: String, 
    tagline: {
        type: String,
        default: "No tagline :("
    },
    overview: {
        type: String,
        default: "No overview available :("
    },
    poster_path: { 
        type: String,
        default: "../assets/noPosterImage.jpg",
    },
    release_date: {
        type:Date,
        default: null,
    },
     Revenue: {
        type: Number,
        default: null,
    },
    runtime: {
        type: Number,
        default: null,
    },
    vote_average: {
        type: Number,
        default: null,
    },
    genres : Array,
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", MovieSchema);
export default Movie;