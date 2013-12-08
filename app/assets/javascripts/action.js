(function (Shreds) { 'use strict';
  var name = 'action';

  var actOn= {
    click: act('onClick'),
    mouseover: act('onMouseover'),
    mousedown: act('onMousedown'),
    mouseup: act('onMouseup'),
    keyup: act('onKeyup'),
    keydown: act('onKeydown')
  };

  var amOut = true;

  var $doc = $(document),
      $subscribeInput = $('#subscribeInput'),
      $subscribeForm =  $('#subscribe_form'),
      $feedUrl =        $('#feed_url'),
      $categoryName =   $('#category_name');

  var spinner = null;

  function act(attr) {
    return function (ev) {
      var $this = $(this);
      var name = $this.data(attr);
      if (!name) { return; }
      if (name === 'init') { throw 'Can\'t call init from events.' }
      return Shreds.action[name].call($this, ev);
    };
  }

  Shreds.components.push(name);
  Shreds[name] = {
    init: function () {
      for (var k in actOn) { $doc.on(k, '[data-on-' + k + ']', actOn[k]); };
    },

    markAsRead: function (ev) {
      var id = this.data('id');
      Shreds.render(this.siblings('.favicon'), 'spinner',
                    { spinner: Shreds.assets.path('spinner16x16') });
      Shreds.ajax.patch('/i/feeds/' + id + '/mark_as_read.json', {
        doWatch: true,
        failMsg: '<strong>Can\'t</strong> mark this feed as read.'
      }).fail(function () {
        Shreds.syncView('navigation');
      });
    },

    removeCategory: function (ev) {
      var id = this.data('id');
      Shreds.ajax.delete('/i/categories/' + id + '.json', {
        doWatch: true,
        failMsg: '<strong>Can\'t</strong> remove this category.'
      });
    },

    subscribeTo: function (ev) {
      if ($subscribeInput.is(':hidden')) {
        $subscribeInput.slideDown();
        $feedUrl.focus();
      } else {
        Shreds.subscription.startSpinner(this[0]);
        Shreds.ajax.post('/i/feeds.json', {
          doWatch: true,
          opts: { data: $subscribeForm.find('form').serialize() },
          failMsg: '<strong>Can\'t</strong> add feed at the moment.'
        }).fail(function () { Shreds.subscription.stopSpinner(); });
        $feedUrl.val('');
        $categoryName.val('');
        $subscribeInput.slideUp();
      }
      ev.preventDefault();
    },

    toggleRead: function (ev) {
      var id = this.data('id');
      var feedId = this.data('feedId');
      Shreds.ajax.patch('/i/feeds/' + feedId + '/' + id + '/toggle_read.json', {
        failMsg: '<strong>Can\'t mark</strong> this item as read.'
      }).done(function (data) {
        var feed = Shreds.find('navigation/categories/feeds', feedId);
        feed.unreadCount = data.feed.unreadCount;
        Shreds.syncView('navigation');
        this.find('.glyphicon').toggleClass('glyphicon-ok-circle').toggleClass('glyphicon-ok-sign');
        Shreds.notification.info(data.info);
      }.bind(this));
    },

    unsubscribe: function (ev) {
      var id = this.data('id');
      Shreds.ajax.delete('/i/feeds/' + id + '.json', {
        doWatch: true,
        failMsg: '<strong>Can\'t</strong> unsubscribe to this feed.'
      });
    },

    uploadOPML: function (ev) {
      $('#fileupload').trigger('click');
    },

    needSlideUp: function (ev) {
      if ($subscribeInput.is(':visible') && amOut) {
        $subscribeInput.slideUp();
      }
    },

    amOut: function (ev) {
      if ($subscribeForm.has(ev.target).length === 0) { return amOut = true; }
      amOut = false;
    }
  };
})(window.Shreds);

