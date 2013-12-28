(function (Shreds) { 'use strict';
  var name = 'navigation';
  Shreds.components.push(name);
  Shreds[name] = {
    events: {
      'shreds:markAsRead': function (ev, data) {
        if (data.error) {
          Shreds.notification.error(data.error);
        } else {
          var feed = Shreds.model.find('navigation/categories/feeds', data.feed.id);
          feed.unreadCount = data.feed.unreadCount;
          Shreds.notification.info(data.info);
          Shreds.syncView(name);
        }
      },
      'shreds:create': function (ev, data) {
        reloadNavigation(data);
        Shreds.subscription.stopSpinner();
      },
      'shreds:destroy': function (ev, data) {
        reloadNavigation(data);
      },
      'shreds:rmCategory': function (ev, data) {
        reloadNavigation(data);
      },
      'shreds:opml': function (ev, data) {
        reloadNavigation(data);
        $('#fileupload').trigger('spinnerstop');
      },
      'shreds:updateFeed': function (ev, data) {
        reloadNavigation(data);
      }
    },
    init: function () {
      Shreds.syncView(name);
    },
    activate: function (feedId) {
      var model = Shreds.model.find('navigation/categories/feeds', feedId);
      model.active = ' active';
      $('.nav-item[data-feed-id='+ feedId +']').addClass('active');
    },
    deactivate: function (feedId) {
      if (feedId) {
        var model = Shreds.model.find('navigation/categories/feeds', feedId);
        model.active = false;
        $('.nav-item[data-feed-id='+ feedId +']').removeClass('active');
      } else {
        $('.nav-item').each(function (idx) {
          var model = Shreds.model.find('navigation/categories/feeds', $(this).data('feedId'));
          model.active = false;
        }).removeClass('active');
        $('.nav-header.active').removeClass('active');
      }
    }
  };

  function reloadNavigation(data) {
    if (data.error) {
      Shreds.notification.error(data.error);
    } else {
      Shreds.model.import(name, data.data);
      Shreds.syncView(name);
      Shreds.notification.info(data.info);
    }
  }
})(window.Shreds);
