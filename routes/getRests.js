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

router.get("/", urlencodedParser, (req, res) => {
  //console.log(req.query);
  var pin = parseInt(req.query.pinCode);
  //var pin = 560043;
  mongoose.connect(url, async (err, db) => {
    if (err) throw err;
    //var x = 1;
    if (isNaN(pin)) {
      var x = await db.collection("rests").find({}).toArray();
    } else {
      var x = await db.collection("rests").find({ pinCode: pin }).toArray();
    }
    return res.send(200, { result: x });
  });
});

module.exports = router;
