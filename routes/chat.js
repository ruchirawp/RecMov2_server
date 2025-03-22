import express from "express";
import { getChatResults } from '../controllers/chat.js';
import { testFunction2 } from '../controllers/chat.js';

const chatRoutes = express.Router();

//get specific movie detals, by id 
chatRoutes.post("/message", getChatResults);
// chatRoutes.post("/message", testFunction2);

export default chatRoutes;