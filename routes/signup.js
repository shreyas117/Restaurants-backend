const express = require("express");
const mongoose = require("mongoose");
var router = require("express").Router();
const cors = require("cors");
//var obj = require("mongodb").ObjectID;
const { ObjectId } = require("mongodb");
const app = express();
const port = 3001;
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

app.use(jsonParser);

var url = "mongodb://localhost:27017/products";

app.use(cors({ origin: "*" }));

router.post("/", (req, res) => {
  var userName = req.query.userName;
  var password1 = req.query.password;
  console.log(userName, password1);
  mongoose.connect(url, async (err, db) => {
    if (err) throw err;
    // check if username already exists.. if yes throw error saying try different username
    var x = await db.collection("creds").findOne({ name: userName });
    if (x == null) {
      db.collection("creds").insertOne({
        name: userName,
        password: password1,
      });
      //console.log("Done");
      res.send(200, { result: true });
    } else {
      //console.log("Duplicate");
      res.send(404, { result: false });
    }
  });
});

module.exports = router;
