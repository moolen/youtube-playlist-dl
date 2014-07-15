var fs = require('fs'),
	urlHelper = require('./urlHelper.js'),
	ffmpeg = require('fluent-ffmpeg'),
	async = require('async'),
	request = require('request'),
	xml2js = require('xml2js'),
	ytdl = require('youtube-dl'),
	downloadDir = __dirname+'/downloads/',
	playlistTitle = null,
	videoUrlList = [],
	paginationList = [],
	totalCount = 0,
	fetchedCount = 0,
	threshold = 25;

// 1. playlist definition
var playlist = "PLKAPoEduAMh5q7PeDkrnYLu3c1bMPmogE";

// 2. initial API request to fetch number of videos,
//    build pagination urls etc...
request(urlHelper.playlistUrl(playlist), function(err, res, body){
	xml2js.parseString(body, function(err, result){
		totalCount = parseInt( result.feed['openSearch:totalResults'], 10 );
		console.log('# of videos: ' + totalCount);
		playlistTitle = result.feed.title;

		// try creating download dir
		try{
			fs.mkdirSync(downloadDir);
		}catch(e){

		}

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
						console.log(err, result, body);
					}
					
					cb();
				});
			});
		// ..when we got all video urls..
		}, function(err){
			console.log('# got '+videoUrlList.length+' of '+totalCount+' video URLs.');
			console.log('# starting video download...');
			startDownload();
		});
	});

});

// 3. download videos and convert to mp3
function startDownload(){
	var i = 0;
	// init vidoe streams
	async.eachLimit(videoUrlList, threshold, function(url, cb){
		var videoStream = ytdl(url, [], { cwd: downloadDir });
		i++;

		// quick-and dirty closure for i 
		(function(videoStream, i){
			videoStream.on('info', function(info){
				var fname = pad(i, totalCount.toString().length)+info.filename.replace(/-[^-]*$/,'')+'.mp3';
				console.log('Starting conversion for '+ fname );
				ffmpeg()
				.input(this)
				.noVideo()
				.audioBitrate('256k')
				.audioChannels(2)
				.audioCodec('libmp3lame')				// replace filename-<youtube-id>.mp4 with mp3
				.output( downloadDir+playlistTitle+'/'+fname)
				.on('end', function(){
					console.log('finished conversion for ' + fname);
					cb();
				}).run();
			});
		}(videoStream, i));

		videoStream.on('error', function(err){
			console.log('####################');
			console.log(err);
			console.log('####################');
		});
		
	}, function(err){
		console.log(err);
		console.log('done with all downloads!');
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

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}