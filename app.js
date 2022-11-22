const express = require("express");
const mongoose = require("mongoose");
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

var url1 = "mongodb://localhost:27017/newDb";

app.use(cors({ origin: "*" }));

// mongoose.connect(url1, function (err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });

app.use("/addUsers", (req, res) => {
  mongoose.connect(url, async function (err, db) {
    if (err) throw err;
    // var dbo = db.("products");

    // db.collection("table1").insertOne({
    //     name: "Marsh",
    //     age: "6 years",
    //     species: "Dog",
    //     ownerAddress: "380 W. Fir Ave",
    //     chipped: true
    // });
    db.collection("creds").insertMany([
      {
        name: "Commander Shepard",
        company: "N7 Systems Alliance",
        role: "Spectre",
      },
      {
        name: "Kaidan Alenko",
        specialist: "sentinel",
      },
    ]);
  });
});

app.post("/validate", urlencodedParser, (req, res) => {
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

app.post("/signup", urlencodedParser, (req, res) => {
  //console.log(req.query);
  var userName = req.query.userName;
  var password1 = req.query.password;
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
  //console.log(typeof(userName));
});

app.post("/changePassword", urlencodedParser, (req, res) => {
  var name = req.query.userName;
  var oldPass = req.query.oldPassword;
  var newPass = req.query.newPassword;

  mongoose.connect(url, async (err, db) => {
    if (err) throw err;
    var x = await db.collection("creds").findOne({
      name: name,
      password: oldPass,
    });
    if (x != null) {
      // first check if newPassword and oldPassword are same,
      if (oldPass == newPass) {
        return res.send(200, {
          status: 404,
          result: "New Password and Old Password can't be same",
        });
      }

      // Before updating check if new password is not same as previous 3 passwords

      var check = await db
        .collection("creds")
        .findOne({ name: name, previousPasswords: { $exists: true } });

      // if check is empty it means previousPasswords array doesn't exist.. so create new field and add to document
      if (check == null) {
        db.collection("creds").updateOne(
          { name: name },
          { $set: { password: newPass, previousPasswords: [oldPass] } }
        );
      } else {
        // previousPasswords array already exists..
        // first check if new password already exists in previous 3 passwords
        previousPasswordsList = check.previousPasswords;
        if (previousPasswordsList.includes(newPass)) {
          console.log("already exists");
          return res.send(200, {
            status: 404,
            result: "New Password can't be previous 3 passwords",
          });
        } else {
          // safe to enter new password as its completely new (not previous 3 old passwords)
          // check length == 3, pop oldest password (last element of array)
          if (previousPasswordsList.length == 3) {
            previousPasswordsList.pop();
          }
          // append current old password at beginning of array
          previousPasswordsList.unshift(oldPass);

          db.collection("creds").updateOne(
            { name: name },
            {
              $set: {
                password: newPass,
                previousPasswords: previousPasswordsList,
              },
            }
          );
        }
      }

      // db.collection("creds").updateOne(
      //   { name: name },
      //   { $set: { password: newPass } }
      // );
      return res.send(200, {
        status: 200,
        result: "Password Changed Successfully!",
      });
    } else {
      return res.send(200, {
        status: 404,
        result: "Incorrect Credentials Entered",
      });
    }
  });
});

app.get("/getRests", urlencodedParser, (req, res) => {
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

app.post("/home/addRest", urlencodedParser, (req, res) => {
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

app.post("/submitDetails", urlencodedParser, (req, res) => {
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

app.post("/home/editRest", urlencodedParser, (req, res) => {
  mongoose.connect(url, async (err, db) => {
    //console.log(req.query);
    //console.log(JSON.parse(req.body));
    db.collection("rests").updateOne({
      $set: {
        name: req.query.name,
        imgURL: req.query.imgURL,
        pinCode: parseInt(req.query.pinCode),
        info: req.query.info,
        menu: req.body,
      },
    });
  });
});

app.use("/", (req, res) => {
  mongoose.connect(url, async function (err, db) {
    if (err) throw err;
    // var dbo = db.("products");
    var x = await db
      .collection("table1")
      .find({ role: "Spectre" })
      .toArray((err, results) => {
        //console.log(results);
        res.jsonp(results);
      });

    // db.collection("table1").insertOne({
    //     name: "Marsh",
    //     age: "6 years",
    //     species: "Dog",
    //     ownerAddress: "380 W. Fir Ave",
    //     chipped: true
    // });
    // db.collection("table1").insertMany([{
    //     name : "Commander Shepard",
    //     company : "N7 Systems Alliance",
    //     role : "Spectre"
    // },
    // {
    //     name : "Kaidan Alenko",
    //     specialist : "sentinel"
    // }])
  });
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
