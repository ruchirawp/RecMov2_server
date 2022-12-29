import axios from 'axios';
import jwt from "jsonwebtoken";
import Movie from "../models/Movies.js";
import User from "../models/Users.js";
import { getTokenFrom } from '../helperFunctions/helper.js';

//User likes a movie (add movie id to user liked[], and add the movie to the movie model)
export const addLikedMovie = async (req, res) => {

  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    let email = decodedToken.email;
    const movieId = Number(req.params.id);

    //add movie to movie model then save to mongo db 
    await axios.get(`https:api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`)
      .then(async function (res) {
        const { id, title, tagline, overview, posterPath, releaseDate, revenue, runtime, vote_average, genres } = res.data;
        const newMovie = new Movie({
          id: id,
          title: title,
          tagline: tagline,
          overview: overview,
          poster_path: posterPath,
          release_date: releaseDate,
          revenue: revenue,
          runtime: runtime,
          vote_average: vote_average,
          genres: genres,
        });
        await newMovie.save()
      })
      .catch(error=> {
        console.log(error, "you fucked up again in the api call ")
      })

    // mongoose appending data
    //first check if the movie already exists then add only if it doesnt 
    let likedMovies = await getLikedMoviesHelper(email);
    if (!likedMovies.includes(movieId)){
      await User.findOneAndUpdate(
        { email: email },
        { $push: { likedMovies: movieId } }
        ).clone().catch(function(err){ console.log(err)})

        res.status(201).json({message: "movie added"})

    }
    else{
      res.status(404).json({ message: "MOVIE ALREADY EXISTS" })
    }
      //to solve the MongooseError: Query was already executed error use the code above: 
      //.clone().catch(function(err){ console.log(err)})

  } catch (err) {
    res.status(404).json({ message: err.message })
  }  
}

//unlike a movie (remove from user liked list 
export const removeLikedMovie = async (req, res) => {

  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    let email = decodedToken.email;
    const movieId = Number(req.params.id);
    
    await User.findOneAndUpdate(
      { email: email },
      { $pull: { likedMovies: movieId } }
      );

    res.status(201).json({message: "movie removed"})
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

//gets movies for popular movies, genre1, genre2, genre3 
export const getAllMovies = async (req, res) => {
  try {

    let popularMovies = null
    let topRatedMovies = null
    let upcomingMovies = null
    
  //code to make the request work with axios and not return "AxiosError: unexpected end of file"
  //   { 
  //     headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  // }

  console.log("TESTING LOGGING")
  console.log(process.env.API_KEY)

    //get popular movies 
    await axios.get(`https:api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}`
    // , { headers: { "Accept-Encoding": "gzip,deflate,compress" } }
    )
      .then(function (result) {
        popularMovies = result.data.results;
      })
      .catch(error => {
        console.log("error" , error)
     })

     console.log("got popular movies")

  // //get top rated movies 
    await axios.get(`https:api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}`,{ 
      headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  })
    .then(function (result) {
      topRatedMovies = result.data.results;
    });

    //get upcoming movies  
    await axios.get(`https:api.themoviedb.org/3/movie/upcoming?api_key=${process.env.API_KEY}`,{ 
      headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  })
    .then(function (result) {
      upcomingMovies = result.data.results;
    });    

    let allMovies = {popularMovies: popularMovies,topRatedMovies:topRatedMovies,upcomingMovies:upcomingMovies}
    res.status(201).json(allMovies)

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//get movie info (call api and get destructured data for everything )
export const getMovieInfo = async (req, res) => {

  try {
    const movieId = req.params.id;

    //add movie to movie model then save to mongo db 
    axios.get(`https:api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`)
      .then(function (result) {
        const movieData = result.data
        res.status(201).json(movieData)
      });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//gets the array of liked movies for a user
const getLikedMoviesHelper = async (email) => {
  const user = await User.find({ email: email });
  if (!user) {
    return res.status(400).json({
      error: 'user does not exist'
    })
  }

  let likedMovies = user[0].likedMovies;
  return likedMovies;
}

//return the top 3 rec movies for a given movie ID
const getRecMoviesForOneMovie = async (movieId) => {

  let recMovies= [];

  await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${process.env.API_KEY}`,{ 
    headers: { "Accept-Encoding": "gzip,deflate,compress" } 
})
  .then(function (res) {
    recMovies = res.data.results;
    if(recMovies.length >=3){
      recMovies= recMovies.slice(0,3);
    }
  }); 

  return recMovies
}

//get list of 15 recommended movies(maximum) for a user 
export const getRecommendedMovies = async (req, res) => {

  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

//1. get list of liked movies (radomize and shorten the list to length 5)
//2. get top 3 recommended for each liked movie. therefore 15 total recommented movies 
//3. put all rec mov in an array and return them 

//1. get list of liked movies (radomize and shorten the list to length 5)
    let email = decodedToken.email;
    let tempMovies= await getLikedMoviesHelper(email);
    let likedMovies = tempMovies.sort((a, b) => 0.5 - Math.random());

    if(likedMovies.length >= 5){
      likedMovies = likedMovies.splice(0,5);
    }

//2. get top 3 recommended for each of the 5 liked movies. therefore 15 total recommented movies 
    const getMoviesUtil = async() => {
        let recMovies = await Promise.all(likedMovies.map( async (movieId) => {
        return await getRecMoviesForOneMovie(movieId)
        })
      )
      return recMovies
    }

    let recmovlist = await getMoviesUtil()
    let recCombine = []

    if(recmovlist.length >= 5){
      recCombine = [...recmovlist[0],...recmovlist[1],...recmovlist[2],...recmovlist[3],...recmovlist[4]].sort((a, b) => 0.5 - Math.random());
    }
    else{
      recmovlist.forEach((item)=>{
        recCombine.push(...item)
      })
    }
    
    //put into a set to remove the duplicates 
    recCombine = recCombine.filter((value, index, self) =>
      index === self.findIndex((t) => (
      t.id === value.id
      ))
    )
    recCombine = {recommendedMovies: recCombine}

    res.status(200).json(recCombine);
  } catch (err) {
    res.status(404).json({ message: err.message , "ERROR HERE": "ERORR"});
  }
}

//get all liked movies of a specific user
export const getLikedMovies = async (req, res) => {
  try {

    //get array of all liked movies
    //then use list to find each movie in mongo 
    //save all movies in a object and return 
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken.email) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    let email = decodedToken.email;
    let likedMovies = await getLikedMoviesHelper(email);

    res.status(200).json({liked: likedMovies});
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}