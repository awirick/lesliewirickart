/* global define, $ */
$(function(){
	$(document).on('click', '[href="#mainNav"]', function(evt){
		evt.preventDefault();
		$('body').toggleClass('pushed');
	});

	var gallery = new Masonry( '#gallery', {
	});

	imagesLoaded('#gallery', function(){
		gallery.layout();
	});
});
