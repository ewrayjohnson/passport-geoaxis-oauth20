var OAuth2Strategy = require('passport-oauth2');
var util = require('util');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;
var base64 = require('base-64');

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://geoaxis.gxaws.com/ms_oauth/oauth2/endpoints/oauthservice/authorize';
  options.tokenURL = options.tokenURL || 'https://geoaxis.gxaws.com/ms_oauth/oauth2/endpoints/oauthservice/tokens';
  options.scope = options.scope || ['UserProfile.me'];

  // perform these checks since we need to use them for the Authorization header below. Otherwise these check are
  // covered in OAuth2Strategy constructor.
  if (!options.clientID) { throw new TypeError('geoaxis OAuth2Strategy requires a clientID option'); }
  if (!options.clientSecret) { throw new TypeError('geoaxis OAuth2Strategy requires a clientSecret option'); }

  // strangely geoaxis requires the clientID and clientSecrete as basic auth header's user:pass
  // needs to be set before OAuth2Strategy constructor is called since it in turn creates OAuth2 object which doesn't
  // support proper setting of custom headers afterwards
  options.customHeaders = {
    'Authorization': 'Basic ' + base64.encode(options.clientID + ':' + options.clientSecret)
  };

  OAuth2Strategy.call(this, options, verify);
  this.name = 'geoaxis';
  this._userProfileURL = options.userProfileURL || 'https://geoaxis.gxaws.com/ms_oauth/resources/userprofile/me';

  // geo axis calls it code instead of 'access_token'
  this._oauth2.setAccessTokenName('code');

  // have to set this so that the profile call adds an authorization header "Authorization: <access_token>"
  this._oauth2.useAuthorizationHeaderforGET(true);

  // reset it so it is no longer the Default 'Bearer' this makes it so that when oauth2 sets the token, the authorization
  // header looks like "Authorization: eyJhbGci..." as opposed to "Authorization: Bearer eyJhbGci...." since geo axis
  // doesn't follow spec
  this._oauth2.setAuthMethod('');
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  var self = this;

  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;

    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) { }
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = {};
    profile.provider = 'geoaxis';
    profile._raw = body;
    profile.id = json.ID;

    profile.emails = [
      {
        value: json.mail,
        type: 'work'
      }
    ];
    profile.username = json.DN.split(',')[0].split('=')[1];
    const parts = profile.username.split('.');
    let displayName;
    const name = {
      familyName: (displayName = parts[0])
    };
    if (parts.length > 2) {
      displayName += ', ' + (name.givenName = parts[1]);
    }
    if (parts.length > 3) {
      displayName += ' ' + (name.middleName = parts[2]);
    }
    profile.name = name;
    profile.displayName = displayName;
    done(null, profile);
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
