import express from "express";
import { addLikedShow, removeLikedShow, getLikedShows, getRecommendedShows, getAllShows } from '../controllers/show.js';

const showRoutes = express.Router();

//get all the liked shows for a user 
showRoutes.get("/getliked", getLikedShows);

//get all shows for the home page 
showRoutes.get("", getAllShows);

// get rec shows for a user 
showRoutes.get("/rec", getRecommendedShows);

//like a Show for a user
showRoutes.post("/add/:id", addLikedShow);

//remove a liked Show from a user 
showRoutes.put("/remove/:id", removeLikedShow);

export default showRoutes;



