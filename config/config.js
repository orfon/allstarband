exports.db = {
   url: 'jdbc:h2:mem:' + module.resolve('../h2database'),
   driver: 'org.h2.Driver',
   username: '',
   password: '',
   cacheSize: 1000
}

exports.templates = {
   loader: [module.resolve('../templates/')],
   filters: [require('../app/filters')],
   tags: [require('../app/tags')],
   debug: true
}

exports.debug = true;

exports.server = {
   baseUri: '/',
   host: '127.0.0.1',
   port: 8080,
   staticDir: module.resolve('../static/'),
   staticMountpoint: '/static'
}