const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

const Chat = require('./models/chat');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/whatsapp')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// App config
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session config
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({ username });
  if (!user) return done(null, false);
  const valid = await bcrypt.compare(password, user.password);
  return valid ? done(null, user) : done(null, false);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Flash middleware
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

// Auth check middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.redirect("/login"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({ username, password: hash });
  await user.save();
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid username or password!");
      return res.redirect("/login");
    }
    req.logIn(user, err => {
      if (err) return next(err);
      return res.redirect("/chats");
    });
  })(req, res, next);
});

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// Chat routes
app.get("/chats", isLoggedIn, async (req, res) => {
  const chats = await Chat.find({ user: req.user._id });
  const { success, type } = req.query;
  res.render("index", { chats, user: req.user, success, type });
});

app.get("/chats/new", isLoggedIn, (req, res) => {
  res.render("new", { user: req.user });
});

app.post("/chats", isLoggedIn, async (req, res) => {
  const { from, to, msg } = req.body;
  const newChat = new Chat({ from, to, msg, created_at: new Date(), user: req.user._id });
  await newChat.save();
  res.redirect("/chats?success=Chat+created+successfully!");
});

app.get("/chats/:id/edit", isLoggedIn, async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  res.render("edit", { chat, user: req.user });
});

app.put("/chats/:id", isLoggedIn, async (req, res) => {
  await Chat.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { msg: req.body.msg });
  res.redirect("/chats");
});

app.delete("/chats/:id", isLoggedIn, async (req, res) => {
  await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.redirect("/chats?success=Chat+deleted+successfully!&type=danger");
});

app.listen(8080, () => console.log("Server running on port 8080"));
