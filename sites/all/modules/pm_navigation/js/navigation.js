function debug(message) {
  console.log(message + ' at ' + new Date().getTime());
}
(function($, Drupal) {

  Drupal.behaviors.pm_navigation = function(context) {
    var settings = Drupal.settings.pm_navigation;
    var readyClass = new ReadyClass();
    var requestCompleted = true;

    $('#header a, #gallery a').click(function(e) {
      if (requestCompleted == false) {
        e.preventDefault();
        return false;
      }

      if (typeof settings.ajax_navigation !== 'undefined' &&
          settings.ajax_navigation == true) {
        e.preventDefault();
        ajaxLoadNextPage(this);
        return false;
      }

    });

    $('#animation-placeholder').bind('fluxTransitionEnd', function(event) {
      $('#animation-placeholder').hide();
    });

    /**
     *
     */
    var ajaxLoadNextPage = function(link) {
      requestCompleted = false;
      var navInfo = getNavigationInfo(link);

      html2canvas($(navInfo.placeholder), {onrendered: function(canvas) {
          readyClass.saveData('image', '#animation-placeholder', canvas);
        },
      });

      $.ajax({
        url: '/ajax_navigation/',
        type: 'GET',
        data: {url: $(link).attr('href')},
        dataType: 'html',
        complete: function() {
          requestCompleted = true;
        },
        success: function(data) {
          var header = $(data).find('#header').html();
          $('#header').html(header);
          data = $(data).find('#content').html();
          historyPushState($(link).attr('href'), data)
          readyClass.saveData('page', navInfo.placeholder, data);
        },
        error: function() {
        }
      });
    };

    $(document).ajaxComplete(function(event, xhr, settings ) {
      if (settings.url.indexOf('ajax_navigation')) {
        readyClass.dataIsReady();
      }
    });

    var historyPushState = function(url, data) {
      debug($.trim($('.title', data).text()));
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
    };

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

    var animateNextPage = function() {
      $('#animation-placeholder').fadeOut('slow', function() {
        $(this).empty();
      });
    };

    /**
     * Collects data and waits when both image and html data are ready.
     * Then calls ready callback.
     */
    function ReadyClass() {
      this.data_ready = false;
      this.image_ready = false;
      this.all_data = new Object();
    };

    /**
     * Saves imaga and content data.
     *
     * @param {string} type
     * @param {string} placeholder
     * @param {mixed} data Html content or canvas.
     */
    ReadyClass.prototype.saveData = function(type, placeholder, data) {
      switch (type) {
        case 'image':
          debug(this.all_data);
          this.all_data.image = {'type': type, 'placeholder': placeholder, 'data': getImageFromCanvas(data)}
          this.image_ready = true;
          break;
        case 'page':
          this.all_data.page = {'type': type, 'placeholder': placeholder, 'data': data}
          this.data_ready = true;
          break;

      }
    };

    /**
     * Checks that both image and page content ready.
     */
    ReadyClass.prototype.dataIsReady = function() {
      if (this.image_ready && this.data_ready) {
        this.image_ready = false;
        this.data_ready = false;
        dataIsReadyCallback();
      } else {
        setTimeout(this.dataIsReady, 10);
      }
    };

    ReadyClass.prototype.getData = function(type) {
      return this.all_data[type];
    };

    /**
     * Ready callback for canvas and data. Called when both are ready.
     */
    var dataIsReadyCallback = function() {
      var image = readyClass.getData('image');
      $('#animation-placeholder').append(image.data);
      $('#animation-placeholder').show();

      setTimeout(appendNewData, 10); // Neew 10 ms deley to remove white screen clip.
    };

    /**
     * Adds new page html after ajax call.
     */
    var appendNewData = function () {
      var page = readyClass.getData('page');
      $(page.placeholder).html(page.data);
      animateNextPage();

      $('#header a, #gallery a').unbind('click');
      Drupal.behaviors.pm_navigation();
      Drupal.behaviors.pm_navigation_description();
    };

  };
})(jQuery, Drupal);
