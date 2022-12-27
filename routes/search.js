import express from "express";
import { getSearchResults } from '../controllers/search.js';

const searchRoutes = express.Router();

//get specific movie detals, by id 
searchRoutes.get("/:query", getSearchResults);

export default searchRoutes;