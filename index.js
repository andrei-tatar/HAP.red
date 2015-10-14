var http = require('http');
var express = require("express");
var nodeRed = require("node-red");


var app = express();

app.use("/", express.static("public"));
app.use("/", express.static("bower_components"));

// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir:"nodered",
    functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
nodeRed.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, nodeRed.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, nodeRed.httpNode);

server.listen(8000);

// Start the runtime
nodeRed.start();