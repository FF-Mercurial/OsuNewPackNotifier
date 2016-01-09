'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _mailto = require('./mailto');

var _mailto2 = _interopRequireDefault(_mailto);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var PACK_LIST_URL = 'http://osu.ppy.sh/p/packlist';
var INTERVAL = 1000 * 60;

var lastPacks = undefined;

function getPacks(cb) {
  (0, _request2['default'])({
    method: 'get',
    url: PACK_LIST_URL,
    timeout: 10000
  }, function (err, res, body) {
    if (err) return cb(err);

    var $ = _cheerio2['default'].load(body);
    var trs = $('.beatmapListing tr');
    var packs = trs.filter(function (i, el) {
      var $el = $(el);

      return $el.hasClass('row1p') || $el.hasClass('row2p');
    }).map(function (i, el) {
      var $el = $(el);

      return {
        name: $el.find('td').eq(0).text(),
        time: $el.find('td').eq(1).text()
      };
    }).get();

    cb(undefined, packs);
  });
}

function foo(interval) {
  console.log('getting packs...');

  getPacks(function (err, curPacks) {
    setTimeout(function () {
      foo(interval);
    }, interval);

    if (err) return console.log(err);

    if (lastPacks) {
      var newPacks = diff(lastPacks, curPacks);

      if (newPacks.length > 0) {
        console.log(newPacks);
        notify(newPacks);
      } else {
        console.log('no new packs.');
      }
    }

    lastPacks = curPacks;
  });
}

function diff(lastPacks, curPacks) {
  var res = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function () {
      var pack = _step.value;

      if (!contain(lastPacks, function (_pack) {
        return pack.name === _pack.name;
      })) res.push(pack);
    };

    for (var _iterator = curPacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return res;
}

function contain(list, fn) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var item = _step2.value;

      if (fn(item)) return true;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return false;
}

function notify(packs) {
  var html = '';

  html += '<p><a href="http://osu.ppy.sh/p/packlist">本次更新的' + packs.length + '个pack</a>如下:</p>';
  html += '<ol>';
  packs.forEach(function (pack) {
    html += '<li>' + pack.name + '</li>';
  });
  html += '</ol>';

  _config2['default'].notifyList.forEach(function (to) {
    (0, _mailto2['default'])(to, 'osu!更新了' + packs.length + '个新pack  --' + packs[0].time, html, function (err, res) {
      if (err) console.log(err);else console.log('notified: ' + to);
    });
  });
}

foo(INTERVAL);