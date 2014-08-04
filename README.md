Node.js - Spotify Playlist Data
=====================

Get all data from a **public** Spotify Playlist without authentication. Based on [node-spotify-data](https://github.com/MiniGod/node-spotify-data).

##### Dependencies

This project depends on [restler](https://github.com/danwrong/restler) to make HTTP(S) requests, [spotify-uri](https://github.com/TooTallNate/spotify-uri) for converting Spotify URI's and [cheerio](https://github.com/cheeriojs/cheerio).

## Install

`npm install spotify-playlist --save`

## Usage

```javascript
var spotify = require('spotify-playlist');

var callback = function(err, result) {
    console.log(result.playlist.tracks);
}

spotify.lookup('spotify:user:spotify:playlist:6RU5ydGPBQ8fJKWAqMj8Hg', callback); //Normal spotify URI.
spotify.playlist('syknyk', '0Idyatn0m08Y48tiOovNd9', console.log); //Using username and playlist ID as parameters.
```
