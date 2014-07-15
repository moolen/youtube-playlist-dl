

module.exports = {
	playlistUrl : function( playlist ){
		return "https://gdata.youtube.com/feeds/api/playlists/"+playlist+"?v=2";
	},

	pagination: function(playlist, start){
		return "https://gdata.youtube.com/feeds/api/playlists/"+playlist+"?start-index="+start+"&amp;max-results=25&amp;v=2";
	},

	createAsyncUrls: function( playlist, numberItems ){
		var list = [],
			itemsPerRequest = 25,
			currentItems = numberItems,
			counter = Math.ceil( numberItems / itemsPerRequest ),
			i = 0;

		while( i < counter ){

			list.push( this.pagination( playlist, i * itemsPerRequest + 1) );

			i++;
		}

		return list;
	}
};