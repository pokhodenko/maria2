(function($, Drupal) {
  Drupal.behaviors.pm_navigation_description = function(context) {

    $("#gallery #current").bind("mouseenter", function() {
      $('#image-info').slideDown("fast");
    }).bind("mouseleave", function() {
      $('#image-info').slideUp("fast");
    });
    
  };
})(jQuery, Drupal);