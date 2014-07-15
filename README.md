# YOUTUBE-PLAYLIST-DL
This app downloads a youtuble playlist and saves it as single .mp3 files.

## dependencies
you need to install nodejs to run the application, FFMPEG and libmp3lame to encode the video to mp3.

## installation

use the CLI node-app:
```
> git clone https://github.com/moolen/youtube-playlist-dl.git youtuble-downloader
> cd $_
> npm install
> node app.js
```
or use the node-webkit GUI available in node-webkit branch be sure to have the nw executable in your $PATH;
More information about installation of node-webkit: https://github.com/rogerwang/node-webkit
```
git clone -b node-webkit https://github.com/moolen/youtube-playlist-dl.git youtuble-downloader
cd $_
npm install
nw .
```

## configuration
edit app.js, line 17: `var playlist = "<your-playlist-id>"` to set the playlist id.
