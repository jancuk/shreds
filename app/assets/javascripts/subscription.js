function Subscription($doc) {
  var $subscribeInput = $('#subscribeInput');
  var $subscribeForm = $('#subscribe_form');
  var $feedUrl = $('#feed_url');
  var $categoryName = $('#category_name');
  var spinner = null;
  var amOut = true;

  $('#btnSubmitFeed').on('click', function (e) {
    if ($subscribeInput.is(':hidden')) {
      $subscribeInput.slideDown();
      $feedUrl.focus();
    } else {
      spinner = Ladda.create(this);
      spinner.start();
      $.ajax('/i/feeds.json', {
        method: 'POST',
        data: {
          'feed[url]': $feedUrl.val(),
          'category[name]': $categoryName.val()
        }
      }).done(function (data) {
        if (data && data.watch) {
          $doc.trigger('shreds:addWatch', data.watch);
        }
      });
      $feedUrl.val('');
      $categoryName.val('');
    }
    e.stopPropagation();
    return false;
  });

  $doc.on('mousedown', function (e) {
    if (!$subscribeInput.is(':hidden') && amOut) {
      $subscribeInput.slideUp();
    }
  });

  $doc.on('mouseover', function (e) {
    if ($subscribeForm.has(e.target).length === 0) {
      amOut = true;
      return;
    }
    amOut = false;
  });

  $doc.on('shreds:subscription:spinner:stop', function () {
    try {
      spinner.stop();
    } catch(e) { }
  });
}
