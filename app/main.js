var {Store, ConnectionPool, Cache} = require("ringo-sqlstore");
var {Environment} = require('reinhardt');
var {Application} = require('stick');

// config and logging
// @@ merge configs depending on: debug? winlinmac?
var config = exports.config = require('gestalt').load(module.resolve('../config/config.js'));
var log = exports.log = require("ringo/logging").getLogger(module.id);

// @@ verify all necessary config settings are presetn

// db
var entityCache = module.singleton("entityCache", function() {
    return new Cache(config.get('db').cacheSize);
});
var queryCache = module.singleton("queryCache", function() {
    return new Cache(config.get('db').cacheSize);
});
var connectionPool = module.singleton('connectionpool', function() {
   return new ConnectionPool(config.get('db'));
});

var db = exports.db = new Store(connectionPool);
db.setEntityCache(entityCache);
db.setQueryCache(queryCache);

// stick
var rootApp = exports.rootApp = new Application();
rootApp.configure("etag", "requestlog", "notfound", "session", "params", "mount");
rootApp.configure("static");
if (config.get('debug') === true) {
   rootApp.configure(require('reinhardt/middleware'));
   //rootApp.configure("error");
}

// reinhardt
exports.templates = new Environment(config.get('templates'));
// return a routing app for views.js
Object.defineProperty(exports, 'app', {
   get: function() {
      var app = Application();
      app.configure("route");
      return app;
   }
})
rootApp.mount(config.get('server').baseUri, module.resolve('./views'));

// start server if run as main script
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