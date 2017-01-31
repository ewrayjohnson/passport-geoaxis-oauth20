# passport-geoaxis-oauth20

[Passport](http://passportjs.org/) strategy for authenticating with GEOAxIS
using the OAuth 2.0 API.

This module lets you authenticate using GEOAxIS in your Node.js applications.
By plugging into Passport, GEOAxIS authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-geoaxis-oauth20

## Usage

#### Create an Application

Before using `passport-geoaxis-oauth20`, you must register an application with
GEOAxIS.  Your application will be issued a client ID and client secret, which need to be
provided to the strategy.  You will also need to configure a redirect URI which
matches the route in your application.

#### Configure Strategy

The GEOAxIS authentication strategy authenticates users using a GEOAxIS account
and OAuth 2.0 tokens.  The client ID and secret obtained when creating an
application are supplied as options when creating the strategy.  The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` which contains the authenticated user's
GEOAxIS profile.  The `verify` callback must call `cb` providing a user to
complete authentication.

    var GeoaxisStrategy = require('passport-geoaxis-oauth20').Strategy;

    passport.use(new GeoaxisStrategy({
        clientID: GEOAXIS_CLIENT_ID,
        clientSecret: GEOAXIS_CLIENT_SECRET,
        callbackURL: "http://www.example.com/auth/geoaxis/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ geoaxisId: profile._json.uid }, function (err, user) {
          return cb(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'geoaxis'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/geoaxis',
      passport.authenticate('geoaxis', { scope: ['profile'] }));

    app.get('/auth/geoaxis/callback',
      passport.authenticate('geoaxis', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });


## License

[The MIT License](http://opensource.org/licenses/MIT)
