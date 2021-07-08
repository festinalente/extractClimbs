const express = require('express');
const http2 = require('spdy');
const pug = require('pug');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//const favicon = require('serve-favicon');
const app = express();
const server_port = process.env.PORT || 8090;
const server_ip_address = '0.0.0.0' || '127.0.0.1';

global.swiftMod = (swiftmoModuleName)=>{
  const path = require('path');
  let desiredMod = path.resolve(process.env.PWD + '/swiftmo_modules/' + swiftmoModuleName);
  return require(desiredMod);
};

app.use(compression());
//app.use(favicon('./favicon.ico'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('trust proxy', 1);

app.use('/frontendStatic', express.static(__dirname + '/frontend'))
require('./routers/main')(app);

app.set('views',[__dirname + '/frontend/views', __dirname + '/backend/views']);
app.set('view engine', 'pug');
app.engine('html', require('pug').renderFile);

app.listen(server_port, server_ip_address, function () {
  console.log( `Listening on ${server_port}, server_port ${server_port}.`);
});
