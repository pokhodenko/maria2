(function($, Drupal) {
  Drupal.behaviors.pm_navigation_previews_animation = function(context) {

    $("#gallery .item a").click(function() {
      console.log('here');
      $(this).parents('.item').addClass('active');
    });

    $("#gallery .item").bind("mouseover", function() {
      $(this).find('.onhover').animate({
        opacity: 1.0
      }, 150);
    }).bind("mouseleave", function() {
      $(this).find('.onhover').animate({
        opacity: 0.2

      }, 150);
    });

  };
})(jQuery, Drupal);