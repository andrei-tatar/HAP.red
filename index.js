var http = require('http'),
    express = require("express"),
    nodeRed = require("node-red"),
    path = require("path"),
    config = require("./config"),
    mqtt = require("./mqtt");

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
    mqtt(nodeRed.log);
    nodeRed.log.info("Application started on port: " + config.port);
});
