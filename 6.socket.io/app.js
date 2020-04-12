let { Message } = require('./db');

let express = require("express");
let app = express();
app.use(express.static(__dirname));

let server = require("http").createServer(app);
// server(属于必须)用于返回数据, socket用于实时通信
let io = require("socket.io")(server);

let SYSTEM = "系统";
let sockets = {};

// 监听客户端的连接事件，当客户端连接上来后，执行回调函数
// 默认路径 io("/") 即: io.on("connection", func()) 是io.of("/").on("connection", func())的简写
io.on("connection", function(socket){
    let username;
    let rooms = []; // 代表此客户端进入的房间的所有房间

    socket.on("getAllMessages", async function(){
        // 按照时间降序，返回最近的20条
        let messages = await Message.find().sort({
            create: -1
        })
        .limit(10);
        messages.reverse();
        socket.emit("allMessages", messages);
    });

    socket.on("join", function(roomName) {
        let index = rooms.indexOf(roomName);
        if(index == -1){
            rooms.push(roomName);
            socket.join(roomName);
            socket.emit("joined", roomName);
        }
    });

    socket.on("message", async function(content) {
        if(username){
            /**
             * step2 用户的正常消息
             */
            // 第一个分组代表非空格,指用户名; 第二个分组指消息。
            let result = content.match(/@([^ ]+)(.+)/);
            // 如果匹配则是私聊
            if(result){
                let toUser = result[1]; // 用户名
                let toContent = result[2]; // 消息
                let toSocket = sockets[toUser];
                toSocket && toSocket.emit("message", getMsg(toContent, username));

            }else{
                let savedMessage = await Message.create(getMsg(content, username));
                // 房间内
                if(rooms.length > 0){
                    rooms.forEach(room => {
                        console.log("room", room);
                        io.in(room).emit("message",savedMessage);
                    })
                }else{
                    // 如果在大厅说话，则所有的人都能听到，包括其他大厅的人和所有房间的人
                    let savedMessage = await Message.create(getMsg(content, username));
                    io.emit("message", savedMessage);
                }
            }
        }else{
            /**
             * step1 将消息的内容, 设置为当前用户的用户名
             */
            // 如果说，用户名没有设置过的话
            let oldSocket = sockets[content];
            if(oldSocket){
                socket.emit("message", getMsg(`${content}已经被占用, 请换一个用户名! `));
            }else{
                // 把这个消息的内容, 设置为当前用户的用户名
                username = content;
                // 把用户名和对应的socket对象进行关联
                sockets[username] = socket;
                // 告诉所有的客户端，有新的用户加入了聊天室.
                socket.broadcast.emit("message", getMsg(`${username}加入聊天室`));
            };
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