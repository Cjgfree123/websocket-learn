# websocket learn

## 遇到问题并解决

1. 小火箭并不会自动匹配 域名:端口，需要自己开启时，重新进行编辑。

## 内容

1. 轮询 (例子: 1.query.js)
2. 长轮询
3. iframe
4. EventSource
5. websocket
   
   *app.js*
    * 使用
        (1) 注意: socket端口一致8888, 服务端口3000
        ```
            let socket = new WebSocket("ws://localhost:8888"); // 协议名: ws
            let server = new WebSockerServer({ port:8888 });
        ```

        (2) 大写Server
        ```
        let WebSockerServer = require("ws").Server;
        ```

        (3)通信顺序

        ```
        1. 客户端连接上了服务器
        2. 服务器监听到了客户端的连接
        3. 你好(客户端发消息给服务端)
        4. 服务端拿到客户端连接过来的消息
        5. 服务端准备数据，并发给客户端
        6. 客户端拿到服务端发来的消息
        ```

    *app2.js*

        (1) socket端口9999, 服务端口3000
        (2) 需要双终端，app.js(服务端口) + app2.js(socket)

        ps:实现思路
        先匹配 Upgrade 字段，如果成功匹配，说明: 需要升级切换协议。 然后判断Sec-WebSocket-Version等于13的话，利用Sec-WebSocket-Key计算出accept值，作为返回的 响应头。返回给客户端。
        
    * 算法原理
    
6. socket.io

(1) 通信的基本流程

index.html 客户端
```
let socket = io.connect("/"); // "/"不是根路径，而是命名空间。

socket.on("connect", function () {
    console.log("连接成功");
    /**
        * socket.send 是 socket.emit("message","hello")的语法糖
        * 优点: (1)更语义化 (2)更短(比如少写 message)
        * ps: message只是通信方式中的一种
        */
    socket.send("hello");
});

// 监听服务器返回的消息
socket.on("message", function (content) {
    // io.emit("message", content);
    let li = document.createElement("li");
    li.innerHTML = content;
    li.className = "list-group-item";
    messageList.appendChild(li);
});

socket.on("disconnect", function () {
    console.log("连接失败");
});
```

app.js 服务器端

```
let server = require("http").createServer(app);
// server(属于必须)用于返回数据, socket用于实时通信
let io = require("socket.io")(server);

// 监听客户端的连接事件，当客户端连接上来后，执行回调函数
// 默认路径 io("/") 即: io.on("connection", func()) 是io.of("/").on("connection", func())的简写
io.on("connection", function(socket){
    console.log("服务器接收到客户端的连接");
    socket.on("message", function(message){
        console.log(message);

        // 服务器读取到客户端的消息, 并给消息加上前缀"服务器说".
        socket.send("服务器说:" + message);
    })
})
```

(2)需求描述

    <1> 客户端发消息，服务端将客户端传递过来的消息，进行广播（展示在浏览器中）;  体验优化(enter键入，消息不为空)

    <2> 将消息按照不同用户，进行区分(即: 用户输入的第一条消息，作为用户名。之后的消息，作为聊天记录)

        ```
        // 可以开双浏览器, 分别进行访问localhost:3000, 模拟用户第一次进入聊天室并发言。
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
        ```

    <3> 如何保证消息，仅仅给别人看，主动发送的人看不到(即: 向除了自己之外的所有人进行广播)。

    ```
     socket.broadcast.emit("message", func);
    ```

    <4> 私聊(首先实现用户名@效果, @之后即可开启私聊)

    app.js

    ```
    // 第一个分组代表非空格,指用户名; 第二个分组指消息。
    let result = content.match(/@([^ ]+)(.+)/);
    // 如果匹配则是私聊
    if(result){
        let toUser = result[1]; // 用户名
        let toContent = result[2]; // 消息
        let toSocket = sockets[toUser];
        toSocket && toSocket.emit("message", getMsg(toContent, username));

    }else{
        // 公聊
        io.emit("message", getMsg(content, username));
    }
    ```

    <5> 如果用户名已经设置过了的话，则提示: "已经被占用, 请换一个用户名".

    app.js

    ```
    // 如果说，用户名没有设置过的话
    let oldSocket = sockets[content];
    if(oldSocket){
        socket.emit("message", getMsg(`${content}已经被占用, 请换一个用户名! `));
    }
    ```

    <6> 数据持久化(刷新时，从数据库中读取聊天历史记录，而非直接丢失数据。)

    <7> 房间

        * 点击"进入红房间"，按钮显示"离开红房间"。

        * 默认滚动到消息列表底部，如果输入时，自动滚动到底部。

        * [房间]

            如果在大厅说话，则所有的人都能听到，包括其他大厅的人和所有房间的人.

            如果在房间内说话，则房间内的人，都可以听到。

                ```
                 io.in(room).emit("message",savedMessage);
                ```