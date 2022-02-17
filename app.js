const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const port = 8105;

const cors = require('cors');
global.__basedir = __dirname;

const corsOptions = {
    origin: [
        'http://192.168.25.60:8000',
        'http://192.168.25.180:8000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Welcome to file manage app listening at local`)
})

module.exports = app;
