let express = require("express");
let app = express();
let counter = 0;

// http://localhost:8080
app.use(express.static(__dirname));
app.get("/block", function (req, res) {
    res.header("Content-Type", "text/event-stream");
    let timer = setInterval(function () {
      res.write(`id:${counter++}\nevent:message\ndata:${new Date().toLocaleString()}\n\n`);
    },1000);
    res.on("close", function () {
        clearInterval(timer);
    })
});
app.listen(8080);