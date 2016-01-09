import * as fs from 'fs'
import * as path from 'path'

import * as babel from 'babel-core'

rm(path.join(__dirname, 'bin'))

foo('.')

function foo(file) {
  let src = path.join(__dirname, 'src', file)
  let bin = path.join(__dirname, 'bin', file)
  
  if (isFile(src)) {
    let es6 = fs.readFileSync(src).toString()
    let es5 = babel.transform(es6).code

    fs.writeFileSync(bin, es5)
  } else {
    fs.mkdirSync(bin)

    let files = fs.readdirSync(src)

    files.forEach((_file) => {
      foo(path.join(file, _file))
    })
  }
}

function isFile(path) {
  return fs.statSync(path).isFile()
}

function rm(file) {
  if (isFile(file)) {
    fs.unlinkSync(file)
  } else {
    let files = fs.readdirSync(file)

    files.forEach((_file) => {
      rm(path.join(file, _file))
    })

    fs.rmdirSync(file)
  }
}