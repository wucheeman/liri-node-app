// @ts-check


// INITIALIZATIONS
//==============================================================================
const inquirer = require("inquirer");
const dotE = require('dotenv').config();
const Twitter = require('twitter');
const request = require("request");


// parsed is the sole key of the dotE object
const keys = dotE.parsed;
// console.log(keys);

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
var client = new Twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token_key: keys.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: keys.TWITTER_ACCESS_TOKEN_SECRET
});
//console.log(client);


// GLOBAL VARIABLES
//==============================================================================

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
  // what its name says; try/catch used in case data are missing
  console.log('\nI found this information for you:');
  console.log('Title: ' + JSON.parse(movieInfo).Title);
  try {
    console.log('Release Date: ' + JSON.parse(movieInfo).Released);
  } catch(error) {
    console.log('Release Date: ' + 'no data');
  }
  try {
    console.log('IMDB rating: ' + JSON.parse(movieInfo).Ratings[0].Value);
  } catch(error) {
    console.log('IMDB rating: ' + 'no data');
  }
  try {
    console.log('Rotten Tomatoes rating: ' + JSON.parse(movieInfo).Ratings[1].Value);
  } catch(error) {
    console.log('Rotten Tomatoes rating: ' + 'no data');
  }
  try {
    console.log('Country where produced: ' + JSON.parse(movieInfo).Country);
  } catch(error) {
    console.log( 'Country where produced: ' + 'no data');
  }
  try {
    console.log('Language: ' + JSON.parse(movieInfo).Language);
  } catch(error) {
    console.log('Language: '+ 'no data');
  }
  try {
    console.log('Plot: ' + JSON.parse(movieInfo).Plot);
  } catch(error) {
    console.log( 'Plot: ' + 'no data');
  }
  try {
    console.log('Actors: ' + JSON.parse(movieInfo).Actors);
  } catch(error) {
    console.log( 'Actors: ' + 'no data');
  }
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
      console.log(body);
      outputMovieResults(body);
    } else {
      console.log("I'm sorry, I had a problem and could not find a movie for you.");
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

const talkToRandom = () => {
  // handles random decision on which API to call
}

const talkToTwitter = () => {
  // handles API call to Twitter and processes the response
  // this argument worked
  // 'statuses/user_timeline.json?screen_name=twitterapi&count=2'
  client.get('statuses/user_timeline.json?screen_name=LaoTzusGuy&count=2', function(error, tweets, response) {
    if (error) {
      throw error;
    }
    console.log(tweets[0].text);  // The favorites. 
    // console.log(response);  // Raw response object. 
  });
  // client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response) {
  //   console.log(tweets.statuses[0].text);
  // });
}

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
          song = inquirerResponse.song;
          // console.log('the type of song is: ' + typeof song);
          if (!song) {
            console.log('no song specified');
            song = "The Sign"; // by Ace of Base
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
          movie = inquirerResponse.movie;
          if (!movie) {
            console.log('no movie specified');
            movie = 'Mr. Nobody.';
          }
          console.log('The movie is: ' + movie);
          talkToOMDB(movie);
        });
        break;
      case "Get random entertainment info":
        console.log('doing whatever');
        // TODO
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