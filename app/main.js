/**
 * @fileoverview
 * This bootstraps the web framework.
 */
var {Store, ConnectionPool, Cache} = require("ringo-sqlstore");
var {Environment} = require('reinhardt');
var {Application} = require('stick');

// config and logging
// @@ merge configs depending on: debug? winlinmac?
var config = exports.config = require('gestalt').load(module.resolve('../config/config.js'));
var log = exports.log = require("ringo/logging").getLogger(module.id);

// @@ verify all necessary config settings are presetn

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
})
rootApp.mount(config.get('server').baseUri, module.resolve('./views'));

// Start the http server if this
// file is run from command line.
if (require.main === module) {
   var {Server}  = require('ringo/httpserver');
   var server = new Server({
     appModule: module.resolve('./main'),
     appName: 'rootApp',
     staticDir: config.get('server').staticDir,
     staticMountpoint: config.get('server').staticMountpoint
   });
   server.start();
}