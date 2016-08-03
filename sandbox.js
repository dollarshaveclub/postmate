const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');

// Options
const app = express();
const port = process.env.PORT || 4000;
const useSSL = fs.existsSync(path.join(__dirname, 'ssl', 'cert.pem'));
const staticPath = (folder) => express.static(path.join(__dirname, folder));

// Routes
app.use('/sandbox', staticPath('sandbox'));
app.use('/build', staticPath('build'));

// http://blog.mgechev.com/2014/02/19/create-https-tls-ssl-application-with-express-nodejs/
if (useSSL) {
  https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
  }, app).listen(port, () => console.log(`Sandbox served at https://localhost:${port}`));
} else {
  app.listen(port, () => console.log(`Sandbox served at http://localhost:${port}`));
}
