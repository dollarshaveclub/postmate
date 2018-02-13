const fs = require('fs')
const path = require('path')
const readme = path.join(__dirname, '/../README.md')
const data = fs.readFileSync(readme, 'utf-8')
const distSize = fs.statSync(path.join(__dirname, 'build', '../../build/postmate.min.js')).size
const updated = data.replace(
  /<span class="size">(.*?)<\/span>/,
  `<span class="size">\`${(distSize / 1024).toFixed(1)}kb\`</span>`
)
fs.writeFileSync(readme, updated)
