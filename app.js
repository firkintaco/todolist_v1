const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

var itemList = ["Start your day"];
app.get("/", (req, res) => {
  var today = new Date();
  var dayToShow = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  res.render("list", { smallTitle: dayToShow, itemList: itemList });
});

app.post("/", (req, res) => {
  var newItem = req.body.newItem;
  itemList.push(newItem);
  if (newItem === "/clear") {
    itemList = [];
  }
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is up...");
});
