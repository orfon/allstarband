var {db} = require('./app');

var User = exports.User = db.defineEntity('User', {
   properties: {
      firstname: 'string',
      lastVisit: 'timestamp',
      likesCats: 'boolean',
      location: {
         type: 'object',
         entity: 'Location'
      }
   }
});

User.getByName = function(firstname) {
   var users = db.query('from User where User.firstname = :firstname', {firstname: firstname});
   if (users.length) {
      return users[0]
   }
   return null;
}

var Location = exports.Location = db.defineEntity('Location', {
   properties: {
      name: 'string',
      visitors: {
         type: 'collection',
         query: 'from User where User.location = :id'
      }
   }
});

Location.getByName = function(name) {
   var locations = db.query('from Location where Location.name = :name', {name: name});
   if (locations.length) {
      return locations[0]
   }
   return null;
}