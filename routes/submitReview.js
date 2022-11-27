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

    db.collection("rests").updateOne(
      { _id: ObjectId(req.query.id) },
      {
        $push: {
          feedback: {
            $each: [
              {
                name: req.query.name,
                rating: parseFloat(req.query.rating),
                feedback: req.query.comments,
              },
            ],
            $position: 0,
          },
        },
        // $set : {
        //   rating : ((req.query.feedback.length * rating) + (req.query.rating))/(req.query.comments.length + 1)
        // }
      }
    );

    var prevRating = await db
      .collection("rests")
      .findOne(
        { _id: ObjectId(req.query.id) },
        { projection: { _id: 0, rating: 1 } }
      );

    const newRating =
      req.body.length == undefined
        ? parseFloat(req.query.rating)
        : (req.body.length * prevRating.rating + parseFloat(req.query.rating)) /
          (req.body.length + 1);

    // console.log(
    //   req.body.length == undefined,
    //   req.body,
    //   prevRating.rating,
    //   parseFloat(req.query.rating),
    //   newRating
    // );
    db.collection("rests").updateOne(
      { _id: ObjectId(req.query.id) },
      { $set: { rating: newRating } }
    );

    //console.log(prevRating);

    // Update Rating value
  });
});

module.exports = router;
