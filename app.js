const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://firkintaco:hNgVFhyNGID0cOew@cluster0.t7y0s13.mongodb.net/todolistDB?retryWrites=true&w=majority"
);

const schema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [schema],
});
const List = mongoose.model("List", listSchema);
const Item = new mongoose.model("Item", schema);

const item1 = new Item({ name: "Start writing todo's" });
const item2 = new Item({ name: "<-- You can delete clicking this" });
const item3 = new Item({ name: "Do something3" });

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  const day = date.getDate();
  const items = Item.find({}).then((items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => console.log("Inserted default data"))
        .catch((error) => console.log(error));
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = new Item({
    name: req.body.newItem,
  });
  const listName = req.body.list;
  if (listName === date.getDate()) {
    itemName.save();
    console.log("Added new item: " + itemName);
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(itemName);
        foundList.save();
        res.redirect("/" + listName);
        console.log("Added new item: " + itemName + " to list " + listName);
      })
      .catch((err) => console.log(err));
  }
});
app.post("/delete", function (req, res) {
  const checkedItem = req.body.id;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(checkedItem)
      .then(console.log("Deleted item with id " + checkedItem))
      .catch((err) => console.log(err));
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } }
    )
      .then((foundList) => {
        console.log(
          "Removed item with id " + checkedItem + " from list " + listName
        );
        res.redirect("/" + req.body.listName);
      })
      .catch((err) => console.log(err));
  }
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:list", function (req, res) {
  const customListName = _.capitalize(req.params.list);
  const list = new List({
    name: customListName,
    items: defaultItems,
  });
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // Create new list with customListName
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Render found list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => console.log(err));
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
