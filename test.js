var http = require("http");
var url = require('url');
const { exit } = require("process");
var events = require('events');
const fs = require("fs");
const path = require('path');

// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

// route 根路径
eventEmitter.on('/', function(method, response){
    const paths = path.resolve(__dirname, './build/index.html');
    fs.readFile(paths, (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html;charset=utf8'});
        response.end(data);
    });
});

eventEmitter.on('/build.js', function(method, response){
    const paths = path.resolve(__dirname, './build/build.js');
    fs.readFile(paths, (err, data) => {
        response.writeHead(200, {'Content-Type': 'application/x-javascript;charset=utf8'});
        response.end(data);
    });
});

// route 404
eventEmitter.on('404', function(method, url, response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('404 Not Found\n');
});

// 启动服务
http.createServer(function (request, response) {
    console.log(request.url);

    // 分发
    if (eventEmitter.listenerCount(request.url) > 0){
        eventEmitter.emit(request.url, request.method, response);
    }
    else {
        eventEmitter.emit('404', request.method, request.url, response);
    }

}).listen(8888);