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
          //console.log("already exists");
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

module.exports = router;
