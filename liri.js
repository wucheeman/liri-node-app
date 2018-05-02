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
const keys = dotE.parsed;

// yes, I know this is exposed in the URL
const omdbKey = keys.OMDB_KEY;

const spotify = new Spotify({
                  id: keys.SPOTIFY_ID,
                  secret: keys.SPOTIFY_SECRET
                })


var client = new Twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token_key: keys.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: keys.TWITTER_ACCESS_TOKEN_SECRET
});


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
  return moment(now).format('YYYY-MM-DD:hh:mm:ss');
};

const logItToScreenAndFile = (entry) => {
  // logs search results to screen and file
  const now = getTime();
  fs.appendFile('log.txt', now + + '\n' + entry + '\n', function (err) {
    if (err) throw err;
  });
  console.log(entry);
};

const matchSongName = (song, resp) => {
  // searches Spotify response for sone names matching song
  const songArray = [];
  for (var i = 0; i < resp.items.length; i++) {
    if (resp.items[i].name === song) {
      songArray.push(resp.items[i]);
    }
  }
  if (songArray.length === 0) {
    console.log("\nI'm sorry, I couldn't find any songs with that name.");
  } else {
    outputSongResults(songArray);
  }
};

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
};

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
};

const outputTweets = (tweets) => {
  // Channeling thoughts from Lao Tzu:
  let entry = '';
  for (var i = 0; i < tweets.length; i++) {
    entry = entry + '\nTweet ' + (i + 1) + ':\n';
    entry = entry + 'Sent: ' + tweets[i].created_at + '\n';
    entry = entry + tweets[i].full_text + '\n';
  }
  logItToScreenAndFile(entry);
};

const talkToOMDB = (movie) => {
  // handles API call to OMDB and processes the response
  const nameArray = movie.split(' ');
  let movieName = nameArray[0];
  if (nameArray.length > 1) {
    for (var i = 1; i < nameArray.length; i++) {
      movieName = movieName + '+' + nameArray[i];
    }
  }
  var queryUrl = 'http://www.omdbapi.com/?t=' + movieName + '&y=&plot=short&apikey=' + omdbKey;
  request(queryUrl, function(error, response, body) {
    if (body.indexOf('Movie not found!') > -1) {
      console.log('Sorry, I could not find a movie with that name.');
    } else if (!error && response.statusCode === 200) {
      outputMovieResults(body);
    } else {
      console.log("I'm sorry, I had a problem and could not find a movie for you.");
    }
  });
};

const talkToRandom = () => {
  // handles random decision on which API to call
  fs.readFile('random.txt', function(err, data) {
    if (err) throw err;
    const result = data.toString('utf8');
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
};

const talkToSpotify = (song) => {
  // handles API call to Spotify and processes the response
  // api documentation is at https://www.npmjs.com/package/node-spotify-api
  let resp;
  spotify.search({ type: 'track', query: song }, function(err, data) {
    if (err) {
      // console.log('Error occurred: ' + err);
    }
    resp = data.tracks;
    matchSongName(song, resp);
  });
};

const talkToTwitter = () => {
  // handles API call to Twitter and processes the response
  client.get('statuses/user_timeline.json?tweet_mode=extended&screen_name=LaoTzusGuy&count=20', function(error, tweets, response) {
    if (error) {
      throw error;
    }
    outputTweets(tweets);
  });
};

const talkToUser = () => {
  // takes user input and starts the right processing flow
  let action;
  let movie;
  let song;
  inquirer
    .prompt([{
      type: 'list',
      message: 'Liri will do these searches for you:',
      choices: ['Get your last tweets', 'Get song info', 'Get movie info', 'Get random entertainment info', 'Never mind'],
      name: 'action'
    }])
    .then(function(inquirerResponse) {
      // TODO: refactor into separate functions called when appropriate by switch 
      action = inquirerResponse.action;
      switch (action) {
      case 'Get your last tweets':
        talkToTwitter();
        break;
      case 'Get song info':
        inquirer
          .prompt([{
            type: 'input',
            message: 'What is the title of the song',
            name: 'song'
          }])
          .then(function(inquirerResponse) {
            song = inquirerResponse.song.trim();
            if (!song) {
              song = 'The Sign'; // by Ace of Base
            } else {
              song = convertToTitleCase(song);
            }
            talkToSpotify(song);
          });
        break;
      case 'Get movie info':
        inquirer
          .prompt([
            {
              type: 'input',
              message: 'What is the title of the movie?',
              name: 'movie'
            }])
          .then(function(inquirerResponse) {
            movie = inquirerResponse.movie.trim();
            if (!movie) {
              movie = 'Mr. Nobody.';
            } else {
              movie = convertToTitleCase(movie);
            }
            talkToOMDB(movie);
          });
        break;
      case 'Get random entertainment info':
        talkToRandom();
        break;
      case 'Never mind':
        console.log('OK, bye!');
        break;
      default:
        console.log('whoops, no action for that!');
      }
    }); // end of outer .then curly brackets and parens
}; // end of talkToUser()

// APP
// =============================================================================

talkToUser();