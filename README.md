# websocket learn

## 内容

1. 轮询 (例子: 1.query.js)
2. 长轮询
3. iframe
4. EventSource
5. websocket
    * 使用
        (1) 注意: 端口一致
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

    * 算法原理
    