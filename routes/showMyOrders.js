const express = require("express");
const mongoose = require("mongoose");
var router = require("express").Router();
const cors = require("cors");
//var obj = require("mongodb").ObjectID;
const { ObjectId } = require("mongodb");
const app = express();
const port = 3001;
var moment = require("moment");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

app.use(jsonParser);

var url = "mongodb://localhost:27017/products";

app.use(cors({ origin: "*" }));

router.get("/", urlencodedParser, (req, res) => {
  //console.log(req.query);
  const userName = req.query.userName;

  mongoose.connect(url, async (err, db) => {
    const orders = await db
      .collection("creds")
      .find({ name: userName }, { projection: { _id: 0, orders: 1 } })
      .toArray();
    res.send(200, { result: orders });
  });
});

module.exports = router;
