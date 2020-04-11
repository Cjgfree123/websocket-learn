let express = require("express");
let app = express();
app.use(express.static(__dirname));

// app.listen(3000);

let server = require("http").createServer(app);
// server(属于必须)用于返回数据, socket用于实时通信
let io = require("socket.io")(server);

// 监听客户端的连接事件，当客户端连接上来后，执行回调函数
// 默认路径 io("/") 即: io.on("connection", func()) 是io.of("/").on("connection", func())的简写
io.on("connection", function(socket){
    console.log("服务器接收到客户端的连接");
    socket.on("message", function(message){
        console.log(message);
        socket.send("服务器说:" + message);
    })
})

server.listen(3000);