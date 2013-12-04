function debug(message) {
  //console.log(message);
  //console.log(' at ' + new Date().getTime());
}
var animationCompleted = true;
(function($, Drupal) {

  Drupal.behaviors.pm_navigation = function(context) {
    var settings = Drupal.settings.pm_navigation;
    var readyClass = new ReadyClass();

    var $ajaxNavigationLinks = $('#header a, #gallery a');

    $ajaxNavigationLinks.mouseover(function(e) {

      if (ajaxNavigationEnabled()) {
        var status = ajaxLinksClass.getAjaxData(this.getAttribute('href'));
        debug(status);
        if (status === 'pending') {
          return false;
        } else if (status !== 'not_started') {
          return false;
        }
        ajaxPreLoadNextPage(this);
      }
    });

    $ajaxNavigationLinks.click(function(e) {
      if (ajaxNavigationEnabled()) {
        var status = ajaxLinksClass.getAjaxData(this.getAttribute('href'));
        if (status === 'pending' || animationCompleted === false) {
          e.preventDefault();
          return false;
        }
        e.preventDefault();
        ajaxLoadNextPage(this);
        return false;
      }
    });

    var ajaxNavigationEnabled = function () {
      if (typeof settings.ajax_navigation !== 'undefined' &&
          settings.ajax_navigation == true) {
        return true;
      } else {
        return false;
      }
     }

    /**
     * On ajax links mouseenter event callback.
     * Preloads page content before user will click on link.
     */
    var ajaxPreLoadNextPage = function(link) {
      var href = link.getAttribute('href');
      $.ajax({
          url: '/ajax_navigation/',
          type: 'GET',
          data: {url: href},
          dataType: 'json',
          success: function(data) {
            ajaxLinksClass.completeAjax(href, data);
          },
          error: function() {
            ajaxLinksClass.completeAjax(link.getAttribute('href'), 'not_started');
          }
      });
    }

    /**
     * Main ajax link click callback.
     * Takes screenshot of current page.
     * Does ajax call for content.
     * If content for specified url is preloaded already takes it from cache.
     */
    var ajaxLoadNextPage = function(link) {
      animationCompleted = false;
      var href = link.getAttribute('href');
      var status = ajaxLinksClass.getAjaxData(href);
      var do_ajax = true;
      debug(status);
      if (status === 'pending') {
        return;
      }

      if (status === 'not_started') {
        ajaxLinksClass.startAjax(href);
      } else { // var status contains saved object so no need to make request.
        do_ajax = false;
      }

      var navInfo = getNavigationInfo(link);
      takeScreensotOfCurrentPage($(navInfo.placeholder), href);

      if (do_ajax) {
        $.ajax({
          url: '/ajax_navigation/',
          type: 'GET',
          data: {url: href},
          dataType: 'json',
          success: function(data) {
            readyClass.saveData('page', navInfo.placeholder, data, href);
          },
          error: function() {
          }
        });
      } else {
        //debug(status);
        readyClass.saveData(
                'page',
                navInfo.placeholder,
                status,
                href
        );
      }
    };

    /**
     * Takes screensot.
     * @param {Jquery html oblect} placeholder Content to capture image from.
     * @param {string} href relative url of next page.
     */
    var takeScreensotOfCurrentPage = function(placeholder, href) {
      debug(placeholder);
      html2canvas(placeholder, {onrendered: function(canvas) {
          readyClass.saveData('image', '#animation-placeholder', canvas, href);
        }
      });
    };

    /**
     *
     */
    var historyPushState = function(url, data) {
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

    /**
     * Animates next page.
     * Actually it animates disapearing of previous page image.
     */
    var animateNextPage = function() {
      $('#animation-placeholder').fadeOut('slow', function() {
        $(this).empty();
        animationCompleted = true;
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
    ReadyClass.prototype.saveData = function(type, placeholder, data, url) {
      debug('saving ' +type);
      switch (type) {
        case 'image':
          var image
          this.all_data.image = {'type': type, 'placeholder': placeholder, 'data': getImageFromCanvas(data),'url': url}
          this.image_ready = true;
          break;
        case 'page':
          this.all_data.page = {'type': type, 'placeholder': placeholder, 'data': data,'url': url}
          this.data_ready = true;
          break;

      }
      debug('image '+this.image_ready+' , data ' + this.data_ready);
      if (this.image_ready && this.data_ready) {
        this.image_ready = false;
        this.data_ready = false;
        dataIsReadyCallback();
      }
    };

    /**
     * Returns data previously saved by saveData function.
     * If parameter is defined, function returns image or page. If not set returns both.
     *
     * @param {string} type optional parameter object type.
     * @returns {object}
     */
    ReadyClass.prototype.getData = function(type) {
      if (typeof type === 'undefined') {
        return this.all_data;
      }
      return this.all_data[type];
    };

    /**
     * Ready callback for canvas and data. Called when both are ready.
     */
    var dataIsReadyCallback = function() {
      all_data = readyClass.getData();
      ajaxLinksClass.completeAjax(all_data.page.url, all_data.page.data);

      var image = readyClass.getData('image');
      $('#animation-placeholder').append(image.data);
      $('#animation-placeholder').show();

      setTimeout(appendNewData, 10); // Need 10 ms delay to remove white screen clip.
    };

    /**
     * Adds new page html after ajax call.
     */
    var appendNewData = function () {

      var page = readyClass.getData('page');
      debug('append new data');
      debug(page);
      $('#header').html(page.data.header);
      historyPushState(page.url, page.data.content);

      $(page.placeholder).html(page.data.content);
      animateNextPage();

      $ajaxNavigationLinks.unbind('click');
      Drupal.behaviors.pm_navigation();
      Drupal.behaviors.pm_navigation_description();
    };

  };
})(jQuery, Drupal);

/**
 * Class stores preload content.
 * @returns {AjaxLinksClass}
 */
function AjaxLinksClass() {
  this.data = new Array();
}
AjaxLinksClass.prototype.startAjax = function(url) {
  this.data[url] = 'pending';
  this.is_busy = true;
};

AjaxLinksClass.prototype.completeAjax = function(url, data) {
  debug(url);
  $('#hidden_preload_placeholder').html(data.content);
  this.data[url] = data;
};

AjaxLinksClass.prototype.getAjaxData = function(url) {
  if (typeof this.data[url] == 'undefined') {
    return 'not_started';
  } else {
    return this.data[url];
  }
};

/**
 * AjaxLinksClass instance.
 * @type AjaxLinksClass
 */
var ajaxLinksClass = new AjaxLinksClass();