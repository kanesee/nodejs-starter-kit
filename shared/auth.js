/*************************
 * Authentication module
 ************************/
var db = require('../shared/db.js');
// https://www.npmjs.com/package/password-hash
var passwordHash = require('password-hash');
exports.passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;


/**********************************************
 * Helper Functions for testing authentication
 **********************************************/
exports.ensureAuthenticatedElseRedirect = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login.html');
}

exports.ensureAuthenticatedElseError = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(499).send('Requires Authentication');
}

/*******************************************
 * Save User Id in session to maintain
 * login session
 *******************************************/
exports.passport.serializeUser(function(user, done) {
//  console.log('serializeUser');
  done(null, user.id);
});


/************************************************
 * Deserialize User Id from session and retrieve
 * user from DB. Then put user in req.user so
 * remaining middleware will have access to it
 ***********************************************/
exports.passport.deserializeUser(function(userId, done) {
//  console.log('deserializeUser');
  var sql = 'SELECT *'
          +' FROM users'
          +' WHERE id="'+userId+'"';

  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log(err);
      done(err, null);
    } else {
      var user = null;
      if( rows.length ) {
        user = {
            id: rows[0].id
          , password: rows[0].password
        };
      }
      console.log(user);
      done(null, user);
    }
  });   
});

/**********************************************
 * Strategy Definitions and Initialization
 **********************************************/

// for authentication
exports.passport.use(new BasicStrategy(
  function(userId, password, done) {
//    console.log('BasicStrategy: verifying credentials');
//    User.findOne({ username: userid }, function (err, user) {
//      if (err) { return done(err); }
//      if (!user) { return done(null, false); }
//      if (!user.verifyPassword(password)) { return done(null, false); }
//      return done(null, user);
//    });
//    return done(null, getUser(userId, password));
    var sql = 'SELECT *'
            +' FROM users'
            +' WHERE id="'+userId+'"';
//            +' AND password="'+password+'"';

//    {
//      console.log('======');
//      var pwd = '2361rosecrans';
//      var hashedPassword = passwordHash.generate(pwd);
//      console.log(hashedPassword);
//
//      console.log(passwordHash.verify(pwd, hashedPassword)); // true
//      console.log('======');
//    }

    db.connection.query(sql, function(err, rows) {
      if( err ) {
        console.log(err);
        done(err, null);
      } else {
        var user = null;
        if( rows.length ) {
          var hashedPwd = rows[0].password;
//          console.log(password+'='+hashedPwd
//                    +': '+passwordHash.verify(password, hashedPwd));
          if( passwordHash.verify(password, hashedPwd) ) {
            user = {
                id: userId
              , password: password
            };
          }
        }
//        console.log(user);
        done(null, user);
      }
    });    
  }
));

/**********************************************
 * Private Helpers
 **********************************************/

function getUser(userId, password) {
  var sql = 'SELECT *'
          +' FROM users'
          +' WHERE id="'+userId+'"';
  if( password ) {
      sql +=' AND password="'+password+'"';
  }
  db.connection.query(sql, function(err, rows) {
    if( err ) {
      console.log(err);
      return null;
    } else {
      var user = {};
      if( rows.length ) {
        user = {
            id: rows[0].id
          , password: rows[0].password
        };
      }
      console.log(user);
      return user;
    }
  });
}
