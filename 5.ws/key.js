// 计算accept值 
let key = "'Sec-WebSocket-Key': 'h0pH7Y1Llxh+xombDUouBQ==',";
let CODE = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";// 规定好的值
let crypto = require("crypto");
let result = crypto.createHash("sha1").update(key + CODE).digest("base64");
console.log("accept", result); // ju+PaoGUSjFO3FBY0fmW/3nF7kk=