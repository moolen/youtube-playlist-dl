var fs = require('fs'),
	urlHelper = require('./urlHelper.js'),
	ffmpeg = require('fluent-ffmpeg'),
	path = require('path'),
	async = require('async'),
	request = require('request'),
	xml2js = require('xml2js'),
	ytdl = require('youtube-dl'),
	__dirname = path.dirname(process.execPath),
	downloadDir = __dirname+'/downloads/',
	playlistTitle = null,
	videoUrlList = [],
	paginationList = [],
	totalCount = 0,
	fetchedCount = 0,
	threshold = 25;

// 1. playlist definition
// var playlist = "PLKAPoEduAMh5q7PeDkrnYLu3c1bMPmogE";

window.initDownload = function( playlist, rootCallback ){

	if( !playlist ){
		log('empty input field.');
		log('try this one: PLKAPoEduAMh5q7PeDkrnYLu3c1bMPmogE');
		return rootCallback('empty playlist');
	}

	log('initializing download...');

	// 2. initial API request to fetch number of videos,
	//    build pagination urls etc...
	request(urlHelper.playlistUrl(playlist), function(err, res, body){

		if(err || !body){
			log('no internet?');
			throw err;
		}
		xml2js.parseString(body, function(err, result){

			totalCount = parseInt( result.feed['openSearch:totalResults'], 10 );

			playlistTitle = result.feed.title;

			log('Number of videos: ' + totalCount);
			log('Playlist title: ' + result.feed.title);
			log('creating download dir: ' + downloadDir);

			// try creating download dir
			try{
				fs.mkdirSync(downloadDir);
			}catch(e){

			}

			log('creating playlist dir: ' + downloadDir+playlistTitle);
			// try creating download/<playlist> dir
			try{
				fs.mkdirSync(downloadDir+playlistTitle);
			}catch(e){
				if( e.code == 'EEXIST' ){
					rmDir(e.path+'/');
					fs.mkdirSync(downloadDir+playlistTitle);
				}
			}
			
			// ..async loop over paginated url list..
			async.each( urlHelper.createAsyncUrls(playlist, totalCount), function(url, cb){
				request(url, function(err, res, body){
					xml2js.parseString(body, function(err, result){
						if( err === null ){
							result.feed.entry.forEach(function(el, i){
								videoUrlList.push( el.link[0]['$'].href );
							});
						}else{
							log(err, result, body);
						}
						
						cb();
					});
				});
			// ..when we got all video urls..
			}, function(err){
				log('got '+videoUrlList.length+' of '+totalCount+' video URLs.');
				log('starting video download...');
				log('converting '+threshold+' at a time.');
				startDownload( rootCallback );
			});
		});

	});
};

// 3. download videos and convert to mp3
function startDownload( rootCallback ){
	var i = 0;

	log('starting download...');

	// init vidoe streams
	async.eachLimit(videoUrlList, threshold, function(url, cb){
		var videoStream = ytdl(url, [], { cwd: downloadDir });
		i++;

		// quick-and dirty closure for i 
		(function(videoStream, i){
			videoStream.on('info', function(info){
																// replace filename-<youtube-id>.mp4 with mp3
				var fname = /*pad(i, totalCount.toString().length)+*/info.filename.replace(/-[^-]*$/,'')+'.mp3';
				log('Starting transcode for '+ fname );
				ffmpeg()
				.input(this)
				.noVideo()
				.audioBitrate('256k')
				.audioChannels(2)
				.audioCodec('libmp3lame')				
				.output( downloadDir+playlistTitle+'/'+fname)
				.on('end', function(){
					log('finished transcode for ' + fname);
					cb();
				}).run();
			});
		}(videoStream, i));

		videoStream.on('error', function(err){
			console.log('####################');
			console.log(err);
			console.log('####################');
			cb();
		});
		
	}, function(err){
		log('done with all downloads!');
		rootCallback(null);
	});
}

function rmDir(dirPath){
	try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      fs.rmdirSync(dirPath);
}

function log( msg ){
	window.logListManager.add(msg);
	console.log(msg);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}