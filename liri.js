
// GLOBAL VARIABLES
//==============================================================================
const dotE = require('dotenv').config();
//console.log(dotE);
// parsed is the sole key of the dotE object
const keys = dotE.parsed;
// console.log(keys);

const Spotify = require('node-spotify-api');
// console.log(Spotify);
// make new Spotify API client
const spotify = new Spotify({
                  id: keys.SPOTIFY_ID,
                  secret: keys.SPOTIFY_SECRET
                })
// console.log(spotify);

// RESUME: make a new Twitter API client









// FUNCTIONS
//==============================================================================

const talkToOMDB = () => {
  // handles API call to OMDB and processes the response
}

const talkToRandom = () => {
  // handles API call to Twitter and processes the response
}

const talkToSpotify = () => {
  // handles API call to Spotify and processes the response

  // TODO: look at the node-spotify-api documentation!
  // https://www.npmjs.com/package/node-spotify-api
  // search is the easiest way to find info!

  // spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
  //   if (err) {
  //     return console.log('Error occurred: ' + err);
  //   }
  // });
 
// console.log(data); 
  
}

const talkToTwitter = () => {
  // handles random decision on which API to call
}

const talkToUser = () => {
  // takes user input and starts the right processing flow
}