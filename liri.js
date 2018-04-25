// @ts-check
// This turns on type checking in VS Code


// GLOBAL VARIABLES
//==============================================================================
const inquirer = require("inquirer");
const dotE = require('dotenv').config();
const Twitter = require('twitter');
const request = require("request");
const Spotify = require('node-spotify-api');
const fs = require('fs');
const moment = require('moment');

// INITIALIZATIONS
// =============================================================================
// parsed is the sole key of the dotE object
const keys = dotE.parsed;
// console.log(keys);

// yes, I know this is exposed in the URL
const omdbKey = keys.OMDB_KEY;
//console.log(omdbKey);

// console.log(Spotify);
// make new Spotify API client
//console.log('The type of the spotify id is: ' + typeof keys.SPOTIFY_ID);
const spotify = new Spotify({
                  id: keys.SPOTIFY_ID,
                  secret: keys.SPOTIFY_SECRET
                })
// console.log(spotify);

// TODO: make a new Twitter API client
var client = new Twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token_key: keys.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: keys.TWITTER_ACCESS_TOKEN_SECRET
});
//console.log(client);



// FUNCTIONS
//==============================================================================

const convertToTitleCase = (userInput) => {
  userInput = userInput.toLowerCase()
                       .replace(/ +(?= )/g,'') //regex strips out multiple spaces
                       .split(' ')
                       .map(function(word) {
                         return (word.charAt(0).toUpperCase() + word.slice(1));
                       });
  return userInput.join(' ');
}

const getTime = () => {
  // returns current time
  const now = moment();
  return moment(now).format("YYYY-MM-DD:hh:mm:ss");
}

const logItToScreenAndFile = (entry) => {
  // logs search results to screen and file
  console.log(entry);
  const now = getTime();
	fs.appendFile('log.txt', now + + '\n' + entry + '\n', function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
}

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
  let entry = '\nI found ' + referent + '\n';
  for (var i = 0; i < songArray.length; i++) {
    // TODO: template syntax would handle this better
    entry = entry + ('  * Artist(s): ' + songArray[i].artists[0].name + '\n');
    entry = entry + ('  * Song name: ' + songArray[i].name + '\n');
    entry = entry + ('  * Preview link: ' + songArray[i].external_urls.spotify + '\n');
    entry = entry + ('  * Album: ' + songArray[i].album.name + '\n\n');
  }
  logItToScreenAndFile(entry);
}

const outputMovieResults = (movieInfo) => {
  // what its name says; try/catch used in case data are missing
  let entry = '';
  entry = '\n' + entry + 'I found this movie for you: \n';
  entry = entry + 'Title: ' + JSON.parse(movieInfo).Title + '\n';
  try {
    entry = entry + 'Release Date: ' + JSON.parse(movieInfo).Released + '\n';
  } catch(error) {
    entry = entry + 'Release Date: ' + 'no data\n';
  }
  try {
    entry = entry + 'IMDB rating: ' + JSON.parse(movieInfo).Ratings[0].Value+ '\n';
  } catch(error) {
    entry = entry + 'IMDB rating: ' + 'no data\n';
  }
  try {
    entry = entry + 'Rotten Tomatoes rating: ' + JSON.parse(movieInfo).Ratings[1].Value + '\n';
  } catch(error) {
    entry = entry + 'Rotten Tomatoes rating: ' + 'no data\n';
  }
  try {
    entry = entry + 'Country where produced: ' + JSON.parse(movieInfo).Country + '\n';
  } catch(error) {
    entry = entry +  'Country where produced: ' + 'no data\n';
  }
  try {
    entry = entry + 'Language: ' + JSON.parse(movieInfo).Language + '\n';
  } catch(error) {
    entry = entry + 'Language: '+ 'no data\n';
  }
  try {
    entry = entry + 'Plot: ' + JSON.parse(movieInfo).Plot + '\n';
  } catch(error) {
    entry = entry + 'Plot: ' + 'no data\n';
  }
  try {
    entry = entry + 'Actors: ' + JSON.parse(movieInfo).Actors + '\n';
  } catch(error) {
    entry = entry + 'Actors: ' + 'no data\n';
  }
  logItToScreenAndFile(entry);
}

