'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _nodemailerSmtpTransport = require('nodemailer-smtp-transport');

var _nodemailerSmtpTransport2 = _interopRequireDefault(_nodemailerSmtpTransport);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var transporter = _nodemailer2['default'].createTransport((0, _nodemailerSmtpTransport2['default'])({
  host: _config2['default'].host,
  auth: {
    user: _config2['default'].username,
    pass: _config2['default'].password
  }
}));

exports['default'] = function (to, title, content, cb) {
  transporter.sendMail({
    from: _config2['default'].username,
    to: to,
    subject: title,
    html: content
  }, function (err, res) {
    cb && cb(err, res);
  });
};

module.exports = exports['default'];