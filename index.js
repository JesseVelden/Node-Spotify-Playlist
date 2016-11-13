var url = require('url');
var util = require('util');

var rest = require('restler');
var cheerio = require('cheerio');


var Spotify = module.exports = {};
Spotify.uri = require('spotify-uri');


// Spotify data urls
Spotify.url = {
	playlist: 'https://open.spotify.com/embed?uri=spotify%3Auser%3A%s%3Aplaylist%3A%s'
}

/**
 * Lookup a spotify playlist uri.
 * @param  {String}   uri Spotify URI to lookup
 * @param  {Function} cb  Callback
 */
Spotify.playlistUri = function(uri, extras, cb) {
	var parsed = typeof uri === 'string' ? Spotify.uri.parse(uri) : uri;

	// Playlist
	if (parsed.type === 'playlist') {
		Spotify.playlist(parsed.user, parsed.id, typeof extras==='function'?extras:cb);
	}
	// Everything else
	else {
		console.warn('*WARNING*: Unknown type. It only supports Spotify playlists using the default Spotify URI. Use https://github.com/thelinmichael/spotify-web-api-node to use the full Spotify Web API');
	}
}

/**
 * Get tracks in a playlist. Same format as an album
 * @param  {String}   user User/creator of this playlist
 * @param  {String}   id   ID of the playlist
 * @param  {Function}      cb
 * @return {Array}         Array of tracks in playlist
 */

Spotify.playlist = function(user, id, cb) {
	var tracks = [];

	var req = rest.get(util.format(Spotify.url.playlist, user, id)).on('complete', function(result) {
		if (result instanceof Error) {
    		cb('Error: ', result.message);
    		this.retry(5000); // try again after 5 sec
  		} else {
			var tracks = [];
			var $ = cheerio.load(result);
			if($('#text').text() == ""){ //No error =D
				$('.track-row').each(function(i, el) {
					var track = {
						"name": $(this).attr('data-name'),
						"href": $(this).attr('data-uri'),
						"artists": $(this).attr('data-artists').split(", "),
						"duration": parseInt($(this).attr('data-duration-ms')),
						"cover-640": $(this).attr('data-size-640'),
						"cover-300": $(this).attr('data-size-300'),
						"cover-64": $(this).attr('data-size-64'),
						"number": parseInt($(this).attr('data-position'))
					};

					tracks.push(track);
				});

				var playlist = {
					playlist: {
						// spotify-uri supports parsing of playlist, but not formating -.-
						'playlist-id': ['spotify', 'user', user, 'playlist', id].join(':'),
						title: $('.context-name').text().split(" by")[0].replace(/ /g, ""),
						tracks: tracks,
					},
					info: {
						type: 'playlist'
					}
				}

				cb('Result:', playlist);
			}else{
				cb('Error:', 'This playlist is empty or does not exsist');
			}
		}
	});
}
