import axios from 'axios';
import Show from "../models/Shows.js";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";
import { getTokenFrom } from '../helperFunctions/helper.js';


//User likes a Show (add Show id to user liked[], and add the Show to the Show model)
export const addLikedShow = async (req, res) => {
  try {

    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    let email = decodedToken.email;
    const ShowId = Number(req.params.id);

    //add Show to Show model then save to mongo db 
    await axios.get(`https:api.themoviedb.org/3/tv/${ShowId}?api_key=${process.env.API_KEY}`)
      .then(async function (res) {
        const { id, tagline,name, overview, posterPath, first_air_date, number_of_episodes,number_of_seasons, vote_average, genres } = res.data;
        const newShow = new Show({
          id: id,
          tagline: tagline,
          name: name,
          overview: overview,
          poster_path: posterPath,
          first_air_date: first_air_date,
          number_of_episodes: number_of_episodes,
          number_of_seasons: number_of_seasons,
          vote_average: vote_average,
          genres: genres,
        });
        await newShow.save()
      })
      .catch(error=> {
        console.log(error, "you fucked up again in the api call ")
      })

    let likedShows = await getLikedShowsHelper(email);
    // mongoose appending data
    //first check if the Show already exists then add only if it doesnt 
    // get list of mov and then 
    if (!likedShows.includes(ShowId)){
    await User.findOneAndUpdate(
      { email: email },
      { $push: { likedShows: ShowId } }
      ).clone().catch(function(err){ console.log(err)});

      res.status(201).json({message: "Show added"})
    }
    else{
      res.status(404).json({ message: "SHOW ALREADY EXISTS" })
    }
  } catch (err) {
    res.status(404).json({ message: `error ${err}` })
  }  
}

//unlike a Show (remove from user liked list) 
export const removeLikedShow = async (req, res) => {

  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    let email = decodedToken.email;
    const ShowId = Number(req.params.id);
    
    await User.findOneAndUpdate(
      { email: email },
      { $pull: { likedShows: ShowId } }
    );

    res.status(201).json({message: "Show removed"})
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

//gets Shows for popular Shows, genre1, genre2, genre3 
export const getAllShows = async (req, res) => {
  try {

    console.log("GET ALL SHOWS")

    let popularShows = null
    let topRatedShows = null
    
  //code to make the request work with axios and not return "AxiosError: unexpected end of file"
  //   { 
  //     headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  // }

    //get popular Shows 
    await axios.get(`https:api.themoviedb.org/3/tv/popular?api_key=${process.env.API_KEY}`, { 
      headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  })
      .then(function (result) {
        popularShows = result.data.results;
      });

    // //get top rated Shows 
    await axios.get(`https:api.themoviedb.org/3/tv/top_rated?api_key=${process.env.API_KEY}`,{ 
      headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  })
    .then(function (result) {
      topRatedShows = result.data.results;
    });

    let allShows = {popularShows: popularShows, topRatedShows: topRatedShows};
    res.status(201).json(allShows)

  } catch (err) {
    res.status(404).json({ message: err.message, "error": "idk" });
  }
};

// //get Show info (call api and get destructured data for everything )
// export const getShowInfo = async (req, res) => {

//   try {
//     const ShowId = req.params.id;

//     //add Show to Show model then save to mongo db 
//     axios.get(`https:api.themoviedb.org/3/tv/${ShowId}?api_key=${process.env.API_KEY}`)
//       .then(function (result) {
//         const ShowData = result.data
//         return res.status(201).json(ShowData)
//       });

//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };

//gets the array of liked Shows for a user
const getLikedShowsHelper = async (email) => {
  const user = await User.find({ email: email });
  if (!user) {
    return res.status(400).json({
      error: 'user does not exist'
    })
  }
  let likedShows = user[0].likedShows;

  return likedShows;
}


//return the top 3 rec Shows for a given Show ID
const getRecShowsForOneShow = async (ShowId) => {

  let recShows= [];
  await axios.get(`https://api.themoviedb.org/3/tv/${ShowId}/recommendations?api_key=${process.env.API_KEY}`,{ 
    headers: { "Accept-Encoding": "gzip,deflate,compress" } 
})
  .then(function (res) {
    recShows = res.data.results;

    if(recShows.length >=3){
      recShows= recShows.slice(0,3);
    }
  }); 
  
  return recShows;
}


//get list of 15 recommended Shows 
export const getRecommendedShows = async (req, res) => {

  try {
//1. get list of liked Shows (radomize and shorten the list to length 5)
//2. get top 3 recommended for each liked Show. therefore 15 total recommented Shows 
//3. put all rec mov in an array and return them 


//1. get list of liked Shows (radomize and shorten the list to length 5)
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    
    let email = decodedToken.email;
    let tempShows= await getLikedShowsHelper(email);
    let likedShows = tempShows.sort((a, b) => 0.5 - Math.random());

    if(likedShows.length >= 5){
      likedShows = likedShows.splice(0,5);
    }
    
//2. get top 3 recommended for each of the 5 liked Shows. therefore 15 total recommended Shows 
  const getShowsUtil = async() => {
    let recShows = await Promise.all(likedShows.map( async (showId) => {
      return await getRecShowsForOneShow(showId)
      })
    )
    return recShows
  }

  let recShowsList = await getShowsUtil()
  let recCombine = []

  if(recShowsList.length >= 5){
    recCombine = [...recShowsList[0],...recShowsList[1],...recShowsList[2],...recShowsList[3],...recShowsList[4]].sort((a, b) => 0.5 - Math.random());
  }
  else{
    recShowsList.forEach((item)=>{
      recCombine.push(...item)
    })
  }
  
  //put into a set to remove the duplicates 
  recCombine = recCombine.filter((value, index, self) =>
    index === self.findIndex((t) => (
    t.id === value.id
    ))
  )
  recCombine = {recommendedShows: recCombine}

//return the rec movies in the response
res.status(200).json(recCombine);
  } catch (err) {
    // console.log(" err: ", err);
    res.status(404).json({ message: err.message });
  }
}

//get all liked Shows of a specific user
export const getLikedShows = async (req, res) => {

  try {
    //get array of all liked Shows
    //then use list to find each Show in mongo 
    //save all Shows in a object and return 
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    let email = decodedToken.email;
    let likedShows = await getLikedShowsHelper(email);

    res.status(200).json({liked: likedShows});

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}


