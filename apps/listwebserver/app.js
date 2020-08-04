const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const url = require('url');
const bodyParser = require('body-parser');
const { promisify } = require('util');
const child_process = require('child_process');
const api = require('./api');
const { apiErrorHandler, resourceNotFoundHandler, isAuthenticated } = require('./util/express-middleware');
const programArguments = require('./util/programArguments');
const logger = require('./util/logger');
const authMiddleware = require('./auth/middleware');

const app = express();

// Initialize the REST API logger
app.use(morgan('short', { stream: logger('rest-api').restAPILogger }));

logger('static-generator').info('CORS: ', "*");

app.use(
    cors({
        origin: function(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    })
);

//Helmet protects the express web servers from some well-known web vulnerabilities
app.use(helmet());

app.use(bodyParser.json());

app.use(cookieParser());

app.use(
    session({
        secret: programArguments.cookieSecret,
        resave: true,
        saveUninitialized: true,
        rolling: true,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (in milliseconds)
        },
    })
);

// API Router
app.post('/auth/login', authMiddleware.handleLogin);
app.post('/auth/logout', authMiddleware.handleLogout);
app.post('/user/register', authMiddleware.handleRegister);
app.use('/api/', authMiddleware.checkToken, api);
logger('app').info('API initialized');

// Handles with the 404 Not Found
app.use(resourceNotFoundHandler);

// Handles API Error and send a specific error code for the API Rest Consumer instead of the
// stack trace message. Those kind of information should propagated to the logger.
app.use(apiErrorHandler);

// Generate static config data when the LIST web server is executed.
const generateStaticConfigCommand = `"${programArguments.cpp}/static_generator" "${programArguments.folder}"`;

logger('static-generator').profile('Static configurations generated');

// Promisify execute command
const exec = promisify(child_process.exec);
exec(generateStaticConfigCommand)
    .then(output => {
        logger('static-generator').info(`Generated static configurations: ${output.stdout}`);
    })
    .catch(output => {
        logger('static-generator').error(output.stderr);
    })
    .then(() => {
        logger('static-generator').profile('Static configurations generated');
    });

module.exports = app;
