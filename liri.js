// @ts-check


// INITIALIZATIONS
//==============================================================================
const inquirer = require("inquirer");
const dotE = require('dotenv').config();
//console.log(dotE);
// parsed is the sole key of the dotE object
const keys = dotE.parsed;
// console.log(keys);

var request = require("request");
// yes, I know this is exposed in the URL
const omdbKey = keys.OMDB_KEY;
//console.log(omdbKey);

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
// TODO delete when replaced
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

  const outputMovieResults = (movieInfo) => {
    // what its name says
    console.log('\nI found this information for you:');
    console.log('Title: ' + JSON.parse(movieInfo).Title);
    console.log('Release Date: ' + JSON.parse(movieInfo).Released);
    console.log('IMDB rating: ' + JSON.parse(movieInfo).Ratings[0].Value);
    console.log('Rotten Tomatoes rating: ' + JSON.parse(movieInfo).Ratings[1].Value);
    console.log('Country where produced: ' + JSON.parse(movieInfo).Country);
    console.log('Language: ' + JSON.parse(movieInfo).Language);
    console.log('Plot: ' + JSON.parse(movieInfo).Plot);
    console.log('Actors: ' + JSON.parse(movieInfo).Actors);
    console.log('');
  }

const talkToOMDB = (movie) => {
  // handles API call to OMDB and processes the response
  const nameArray = movie.split(' ');
  let movieName = nameArray[0];
  if (nameArray.length > 1) {
    for (var i = 1; i < nameArray.length; i++) {
      movieName = movieName + '+' + nameArray[i];
    }
  }
  // compose the query
  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + omdbKey;
  // console.log(queryUrl);
  // make the request
  request(queryUrl, function(error, response, body) {
    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200) {
      // console.log(body); // RESUME: study this to ID correct elements!
      outputMovieResults(body);
    } else {
      console.log("I'm sorry, I had a problem and could not find a movie for you.");
    }
  });
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


// TODO: delete when fully replaced
// const talkToUser = () => {
//   // takes user input and starts the right processing flow
//   console.log('In talkToUser');
//   let action = process.argv[2];
//   // TODO: probably need to change completely when inquirer is used
//   const validInput = validateUserInput(process.argv);
//   if (!validInput) {
//     action = 'try again';
//   }
//   switch (action) {
//     case 'my-tweets':
//       console.log('retrieving tweets');
//       break;
//     case 'spotify-this-song':
//       console.log('need to retrieve a song');
//       let song = process.argv[3];
//       if (!song) {
//         console.log('no song specified');
//         song = "The Sign"; // by Ace of Base
//       }
//       // console.log('the song is: ' + song);
//       talkToSpotify(song);
//       break;
//     case 'movie-this':
//       console.log('retrieving movie');
//       let movie = process.argv[3];
//       if (!movie) {
//         console.log('no movie specified');
//         movie = 'Mr. Nobody.';
//       }
//       // console.log('the movie is: ' + movie);
//       talkToOMDB(movie);
//       break;
//     case 'do-what-it-says':
//       console.log('doing whatever');
//       break;
//     case 'try again':
//       console.log('please use double quotes around the title');
//       break;
//     case 'help':
//       console.log(initialMessage);
//       break;
//     default:
//       console.log('whoops, no action for that!');
//   }
// }

const talkToUser = () => {
  //   // takes user input and starts the right processing flow
  console.log('In talkToUser');
  let action;
  let searchterm;
  inquirer
    .prompt([
    // Here we give the user a list to choose from.
    {
      type: "list",
      message: "Liri will searches for you:",
      choices: ["Get your last tweets", "Get song info", "Get movie info", "Get random entertainment info", "Never mind"],
      name: "action"
    }])
  .then(function(inquirerResponse) {
    action = inquirerResponse.action;
    // RESUME: test whether the switch works for default choices
    console.log('you chose: ' + action);
    switch (action) {
      case "Get your last tweets":
        console.log('retrieving tweets');
        break;
      case "Get song info":
        console.log('need to retrieve a song');
        let song = process.argv[3];
        if (!song) {
          console.log('no song specified');
          song = "The Sign"; // by Ace of Base
        }
        // console.log('the song is: ' + song);
        talkToSpotify(song);
        break;
        case "Get movie info":
        console.log('retrieving movie');
        let movie = process.argv[3];
        if (!movie) {
          console.log('no movie specified');
          movie = 'Mr. Nobody.';
        }
        // console.log('the movie is: ' + movie);
        talkToOMDB(movie);
        break;
      case "Get random entertainment info":
        console.log('doing whatever');
        break;
      case "Never mind":
        console.log('OK, bye');
        break;
      default:
        console.log('whoops, no action for that!');
      }
    } // end of .then curly brackets
  ); // end of .then parens



  // give user 5 choices - the required 4 + nevermind
  // map choice into action
  // if for Twitter, call talkToTwitter
  // if for Spotify, get search term
  //    validate search term; put it into correct format; call talkToSpotify
  // if for OMDB, get search term
  //    validate search term; put it into correct format; call talkToOMDB
  // if random, do random things
  // if quit, say goodbye

  // * my-tweets - get your last 20 tweets
  // * spotify-this-song "song name" - get info on a song. Use " " around the name!
  // * movie-this "movie name" - get info on a movie.  Use " " around the name!
  // * do-what-it-says - get you random info.


} // end of talkToUser()

// TODO: delete in no longer needed
const validateUserInput = (userInput) => {
  let validInput = true;
  if (userInput.length > 4) {
    validInput = false;
  }
  return validInput;
}

const welcomeUser = () => {
  console.log(initialMessage);
}

// APP
// =============================================================================

// TODO: delete this first statement?
// welcomeUser();
talkToUser();