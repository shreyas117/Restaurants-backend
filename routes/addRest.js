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

router.post("/", urlencodedParser, (req, res) => {
  mongoose.connect(url, async (err, db) => {
    //console.log(req.query);
    //console.log(JSON.parse(req.body));
    db.collection("rests").insertOne({
      name: req.query.name,
      imgURL: req.query.imgURL,
      pinCode: parseInt(req.query.pinCode),
      info: req.query.info,
      menu: req.body,
    });
  });
});

module.exports = router;
