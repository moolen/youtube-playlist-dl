// no, we dont need jQuery for that bit.
window.logListManager = (function(){

	var $el = document.querySelector('.loglist');

	var addtoList = function( message ){
		var $newEl = document.createElement('li');
		$newEl.innerHTML = message;
		$el.appendChild($newEl);
		// scroll down
		$el.scrollTop = $el.scrollHeight;
	};

	return {
		add: addtoList
	};
}());

window.progressBar = (function(){

	var $el = document.querySelector('.progressbar'),
		$inner = document.querySelector('.progressbar-inner');

	var set = function( msg, width ){
		$inner.style.width = width + "%";
		$inner.innerHTML = msg;
	};

	return {
		set: set
	};

}());

window.submitButton = (function(){
	
	var state = {
		clicked: false
	};

	var $button = document.querySelector('button'),
		$input = document.querySelector('input');

	var initialize = function(){
		$button.addEventListener('click', callback);
	};

	var callback = function(event){
		console.log(event);

		if( state.clicked ){
			return false;
		}

		state.clicked = true;
		$button.classList.add('disabled');

		window.initDownload( $input.value, function(err){
			state.clicked = false;
			$button.classList.remove('disabled');

			if( !err ){
				console.log('done.');
				alert('DONE! WE DID IT!');
			}
		});

	};

	initialize();

}());