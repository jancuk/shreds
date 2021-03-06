(function (Shreds) { 'use strict';
  var name = 'navigation';
  Shreds.registerComponent(name, {
    events: {
      'watch:markAsRead': function (ev, data) {
        if (data.error) {
          Shreds.notification.error(data.error);
        } else {
          var
            feed = Shreds.model.find('navigation/categories/feeds', data.feed.id),
            category = Shreds.model.find('navigation/categories', data.feed.categoryId);

          feed.unreadCount = data.feed.unreadCount;
          Shreds.notification.info(data.info);
          Shreds.syncView('navlist_item:'+data.feed.id, feed);
          Shreds.syncView('navlist_header:'+data.feed.categoryId, category);
        }
      },
      'watch:markAllAsRead': function (ev, data) {
        if (data.error) {
          Shreds.notification.error(data.error);
        } else {
          var nav = Shreds.model.get('navigation');
          for (var c in nav.categories) {
            nav.categories[c].feeds.forEach(function (e, i, a) {
              e.unreadCount = 0;
            });
          }
          Shreds.notification.info(data.info);
          Shreds.syncView(name);
        }
      },
      'watch:create': function (ev, data) {
        reloadNavigation(data);
        Shreds.subscription.stopSpinner();
      },
      'watch:destroy': function (ev, data) {
        reloadNavigation(data);
      },
      'watch:rmCategory': function (ev, data) {
        reloadNavigation(data);
      },
      'watch:opml': function (ev, data) {
        reloadNavigation(data);
        $('#fileupload').trigger('spinnerstop');
      },
      'watch:updateFeed': function (ev, data) {
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
        delete(model.active);
        $('.nav-item[data-feed-id='+ feedId +']').removeClass('active');
      } else {
        $('.nav-item').each(function (idx) {
          var model = Shreds.model.find('navigation/categories/feeds', $(this).data('feedId'));
          delete(model.active);
        }).removeClass('active');
        $('.nav-header.active').removeClass('active');
      }
    }
  });

  function reloadNavigation(data) {
    if (data.error) {
      Shreds.notification.error(data.error);
    } else {
      Shreds.model.import(name, data.data);
      Shreds.notification.info(data.info);
      Shreds.syncView(name);
    }
  }
})(window.Shreds);

