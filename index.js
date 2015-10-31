var http = require('http');
var express = require("express");
var nodeRed = require("node-red");
var path = require("path");
var config = require("./config");

var app = express();

app.use("/", express.static("public"));
app.use("/", express.static("bower_components"));
app.use("/ui", express.static("ui"));

var server = http.createServer(app);

var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir:"nodered",
    nodesDir: path.join(__dirname, "nodes"),
    verbose: true,
    functionGlobalContext: { }    // enables global context
};

nodeRed.init(server, settings);

app.use(settings.httpAdminRoot, nodeRed.httpAdmin);
app.use(settings.httpNodeRoot, nodeRed.httpNode);

server.listen(config.port);

nodeRed.start().then(function() {
    nodeRed.log.info("Application started on port: " + config.port);
});
