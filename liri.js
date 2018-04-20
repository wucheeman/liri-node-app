
// INITIALIZATIONS
//==============================================================================
const dotE = require('dotenv').config();
//console.log(dotE);
// parsed is the sole key of the dotE object
const keys = dotE.parsed;
// console.log(keys);

const Spotify = require('node-spotify-api');
// console.log(Spotify);
// make new Spotify API client
//console.log('The type of the spotify id is: ' + typeof keys.SPOTIFY_ID);
const spotify = new Spotify({
                  id: keys.SPOTIFY_ID,
                  secret: keys.SPOTIFY_SECRET
                })
// console.log(spotify);

// TODO: make a new Twitter API client

// GLOBAL VARIABLES
//==============================================================================
const initialMessage = `Liri does tasks when you enter these commands:
* my-tweets - get your last 20 tweets
* spotify-this-song "song name" - get info on a song. Use " " around the name!
* movie-this "movie name" - get info on a movie.  Use " " around the name!
* do-what-it-says - get you random info.
* help - get you this message
`


// FUNCTIONS
//==============================================================================

const matchSongName = (song, resp) => {
  // searches Spotify response for sone names matching song
  console.log('in matchSongName');
  // console.log(resp);
  const songArray = [];
  for (var i = 0; i < resp.items.length; i++) {
    // console.log('Song name: ' + resp.items[i].name);
    if (resp.items[i].name === song) {
      // console.log(resp.items[i]);
        songArray.push(resp.items[i]);
    }
  }
  if (songArray.length === 0) {
    console.log(`\nI'm sorry, I couldn't find any songs with that name.`);
  } else {
    outputSongResults(songArray);
  }
}

  const outputSongResults = (songArray) => {
    // what its name says
    let referent = 'one song:\n ';
    if (songArray.length > 1) {
      referent = 'these songs: \n';
    }
    console.log('\nI found ' + referent);
    for (var i = 0; i < songArray.length; i++) {
      console.log('* Artist(s): ' + songArray[i].artists[0].name);
      console.log('* Song name: ' + songArray[i].name);
      console.log('* Preview link: ' + songArray[i].external_urls.spotify);
      console.log('* Album: ' + songArray[i].album.name);
      console.log(' ');
    }
  }

const talkToOMDB = () => {
  // handles API call to OMDB and processes the response
}

const talkToTwitter = () => {
  // handles API call to Twitter and processes the response
}

const talkToSpotify = (song) => {
  // handles API call to Spotify and processes the response
  // api documentation is at https://www.npmjs.com/package/node-spotify-api
  console.log('in talkToSpotify(). Looking for ' + song);
  let resp;
  spotify.search({ type: 'track', query: song }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    resp = data.tracks;
    console.log("The number of items in the response is: " + resp.items.length);
    matchSongName(song, resp);
    // return resp; 
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
        song = "The Sign"; // by Ace of Base
      }
      // console.log('the song is: ' + song);
      talkToSpotify(song);
      break;
    case 'movie-this':
      console.log('retrieving movie');
      break;
    case 'do-what-it-says':
      console.log('doing whatever');
      break;
    case 'help':
      console.log(initialMessage);
      break;
    default:
      console.log('whoops, no action for that!');
  }
}

const welcomeUser = () => {
  console.log(initialMessage);
}

// APP
// =============================================================================

// TODO: delete this?
welcomeUser();
talkToUser();