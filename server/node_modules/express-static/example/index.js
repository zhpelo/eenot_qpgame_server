const express = require('express');
const logger  = require('express-log');
const serve   = require('../index');

var app = express();

app.use(logger());
app.use(serve(__dirname + '/public'));

var server = app.listen(3000, function(){
	console.log('server is running at %s', server.address().port);
});
