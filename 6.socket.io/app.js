let express = require("express");
let app = express();
app.use(express.static(__dirname));

let server = require("http").createServer(app);
// server(属于必须)用于返回数据, socket用于实时通信
let io = require("socket.io")(server);

let SYSTEM = "系统";

// 监听客户端的连接事件，当客户端连接上来后，执行回调函数
// 默认路径 io("/") 即: io.on("connection", func()) 是io.of("/").on("connection", func())的简写
io.on("connection", function(socket){
    let username;
    socket.on("message", function(content) {
        if(username){
            /**
             * step2 用户的正常消息
             */
            io.emit("message", getMsg(content, username));
        }else{
            /**
             * step1 将消息的内容, 设置为当前用户的用户名
             */
            // 把这个消息的内容, 设置为当前用户的用户名
            username = content;
            // 告诉所有的客户端，有新的用户加入了聊天室.
            io.emit("message", getMsg(`${username}加入聊天室`));
        };
    });
});

server.listen(3000);

function getMsg(content, username = SYSTEM ) {
    return {
        username,
        content,
        createdAt: new Date()
    }
}