var express = require('express');
var cors = require("cors");
var path = require("path");
var fs = require("fs");
var bodyParser = require('body-parser');
var router = require("./router/router.js");
var app = express();

//目录初始化
var publicDir = path.resolve(__dirname, './public');
var imgsDir = path.resolve(__dirname, './public/imgs');
var sourcesDir = path.resolve(__dirname, './public/sources');
var uploadDir = path.resolve(__dirname, './public/upload');

if(!fs.existsSync(publicDir))fs.mkdirSync(publicDir);
if(!fs.existsSync(imgsDir))fs.mkdirSync(imgsDir);
if(!fs.existsSync(sourcesDir))fs.mkdirSync(sourcesDir);
if(!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir);


app.use(cors({}));
app.use(bodyParser.json());
app.use("/", router);
app.use('/', express.static("public"));


var server = app.listen(1234, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Start app listening at http://%s:%s', host, port);
});