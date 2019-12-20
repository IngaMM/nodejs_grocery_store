#! /usr/bin/env node

console.log(
  "This script populates some test categories and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Category = require("./models/category");
var Item = require("./models/item");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
  categorydetail = { name: name };
  if (description != false) categorydetail.description = description;

  var category = new Category(categorydetail);

  category.save(function(err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, price, numberInStock, cb) {
  itemdetail = {
    name: name,
    category: category,
    price: price,
    numberInStock: numberInStock
  };
  if (description != false) itemdetail.description = description;

  var item = new Item(itemdetail);

  item.save(function(err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function(callback) {
        categoryCreate("Fruits", false, callback);
      },
      function(callback) {
        categoryCreate("Vegetables", false, callback);
      },
      function(callback) {
        categoryCreate("Cereals", "Oatmeal, cornflakes, muesli...", callback);
      },
      function(callback) {
        categoryCreate("Dairy products", "Milk, yoghurt, cheese...", callback);
      },
      function(callback) {
        categoryCreate("Sweets", "Chocolate, candies...", callback);
      }
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function(callback) {
        itemCreate(
          "Banana",
          "From Ecuador",
          categories[0],
          1.99,
          100,
          callback
        );
      },
      function(callback) {
        itemCreate("Apple", "From Germany", categories[0], 0.99, 500, callback);
      },
      function(callback) {
        itemCreate("Pear", "From Austria", categories[0], 1.49, 200, callback);
      },
      function(callback) {
        itemCreate("Carrot", false, categories[1], 0.49, 800, callback);
      },
      function(callback) {
        itemCreate(
          "Cabbage",
          "From Poland",
          categories[1],
          0.89,
          100,
          callback
        );
      },
      function(callback) {
        itemCreate("Oatmeal", "Fine oats", categories[2], 0.39, 50, callback);
      },
      function(callback) {
        itemCreate("Oatmeal", "Coarse oats", categories[2], 0.39, 50, callback);
      },
      function(callback) {
        itemCreate("Cornflakes", false, categories[2], 0.59, 80, callback);
      },
      function(callback) {
        itemCreate("Milk", "From Germany", categories[3], 0.99, 70, callback);
      }
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function(err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Items: " + items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
