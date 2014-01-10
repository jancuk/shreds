(function (Shreds) { 'use strict';
  var name = 'feeds';
  var feedView = $('.span-fixed-sidebar');
  var container = $('body,html');
  var $window = $(window);
  var _storage = {};

  Shreds.components.push(name);
  Shreds[name] = {
    init: function () { },
    events: {
      'feeds:_storage:clear': function (ev, data) {
        for (var key in _storage) { delete _storage[key]; }
      },
      'feeds:render:index': function (ev, data) {
        fetch('feeds/index', '/i/feeds.json');
      },
      'feeds:render:page': function (ev, data) {
        fetch('feeds/index', '/i/feeds/page/' + data.page + '.json');
      },
      'feed:render:show': function (ev, data) {
        fetch('feeds/show', '/i/feeds/' + data.id + '.json');
      },
      'feed:render:page': function (ev, data) {
        fetch('feeds/show', '/i/feeds/' + data.id + '/page/' + data.page + '.json');
      },
      'newsitem:render:show': function (ev, data) {
        fetch('newsitem', '/i/feeds/' + data.feed_id + '/' + data.id + '.json');
      },
      'watch:markAsRead': function (ev, data) {
        $('a[data-feed-id='+ data.feed.id +'] > span.glyphicon-ok-circle')
          .removeClass('glyphicon-ok-circle')
          .addClass('glyphicon-ok-sign')
          .data('title', 'Set unread');
      }
    }
  };

  function fetch(context, url) {
    feedView.attr('data-template', context);
    if (!_storage[url]) {
      Shreds.ajax.get(url, {
        failMsg: '<strong>Can\'t connect</strong> to server'
      }).done(function (data) {
        _storage[url] = data;
        render(context, data);
      }); return;
    }
    render(context, _storage[url]);
  }

  function render(context, data) {
    feedView.removeClass('in').addClass('fade');
    Shreds.model.import(context, data, { context: 'feeds' });
    setTimeout(function () { Shreds.syncView(context); }, 450);
    document.title = '[shreds] - ' + (data.title || 'Feeds');
    if ($window.scrollTop() > 0) {
      container.stop(true, true).animate({scrollTop: 0}, 850);
    }
    setTimeout(function () { feedView.addClass('in'); }, 450);
  }
})(window.Shreds);
