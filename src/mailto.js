import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import config from '../config'

let transporter = nodemailer.createTransport(smtpTransport({
  host: config.host,
  auth: {
    user: config.username,
    pass: config.password
  }
}))

export default function (to, title, content, cb) {
  transporter.sendMail({
    from: config.username,
    to: to,
    subject: title,
    html: content
  }, (err, res) => {
    cb && cb(err, res)
  })
}