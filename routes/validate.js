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

router.get("/", (req, res) => {
  //console.log(req.query);
  var userName = req.query.userName;
  var password = req.query.password;

  mongoose.connect(url, async (err, db) => {
    if (err) throw err;
    //console.log(userName,password);
    var x = await db
      .collection("creds")
      .findOne({ name: userName, password: password });
    if (x == null) {
      res.send(404, { result: false });
    } else {
      res.send(200, { result: true });
    }
  });
});

module.exports = router;
