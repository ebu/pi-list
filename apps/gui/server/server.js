const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();

// enable gzip
app.use(compression());

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(8080);
