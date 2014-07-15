// no, we dont need jQuery for that bit.
window.logListManager = (function(){

	var el = document.querySelector('.loglist');

	var addtoList = function( message ){
		var newEl = document.createElement('li');
		newEl.innerHTML = message;
		el.appendChild(newEl);
		// scroll down
		el.scrollTop = el.scrollHeight;
	};

	return {
		add: addtoList
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

		window.initDownload( $input.value, function(err){
			state.clicked = false;
			if( !err ){
				console.log('done.');
				alert('DONE! WE DID IT!');
			}
		});

	};

	initialize();

}());