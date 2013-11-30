var images_storage = {};
function debug(message) {
  console.log(message+' at '+new Date().getTime());
}
(function($, Drupal) {

  Drupal.behaviors.pm_navigation = function(context) {
    var settings = Drupal.settings.pm_navigation;

    $('#gallery a').click(function(e) {
      e.preventDefault();
      ajaxLoadNextPage(this);
      return false;
    });

    $('#animation-placeholder').bind('fluxTransitionEnd', function(event) {
      $('#animation-placeholder').hide();
      $('#animation-placeholder').empty();
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
      var title = settings.site_name + " | " +  $.trim($('.title', data).text());
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


    var canvas_ready = false;
    var data_ready = false;

    var dataIsReady = function(type, placeholder, data) {
      switch (type) {
        case 'image':
          //var image = getImageFromCanvas(data);
          $('#animation-placeholder').append(getImageFromCanvas(data));
          $('#animation-placeholder').show();
          canvas_ready = true;
          break;
        case 'page':
          data_ready = true;
          break;
      }
      if (canvas_ready && data_ready) {
        canvas_ready = false;
        data_ready = false;
        dataIsReadyCallback(placeholder, data);
      }
    };

    var generateNewImage = function() {
      console.log('animation');
      html2canvas($('#content'), {onrendered: function(canvas) {
          $('#animation-placeholder').append(getImageFromCanvas(canvas));
          window.f = new flux.slider('#animation-placeholder', {
            pagination: false,
            autoplay: false,
          });
          setTimeout(function() {
            //window.f.next();
            window.f.transition('pm_blocks2');
          }, 1)
        },
      });
    }



    var dataIsReadyCallback = function(placeholder, data) {
      if (debug) console.log('all ready');
      $(placeholder).html(data);
      Drupal.behaviors.pm_navigation();
      Drupal.behaviors.pm_navigation_description();
      generateNewImage();
    };


  };

})(jQuery, Drupal);