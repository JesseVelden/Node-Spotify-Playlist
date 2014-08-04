var spotify = require('./');

var callback = function(err, result) {
    console.log(result.playlist.tracks[6]);
}

spotify.lookup('spotify:user:spotify:playlist:6RU5ydGPBQ8fJKWAqMj8Hg', callback); //Normal spotify URI.
spotify.playlist('syknyk', '0Idyatn0m08Y48tiOovNd9', console.log); //Using username and playlist ID as parameters.
