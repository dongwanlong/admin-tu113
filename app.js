var express = require('express');
var cors = require("cors");
var bodyParser = require('body-parser');
var router = require("./router/router.js");
var app = express();

app.use(cors({}));
app.use(bodyParser.json());
app.use("/", router);
app.use('/static', express.static('public'));

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Start app listening at http://%s:%s', host, port);
});