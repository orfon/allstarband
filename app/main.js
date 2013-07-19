var {Server}  = require('ringo/httpserver');

// start server if run as main script
if (require.main === module) {
    var server = new Server({
      appModule: module.resolve('./app'),
      appName: 'routeApp'
    });
    server.start();
}