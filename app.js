const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const app = express();
const port = 3001;
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors({ origin: "*" }));

var url = "mongodb://localhost:27017/products";

app.use("/validate", require("./routes/validate"));
app.use("/signup", require("./routes/signup"));
app.use("/changePassword", require("./routes/changePassword"));
app.use("/getRests", require("./routes/getRests"));
app.use("/addRest", require("./routes/addRest"));
app.use("/submitReview", require("./routes/submitReview"));
app.use("/editRest", require("./routes/editRest"));
app.use("/placeOrder", require("./routes/placeOrder"));
app.use("/showMyOrders", require("./routes/showMyOrders"));

app.use("/", (req, res) => {
  mongoose.connect(url, async function (err, db) {
    if (err) throw err;
  });
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
