
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
console.log('The type of the spotify id is: ' + typeof keys.SPOTIFY_ID);
const spotify = new Spotify({
                  id: keys.SPOTIFY_ID,
                  secret: keys.SPOTIFY_SECRET
                })
// console.log(spotify);

// TODO: make a new Twitter API client

// FUNCTIONS
//==============================================================================

const matchSongName = (song, resp) => {
  // searches Spotify response for sone names matching song
  console.log('in matchSongName');
  //console.log(resp);
  // const songArray = [];
  // for (var i = 0; i < resp.items.length; i++) {
  //   console.log('Song name: ' + resp.items[i].name);
  // }
}

const talkToOMDB = () => {
  // handles API call to OMDB and processes the response
}

const talkToTwitter = () => {
  // handles API call to Twitter and processes the response
}

const talkToSpotify = (song) => {
  // handles API call to Spotify and processes the response

  // node-spotify-api documentation is at
  // https://www.npmjs.com/package/node-spotify-api
  // search is easiest way to find song
  // search: function({ type: 'artist OR album OR track', query: 'My search query', limit: 20 }, callback)
  // limit is optional

  // FIRST PASS
  console.log('in talkToSpotify(). Looking for ' + song);
  // let resp;
  // spotify.search({ type: 'track', query: song }, function(err, data) {
  //   if (err) {
  //     return console.log('Error occurred: ' + err);
  //   }
  //   resp = data.tracks;
  //   console.log("The number of items in the response is: " + resp.items.length);
  //   // These take the first reponse, which doesn't necessarily
  //   // mean the song is the right song!
  //   // console.log('Artist(s): ' + resp.items[0].artists[0].name);
  //   // console.log('Song name: ' + resp.items[0].name);
  //   // console.log('Preview link: ' + resp.items[0].external_urls.spotify);
  //   // console.log('Album: ' + resp.items[0].album.name); 
  //   // return resp; 
  // });

  // SECOND PASS, WITH PROMISE
  spotify
    .search({ type: 'track', query: 'All the Small Things' })
    .then(function(response) {
      // console.log(response);
      const resp = response.tracks;
      // // album
      console.log(resp.items[0].album.name);
      //artist
      console.log(resp.items[0].artists[0].name);
      // song's URL
      console.log(resp.items[0].external_urls.spotify);
      // song's name
      console.log(resp.items[0].name);
      return response;
    })
    .catch(function(err) {
      console.log(err);
    });
}

const talkToRandom = () => {
  // handles random decision on which API to call
}

const talkToUser = () => {
  // takes user input and starts the right processing flow
  console.log('In talkToUser');
  const action = process.argv[2];
  // TODO: normalize/validate user input
  // TODO: Handle multi-word titles; Windows requires double quotes around them; need to reject input where quotes have been forgotten
  switch (action) {
    case 'my-tweets':
      console.log('retrieving tweets');
      break;
    case 'spotify-this-song':
      console.log('need to retrieve a song');
      let song = process.argv[3];
      if (!song) {
        console.log('no song specified');
        // user has not specified song; use default
        song = "The Sign"; // by Ace of Base
      }
      console.log(song);
      const resp = talkToSpotify(song);
      console.log('Back in handle user input, the response is: ' + resp);
      // matchSongName(song, resp);
      break;
    case 'movie-this':
      console.log('retrieving movie');
      break;
    case 'do-what-it-says':
      console.log('doing whatever');
      break;
    default:
      console.log('whoops, no action for that!');
  }
}

// APP
// =============================================================================

talkToUser();