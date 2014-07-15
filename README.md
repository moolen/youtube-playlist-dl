# YOUTUBE-PLAYLIST-DL
This app downloads a youtuble playlist and saves it as .mp3 file.

## dependencies
you need to install nodejs to run the application, FFMPEG and libmp3lame to encode the video to mp3.

## installation
```
> git clone https://github.com/moolen/youtube-playlist-dl.git youtuble-downloader
> cd $_
> npm install
> node app.js
```

## configuration
edit app.js, line 17: `var playlist = "<your-playlist-id>"` to set the playlist id.
