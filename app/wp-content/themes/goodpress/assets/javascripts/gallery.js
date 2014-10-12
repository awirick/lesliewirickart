/* global Masonry, $ */
$(function(){
  var gallery = new Masonry( '#gallery', {
  });

  imagesLoaded('#gallery', function(){
    gallery.layout();
  });

  $('.gallery-image').magnificPopup({type:'image'});
});
