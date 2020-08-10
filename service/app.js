var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
const uuid = require('node-uuid');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var orderRouter = require('./routes/order');
const RESPONSE = require("./util/response");
const auth = require('./util/auth');
const course = require('./routes/course');


var app = express();

app.use(cors({ credentials: true, origin: true }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 使用 session 中间件
app.use(session({
    genid: function(req) {
        return uuid() // use UUIDs for session IDs
    },
    secret: 'computer-room', // 对session id 相关的cookie 进行签名
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: 'strict'
    },
    rolling: true,
    name: "sessionID",
    proxy: true,
    unset: 'keep'
}));

app.use((req, res, next) => {
    if (undefined === req.cookies._id) {
        res.cookie('_id', req.query.uuid || req.sessionID);
    }
    next();
})


app.use(express.static(path.join(__dirname, 'public')));
app.use(auth);
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/order', orderRouter);
app.use('/api/course',course);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;