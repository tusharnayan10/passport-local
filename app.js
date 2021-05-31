if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const app = express();


const initializePassword = require('./passport-config');
initializePassword(passport,
    email => user.find(user => user.email === email),
    id => user.find(user => user.id === id)
);

const user = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// ROUTING

app.get("/", checkAuthenticated, function (req, res) {
    res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, function (req, res) {
    res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, function (req, res) {
    res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashpass = await bcrypt.hash(req.body.password, 10);
        user.push({
            id: (Math.floor((Math.random() * 1234) * 5)).toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashpass
        });
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
    console.log(user);
});

app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
});

const PORT = 3000 || process.env.PORT
app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});