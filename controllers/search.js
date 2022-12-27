import axios from 'axios';

//get all liked movies of a specific user
export const getSearchResults = async (req, res) => {
    try {
      const { query } = req.params;
      let searchResults = null
  
      //use multi search api call to call page one 
      //filter out people (by using the gender key)

    // //get queried movies
    await axios.get(`https://api.themoviedb.org/3/search/multi?page=1&api_key=${process.env.API_KEY}&query=${query}`)
      .then(function (result) {
        searchResults = result.data.results;
      });
      let filteredRes = searchResults.filter(function(item)
    {
    return !(item.gender);
    });
    
    return res.status(201).json(filteredRes);

    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
  
  export const testFunction = (req,res) => {
    try{
      res.status(200).json({ "nice": "its working" });
    }
    catch (err){
      res.status(404).json({ err: err.message });
    }
  }