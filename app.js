/*******************************************************************************
 *******************************************************************************
 **
 **  Angelo's auth_homework
 **  integrating sequelize 
 **  primary technologies: 
 **    node.js
 **    express.js
 **    postgres (pg)
 **    sequelize
 **    bcrypt
 **    passport && passport-local
 **    cookie-session
 **    foundation front-end framework
 **
 *******************************************************************************
*******************************************************************************/

var express    = require('express'),
    bodyParser = require('body-parser'),
    db         = require('./models'),
    passport   = require('passport'),
    session    = require('cookie-session'),
    app        = express();

/*******************************************************************************
 *******************************************************************************
 **
 ** APP SETTINGS
 **
 *******************************************************************************
*******************************************************************************/

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( { extended:true } ));
app.use(session({
                 secret: 'thisismysecretkey',
                 name:   'chocolate chip',
                 maxage: 3600000
                })
);
app.use(passport.initialize());
app.use(passport.session());

/*******************************************************************************
 *******************************************************************************
 **
 ** Passport Setup
 **
 *******************************************************************************
*******************************************************************************/

passport.serializeUser  ( function (user, done) {
  console.log('Serialized just ran!');
  done(null, user.id);
});

passport.deserializeUser( function (id, done) {
  console.log('Deserialize just ran!');
  db.user
    .find({ 
      where : 
      {  id : id  }
    })
    .then( 
      function(user) {
          done(null, user);
      },
      function (err) {
           done(err, null);
      }
    );
});

/*******************************************************************************
 *******************************************************************************
 **
 ** USERS ROUTES
 **
 *******************************************************************************
*******************************************************************************/

// when guest wants to sign up
app.get('/signup', function (req, res) {
    res.render
    ('users/signup');
});

// guest signs up to be a newUser. Creates newUser || redirects to signup page
app.post('/users', function (req, res) {
  var newUser = req.body.user;
  console.log ("new user:", newUser);
    /*  fn from model for clarity     //
    //                                //
    //    createSecure ( email,       //
    //                   password,    //
    //                   error,       //
    //                   success      //
    //                 );             //
    //                                */
  db.user.createSecure( //email
                        newUser.email,
                        //password
                        newUser.password, 
                        //error
                        function () {
                          res.redirect("/signup");
                        },
                        //success
                        function (err, user) {
                             req.login    (user, function(){
                             console.log  ("Id: ", user.id)
                             res.redirect ('/users/' + user.id);
                        }
                      );
    })
});

// when existingUser wants login page
app.get('/login', function (req, res) {
    res.render
    ('users/login');
});

// after existingUser signs in; routes to their profile. if(err) redirect-> signup
app.get('/users/:id', function (req, res) {
  db.user
    .find( req.params.id )
    .then( function (user) {
         res.render
         ('users/show', { user : user});
    })
    .error( function () {
          res.redirect
          ('/signup');
    })
});

// authenticating a user, relies on existing User.methods in model:User
app.post('/login', 
            passport
              .authenticate (
                  'local', { 
                      successRedirect: '/',
                        failureRedirect: '/login'
                      }
              )
        );

// when loading site root, check if Guest or User, then pass {} into site root
app.get('/', function (req, res) {
  console.log 
  ( req.user );
  
  if ( req.user ) {
    res.render
    ( 'site/index', { user : req.user });
  } else {
    res.render
    ( 'site/index', { user : false    });
  }
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

/*******************************************************************************
 *******************************************************************************
 **
 ** START SERVER
 **
 *******************************************************************************
*******************************************************************************/
app.listen( 3000, function () {
  console.log 
  ('listening');
})