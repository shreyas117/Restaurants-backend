const express = require("express");
const mongoose = require("mongoose");
var router = require("express").Router();
const cors = require("cors");
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

router.post("/", urlencodedParser, (req, res) => {
  //console.log(req.query);
  //console.log(req.body);
  const userName = req.query.name;
  const restId = req.query.restId;
  const bill = req.query.bill;
  const orderItems = req.body;

  mongoose.connect(url, async (err, db) => {
    const restNameArray = await db
      .collection("rests")
      .find({ _id: ObjectId(restId) }, { projection: { _id: 0, name: 1 } })
      .toArray();

    const restName = restNameArray[0].name;

    db.collection("creds").updateOne(
      { name: userName },
      {
        $push: {
          orders: {
            $each: [
              {
                restId: ObjectId(restId),
                restName: restName,
                timestamp: new Date(),
                bill: bill,
                orderItems: orderItems,
              },
            ],
          },
        },
      },
      function (err, data) {
        if (err) {
          res.send(err);
        }
        res.send(200, { result: "Your order has been placed successfully!" });
      }
    );
  });
});

module.exports = router;
