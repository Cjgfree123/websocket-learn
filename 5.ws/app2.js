let net = require("net");
let server = net.createServer(function (socket) {
  // once 来自于EventEmitter on once 
  socket.once("data", function (data) {
    data = data.toString();
    if (data.match(/Connection: Upgrade/)) {
      // 利用/r/n, 截取请求头
      let rows = data.split("\r\n");
      rows = rows.slice(1, -2);
      let headers = {};
      rows.reduce((memo, item) => {
        let [
          key,
          value,
        ] = item.split(": ");
        memo[key] = value;
        return memo;
      }, headers);
      console.log("headers", headers);
      if(headers["Sec-Websocket-Version"] == "13"){
        // 根据Sec-Websocket-Version值, 计算accept
        let wsKey = headers["Sec-WebSocket-Key"];
        let wsAccept = crypto.createHash("sha1").update(wsKey + CODE).digest("base64");
        let response = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          "Sec-WebSocket-Accept: " + wsAccept,
          "\r\n",
        ].join("\r\n");
        socket.write(response);
        // 后面所有的格式, 都是基于websocket格式的
        socket.on("data", function(data) {

        });
      }
    };
  });
});
server.listen(9999);