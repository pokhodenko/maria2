var images_storage = {};
function debug(message) {
  console.log(message + ' at ' + new Date().getTime());
}
(function($, Drupal) {

  Drupal.behaviors.pm_navigation = function(context) {
    var settings = Drupal.settings.pm_navigation;

    //$(document).on('click', '#block-menu-menu-pm-navigation a, #logo-title a, #gallery a',function (){})
    $('#block-menu-menu-pm-navigation a, #logo-title a, #gallery a').click(function(e) {
      $('#block-menu-menu-pm-navigation a, #logo-title a, #gallery a').unbind('click');
      if (typeof settings.ajax_navigation !== 'undefined' &&
          settings.ajax_navigation == true) {
        e.preventDefault();
        ajaxLoadNextPage(this);
        return false;
      }

    });

    $('#animation-placeholder').bind('fluxTransitionEnd', function(event) {
      $('#animation-placeholder').hide();
      //var img = event.data.currentImage;
      // Do something with img...
    });

    /**
     *
     */
    var ajaxLoadNextPage = function(link) {
      var navInfo = getNavigationInfo(link);
      html2canvas($(navInfo.placeholder), {onrendered: function(canvas) {
          console.log('canvas ready');
          dataIsReady('image', '#animation-placeholder', canvas);
          //images_storage[$(link).attr('href')] = canvas.toDataURL("image/png");
        },
      });
      $.ajax({
        url: '/ajax_navigation/',
        type: 'GET',
        data: {url: $(link).attr('href')},
        dataType: 'html',
        success: function(data) {
          historyPushState($(link).attr('href'), data)
          console.log('data ready')
          dataIsReady('page', navInfo.placeholder, data);
        },
        error: function() {
        }
      });
    };

    var historyPushState = function(url, data) {
      console.log($.trim($('.title', data).text()));
      var title_text = $.trim($('.title', data).text());
      var title;
      if (title_text === "") {
        title = settings.site_name
      } else {
        title = settings.site_name + " | "
          + $.trim($('.title', data).text());
      }
      document.title = title;

      history.pushState(null, null, url);
    }

    /**
     * Appends canvas to body tag then captures image and then delete placeholder with canvas.
     *
     * @param {type} canvas
     * @returns {Image}
     */
    var getImageFromCanvas = function(canvas) {
      var image = new Image();
      image.src = canvas.toDataURL("image/png");
      return image;
    };

    var getNavigationInfo = function(link) {
      return {linkType: 'page_content',
        placeholder: '#content'};
    };

    var animateNextPage = function(current_page_image) {
      $('#animation-placeholder').slideUp(500);
    };


    var image_ready = false;
    var data_ready = false;

    var dataIsReady = function(type, placeholder, data) {
      switch (type) {
        case 'image':
          $('#animation-placeholder').append(getImageFromCanvas(data));
          $('#animation-placeholder').show();
          $('#animation-placeholder').fadeOut('slow', function() {
            $(this).empty();
          });
          image_ready = true;
          break;
        case 'page':
          data_ready = true;
          break;
      }
      if (image_ready && data_ready) {
        image_ready = false;
        data_ready = false;
        dataIsReadyCallback(placeholder, data);
      }
    };

    var generateNewImage = function() {
      console.log('animation');
      html2canvas($('#content'), {onrendered: function(canvas) {
          if (typeof window.f == 'undefined') {
            $('#animation-placeholder').append(getImageFromCanvas(canvas));
            window.f = new flux.slider('#animation-placeholder', {
              pagination: false,
              autoplay: false,
            });
          } else {
            $('.fluxslider .image2').css('background', 'url('
                    + canvas.toDataURL("image/png") + ')');
            console.log('set image 2');
          }
          setTimeout(function() {
            //window.f.next();
            window.f.transition('swipe');
          }, 1)
        },
      });
    }



    var dataIsReadyCallback = function(placeholder, data) {
      if (debug)
        console.log('all ready');
      $(placeholder).html(data);
      Drupal.behaviors.pm_navigation();
      Drupal.behaviors.pm_navigation_description();
      //generateNewImage();

    };


  };

})(jQuery, Drupal);