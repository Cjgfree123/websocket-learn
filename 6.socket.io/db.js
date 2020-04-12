let mongoose = require("mongoose");
let conn = mongoose.createConnection("mongodb://localhost:27017/zfchat");
let MessageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

let Message = conn.model("Message", MessageSchema);
module.exports = {
    Message,
}
