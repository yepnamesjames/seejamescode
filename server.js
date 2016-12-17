var fileExists = require('file-exists');
var compression = require('compression');
var express = require('express');
var path = require('path');
var proxy = require('http-proxy-middleware');
var webpack = require('webpack');
var request = require('request');
var twitter = require('twitter');
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');

var port = process.env.VCAP_APP_PORT || 3001;
var NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();
app.use(compression());

console.log('Checking for keys in a .env file...');
if (fileExists('./.env')) {
  console.log('Found the keys locally.');
  var keys = require('./.env');
} else {
  console.log('Checking for keys in a user-provided service...');
  console.log('If error here, there is no way to retrieve api keys.');
  keys = JSON.parse(process.env.VCAP_SERVICES)['user-provided'][0].credentials;
};

app.get('/api/github', (req, res) => {
  request({
      url: `https://api.github.com/user/repos?affiliation=owner,collaborator&access_token=${keys.github}`,
      headers: {
        'user-agent': 'node.js'
      }
    }, (err, response, body) => {
    if (!err && response.statusCode == 200) {
      res.send(body);
    }
  });
})

app.get('/api/medium/*', (req, res) => {
  var query = req.originalUrl.replace('/api/medium/','');
  request({
      url: `https://medium.com/@${keys.username}/${query}`,
      headers: {
        'Accept': 'application/json'
      }
    }, (err, response, body) => {
    if (!err && response.statusCode == 200) {
      res.send(response.body.split('</x>').pop());
    }
  });
})

app.get('/api/twitter/*', (req, res) => {
  var query = req.originalUrl.replace('/api/twitter/','');

  new twitter(keys.twitter).get(query,
    {
      screen_name: keys.username
    }, function(error, tweets, response){
    if (!error) {
      res.send(tweets);
    }
  });
})

app.get('/api/vimeo/*', (req, res) => {
  var query = req.originalUrl.replace('/api/vimeo/','');
  request(`https://api.vimeo.com/${query}?filter_playable=true&access_token=${keys.vimeo}`, (err, response, body) => {
    if (!err && response.statusCode == 200) {
      res.send(body);
    }
  });
})

app.use('/public', express.static('public'));

if (NODE_ENV === 'production') {
  // Redirect http to https
  app.enable('trust proxy');
  app.use (function (req, res, next) {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
} else if (NODE_ENV !== 'local') {
  var portDev = process.env.VCAP_APP_PORT + 1 || 3000;
  var config = require('./webpack.config.dev');
  new webpackDevServer(webpack(config), {
    contentBase: 'dist/',
    publicPath: '',
    hot: true,
    quiet: true,
    stats: {
      colors: true
    },
    proxy: {
      '/api/*' : 'http://localhost:' + port,
    }
  }).listen(portDev, 'localhost', function (err) {
    if (err) {
      console.log(err);
    }

    console.log('Dev server listening at http://localhost:' + portDev);
  });
};

app.use('/', express.static('dist'));

app.listen(port, function(err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('App and API is live at http://localhost:' + port);
});
