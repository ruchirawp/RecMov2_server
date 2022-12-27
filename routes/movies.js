import express from "express";
import { addLikedMovie, removeLikedMovie, getLikedMovies, getAllMovies, getRecommendedMovies } from '../controllers/movie.js';

const movieRoutes = express.Router();

//get liked shows for a user 
movieRoutes.get("/getliked", getLikedMovies);

//get rec mov for a user
movieRoutes.get("/rec", getRecommendedMovies);

//like a movie for a user
movieRoutes.post("/add/:id", addLikedMovie);

//remove a liked movie from a user 
movieRoutes.put("/remove/:id", removeLikedMovie);

//get all movies for the home page 
movieRoutes.get("", getAllMovies);


export default movieRoutes;

