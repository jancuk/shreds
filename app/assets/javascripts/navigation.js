(function (Shreds) { 'use strict';
  var name = 'navigation';
  Shreds.components.push(name);
  Shreds[name] = {
    events: {
      'shreds:markAsRead': function (ev, data) {
        if (data.error) {
          Shreds.notification.error(data.error);
        } else {
          var feed = Shreds.find('feeds', data.feed.id);
          feed.unreadCount = data.feed.unreadCount;
          Shreds.notification.info(data.info);
        }
        Shreds.syncView(name);
      },
      'shreds:create': function (ev, data) {
        if (data.error) {
          Shreds.notification.error(data.error);
        } else {
          var category = Shreds.find('categories', data.category.id);
          category.feeds = data.category.feeds;
          Shreds.notification.info(data.info);
          Shreds.syncView(name);
        }
        Shreds.subscription.stopSpinner();
      }
    },
    init: function () {
      Shreds.syncView(name);
    }
  };
})(window.Shreds);

