/**
 * @fileoverview
 * This bootstraps the web framework.
 */
var {Store, ConnectionPool, Cache} = require("ringo-sqlstore");
var {Environment} = require('reinhardt');
var {Application} = require('stick');
var {Server}  = require('ringo/httpserver');
var system = require('system');

if (system.args.length < 2) {
  print ('Requires the path to the config.js file as argument.');
  system.exit(1);
}
var configFile = system.args[1];

// config and logging
// @@ merge configs depending on: debug? winlinmac?
var config = exports.config = require('gestalt').load(configFile);
var log = exports.log = require("ringo/logging").getLogger(module.id);

// @@ verify all necessary config settings are present

// Create database caches
var entityCache = module.singleton("entityCache", function() {
    return new Cache(config.get('db').cacheSize);
});
var queryCache = module.singleton("queryCache", function() {
    return new Cache(config.get('db').cacheSize);
});
var connectionPool = module.singleton('connectionpool', function() {
   return new ConnectionPool(config.get('db'));
});

// Create database connection and set caches
var db = exports.db = new Store(connectionPool);
db.setEntityCache(entityCache);
db.setQueryCache(queryCache);

// Root stick application
var rootApp = exports.rootApp = new Application();
rootApp.configure("etag", "requestlog", "notfound", "session", "params", "mount");
if (config.get('debug') === true) {
   rootApp.configure(require('reinhardt/middleware'));
   rootApp.configure("error");
}

// Create templating environment
exports.templates = new Environment(config.get('templates'));

// Accessing this property creates a
// new stick application with the `route`
// middleware preconfigured. This is convinient
// for views.js
Object.defineProperty(exports, 'app', {
   get: function() {
      var app = Application();
      app.configure("route");
      return app;
   }
});

rootApp.mount(config.get('server').baseUri, config.get('server').views);

var httpServer = module.singleton('httpServer', function() {
   return (new Server({
     appModule: module.id,
     appName: 'rootApp',
     staticDir: config.get('server').staticDir,
     staticMountpoint: config.get('server').staticMountpoint
   }));
})

var start = exports.start = function() {
   httpServer.start();
}

var stop = exports.stop = function() {
  httpServer.stop();
}

if (require.main == module.id) {
  start();
  require('ringo/engine').addShutdownHook(stop);
}