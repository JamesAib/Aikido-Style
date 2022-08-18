var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fetch = require('node-fetch');
const { mw } = require('request-ip');
const client = require('../util/client');
const webActions = require('../util/webActions');

const bodyParser = require('body-parser');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const MemoryStore = require('memorystore')(session);
const passport = require('passport');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new Strategy(
    {
      clientID: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
      callbackURL: process.env.callbackUrl,
      scope: ['identify'],
    },
    (_accessToken, _refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.locals.domain = process.env.hostname;

app.use(mw());
app.use((_req, _res, next) => {
  if (!client.ready) {
    next(
      createError(
        418,
        "I'm a teapot! The client is not yet loaded, try again in a few seconds <3"
      )
    );
  } else {
    next();
  }
});

app.get('/', (_req, res) => res.render('index'));

app.get(
  '/login',
  (req, _res, next) => {
    if (req.session.backURL) {
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = '/';
    }

    next();
  },
  passport.authenticate('discord')
);

app.use(
  '/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    if (req.session.backURL) {
      const backURL = req.session.backURL;
      req.session.backURL = null;
      res.redirect(backURL);
    } else {
      res.redirect('/');
    }
  }
);

app.get('/logout', function (req, res) {
  req.session.destroy(() => {
    req.logout();
    res.redirect('/');
  });
});

app.use('/verify', checkAuth, async function (req, res, next) {
  const ipRequest = await fetch(`http://v2.api.iphub.info/ip/${req.clientIp}`, {
    headers: { 'X-Key': process.env.iphub_key },
  });
  if (!ipRequest.ok) {
    await client.log({
      content: ipRequest.toString(),
    });

    return next(
      createError(
        500,
        'The external service that we use to verify IPs encountered an error.'
      )
    );
  }
  const ipStatus = await ipRequest.json();

  if (ipStatus.block === 1) {
    await webActions.kickUser(req.user.id);
    return res.render('kick');
  }
  await webActions.verifyUser(req.user.id);
  res.render('verified');
});

app.use(function (_req, _res, next) {
  next(createError(404));
});

app.use(function (err, req, res, _next) {
  console.error(err);

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.port, () =>
  console.log(`Website listening on port ${process.env.port}.`)
);

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
  res.redirect('/login');
}
