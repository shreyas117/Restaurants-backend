const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3001;
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

var url = "mongodb://localhost:27017/products";

app.get("/", urlencodedParser, (req, res) => {
  //var pin = req.query.pinCode;
  var pin = 560043;
  mongoose.connect(url, async (err, db) => {
    if (err) throw err;

    var x = await db
      .collection("rests")
      .findMany({ pinCode: pin }, { projection: { _id: 0 } });
  });
  console.log(x);
});