const outputTweets = (tweets) => {
  let entry = '\nChanneling thoughts from Lao Tzu:\n';
  for (var i = 0; i < tweets.length; i++) {
    entry = entry + '\nTweet ' + (i + 1) + ':\n';
    entry = entry + 'Sent: ' + tweets[i].created_at + '\n';
    entry = entry + tweets[i].full_text + '\n';
  }
  logItToScreenAndFile(entry);
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
      console.log(body);
      outputMovieResults(body);
    } else {
      console.log("I'm sorry, I had a problem and could not find a movie for you.");
    }
  });
}

const talkToRandom = () => {
  // handles random decision on which API to call
  fs.readFile('random.txt', function(err, data) {
    if (err) throw err;
    const result = data.toString('utf8');
    console.log(result);
    const actionSearchTermArray = result.split(',');
    const action = actionSearchTermArray[0];
    let searchTerm = actionSearchTermArray[1].trim();
    switch (action) {
      // code anticipates near future development
      case 'Get your last tweets':
        talkToTwitter();
        break;
      case 'Get song info':
        talkToSpotify(searchTerm);
        break;
      case 'Get movie info':
        talkToSpotify(searchTerm);
        break;
      default:
        console.log('oh no, this should not happen!');
      }
  });
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

const talkToTwitter = () => {
  // handles API call to Twitter and processes the response
  client.get('statuses/user_timeline.json?tweet_mode=extended&screen_name=LaoTzusGuy&count=20', function(error, tweets, response) {
    if (error) {
      throw error;
    }
    console.log (tweets[0]);
    outputTweets(tweets);
  });
}

const talkToUser = () => {
  // takes user input and starts the right processing flow
  console.log('In talkToUser');
  let action;
  let searchterm;
  inquirer
    .prompt([
    {
      type: "list",
      message: "Liri will do these searches for you:",
      choices: ["Get your last tweets", "Get song info", "Get movie info", "Get random entertainment info", "Never mind"],
      name: "action"
    }])
  .then(function(inquirerResponse) {
    // TODO: refactor into separate functions called when appropriate by switch 
    action = inquirerResponse.action;
    console.log('you chose: ' + action);
    switch (action) {
      case "Get your last tweets":
        console.log('retrieving tweets');
        talkToTwitter();
        break;
      case "Get song info":
        console.log('need to retrieve a song');
        let song;

        inquirer
        .prompt([
        {
          type: "input",
          message: "What is the title of the song",
          name: "song"
        }])
        .then(function(inquirerResponse) {
          song = inquirerResponse.song.trim();
          // console.log('the type of song is: ' + typeof song);
          if (!song) {
            console.log('no song specified');
            song = "The Sign"; // by Ace of Base
          } else {
            song = convertToTitleCase(song);
          }
          console.log('The song is: ' + song);
          talkToSpotify(song);
        });
        break;
      case "Get movie info":
        console.log('retrieving movie');
        let movie
        inquirer
        .prompt([
        {
          type: "input",
          message: "What is the title of the movie?",
          name: "movie"
        }])
        .then(function(inquirerResponse) {
          movie = inquirerResponse.movie.trim();
          if (!movie) {
            console.log('no movie specified');
            movie = 'Mr. Nobody.';
          } else {
            movie = convertToTitleCase(movie);
          }
          console.log('The movie is: ' + movie);
          talkToOMDB(movie);
        });
        break;
      case "Get random entertainment info":
        console.log('doing whatever');
        talkToRandom();
        break;
      case "Never mind":
        console.log('OK, bye');
        break;
      default:
        console.log('whoops, no action for that!');
      }
    } // end of outer .then curly brackets
  ); // end of outer .then parens
} // end of talkToUser()

// APP
// =============================================================================

talkToUser();