var {templates, app, log} = require('./app');
var {User, Location} = require('./models');
var response = require('ringo/jsgi/response')
export('app');

app.get('/', function() {
   return templates.renderResponse('index.html');
})

// create user and location
app.post('/locations', function(req) {
   var firstname = req.params.firstname;
   var locationName = req.params.location;
   var likesCats = (req.params.likesCats === 'on');

   // does location already exist?
   var location = Location.getByName(locationName);
   if (location === null) {
      location = new Location({
         name: locationName
      });
      location.save();
      log.info('Created new location: ', location.name)
   }

   // does firstname already exist?
   var user = User.getByName(firstname);
   if (user === null) {
      user = new User({
         firstname: firstname,
         lastVisit: new Date(),
         location: location,
         likesCats: likesCats,
      });
      user.save();
      // invalidate visitors collection
      location.visitors.invalidate();
   } else {
      // if user exist: update lastVisit
      user.lastVisit = new Date();
      user.save();
   }
   return response.redirect('/locations');
});

app.get('/locations', function() {
   return templates.renderResponse('locations.html', {
      locations: Location.all()
   });
});