let express = require("express");
let app = express();

// http://localhost:8080
app.use(express.static(__dirname));
app.get("/block", function (req, res) {
    res.header("Content-Type", "text/html");
    setInterval(function () {
        // parent: 拿到父窗口index.html
        res.write(`
            <script>
                parent.setTime("${new Date().toLocaleString()}");  
            </script>
        `);
    },1000);
});
app.listen(8080);