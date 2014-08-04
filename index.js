var url = require('url');
var util = require('util');

var rest = require('restler');
var cheerio = require('cheerio');

/////////////////////////////////
var Spotify = module.exports = {};
Spotify.uri = require('spotify-uri');
/////////////////////////////////

// Spotify data urls
Spotify.url = {
	playlist: 'https://embed.spotify.com/?uri=spotify:user:%s:playlist:%s'
}
/**
 * Lookup a spotify uri. Supports track, album, artist, playlist.
 * @param  {String}   uri Spotify URI to lookup
 * @param  {Function} cb  Callback
 */
Spotify.lookup = function(uri, extras, cb) {
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

///////////////////////////////
// MORE ADVANCED STUFF BELOW //
///////////////////////////////

/**
 * Get tracks in a playlist. Same format as an album
 * @param  {String}   user User/creator of this playlist
 * @param  {String}   id   ID of the playlist
 * @param  {Function}      cb
 * @return {Array}         Array of tracks in playlist
 */
Spotify.playlist = function(user, id, cb) {
	var tracks = [];

	var track = null;

	
	var req = rest.get(util.format(Spotify.url.playlist, user, id)).on('complete', function(result) {
		if (result instanceof Error) {
    		cb('Error: ', result.message);
    		this.retry(5000); // try again after 5 sec
  		} else {
			var tracks = [];
			var $ = cheerio.load(result);
			if($('#text').text() == ""){ //No error =D
				$('li[rel="track"]').each(function(i, el) {
					el = $(el);
					var track = {
						href: Spotify.uri.formatURI({type:'track',id: el.attr('data-track')}),
						duration: parseInt(el.attr('data-duration-ms')),
						cover: el.attr('data-ca'),
						artists: []
					};

					track.name = el.find('li.track-title').attr('rel').replace(/^\d*\. /, '');
					track.id = el.attr('data-track');

					var artists = el.find('li.artist').attr('rel').split(', ');

					for(var i = 0; i < artists.length; i++){
						track.artists[i] = artists[i];
						/*track.artists.push({
							//href: '*DEPRECATED*: embed.spotify.com does not support this anymore. See index.js for original code.', //Spotify.uri.formatURI({type:'artist',id: artistel.attr('class').match(/[\w]{22}/)[0]})
							name: artists[i]
						});*/
					}

					tracks.push(track);
				});

				var playlist = {
					playlist: {
						// spotify-uri supports parsing of playlist, but not formating -.-
						'playlist-id': ['spotify', 'user', user, 'playlist', id].join(':'),
						title: $('div.title-content').text(),
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
