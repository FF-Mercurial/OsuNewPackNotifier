import request from 'request'
import cheerio from 'cheerio'

import mailto from './mailto'
import config from '../config'

const PACK_LIST_URL = 'http://osu.ppy.sh/p/packlist'
const INTERVAL = 60 * 1000

let lastPacks

function getPacks(cb) {
  request({
    method: 'get',
    url: PACK_LIST_URL,
  }, (err, res, body) => {
    if (err) return cb(err)

    let $ = cheerio.load(body)
    let trs = $('.beatmapListing tr')
    let packs = trs.filter((i, el) => {
      let $el = $(el)

      return $el.hasClass('row1p') || $el.hasClass('row2p')
    }).map((i, el) => {
      let $el = $(el)

      return {
        name: $el.find('td').eq(0).text(),
        time: $el.find('td').eq(1).text(),
      }
    }).get()

    cb(undefined, packs)
  })
}

function foo(interval) {
  console.log('getting packs...')

  getPacks((err, curPacks) => {
    if (err) return console.log(err)

    if (lastPacks) {
      let newPacks = diff(lastPacks, curPacks)

      if (newPacks.length > 0) {
        console.log(newPacks)
        notify(newPacks)
      } else {
        console.log('no new packs.')
      }

      lastPacks = curPacks
    }

    setTimeout(() => {
      foo(interval)
    }, interval)
  })
}

function diff(lastPacks, curPacks) {
  let res = []

  for (let pack of curPacks) {
    if (!contain(lastPacks, (_pack) => {
      return pack.name === _pack.name
    })) res.push(pack)
  }

  return res
}

function contain(list, fn) {
  for (let item of list) {
    if (fn(item)) return true
  }

  return false
}

function notify(packs) {
  let html = ''

  html += '<p><a href="http://osu.ppy.sh/p/packlist">本次更新的' + packs.length + '个pack</a>如下:</p>'
  html += '<ol>'
  packs.forEach((pack) => {
    html += '<li>' + pack.name + '</li>'
  })
  html += '</ol>'
  
  config.notifyList.forEach((to) => {
    mailto(to, 'osu!更新了' + packs.length + '个新pack  --' + packs[0].time, html, (err, res) => {
      if (err) console.log(err)
      else console.log('notified: ' + to)
    })
  })
}

foo(INTERVAL)