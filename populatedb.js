#! /usr/bin/env node

console.log(
  "This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true"
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

function itemCreate(
  name,
  description,
  category,
  price,
  numberInStock,
  image,
  cb
) {
  itemdetail = {
    name: name,
    category: category,
    price: price,
    numberInStock: numberInStock
  };
  if (description != false) itemdetail.description = description;
  if (image != false) itemdetail.image = image;

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
        categoryCreate("Breads and Cakes", "Fresh from the oven", callback);
      },
      function(callback) {
        categoryCreate("Cereals", "For your breakfast", callback);
      },
      function(callback) {
        categoryCreate("Fruits", "Fresh, organic fruits", callback);
      },
      function(callback) {
        categoryCreate("Legumes", "An important source of protein", callback);
      },
      function(callback) {
        categoryCreate(
          "Nuts and Seeds",
          "In between or as a topping - always delicious",
          callback
        );
      },
      function(callback) {
        categoryCreate("Vegetables", "Fresh, organic vegetables", callback);
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
          "Bananas",
          "From Costa Rica",
          categories[2],
          1.29,
          50,
          "e5b49299572aec0b1ff4a83b6b3ca238",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Chocolate Cake",
          "For chocolate lovers",
          categories[0],
          5.0,
          5,
          "e718965a55cbe956204c767d455db28c",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Cinnamon Rolls",
          "So sweet",
          categories[0],
          3.0,
          20,
          "4b0ccdae25249eec919de9bdfb109dc5",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Bread",
          "With our famous crust",
          categories[0],
          1.5,
          10,
          "db30f525ef4e898f002436185ed7984d",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Apples",
          "From Germany",
          categories[2],
          0.99,
          100,
          "e3d1ef7122aab85ad1a7d51e114328de",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Pears",
          "From Austria",
          categories[2],
          1.99,
          200,
          "496ecbb6abed3caadf58dc2f01cfbd78",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Oranges",
          "From Spain",
          categories[2],
          1.49,
          100,
          "6008d97a7b5cdbed6fd737171f0b83e2",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Grapes",
          "From France",
          categories[2],
          2.99,
          80,
          "35c0d4266c53ac2cf120d9dbd672206a",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Carrots",
          "From Germany",
          categories[5],
          0.49,
          100,
          "0c6f36fa51d0d573ddd07dc1041a21f5",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Cauliflower",
          "From Germany",
          categories[5],
          0.89,
          25,
          "f492b2fb1b27ea1ac7f7d09ac443bd31",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Tomatoes",
          "From Holland",
          categories[5],
          0.99,
          100,
          "1109988e8b532cd36c5b15698454c621",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Bell Peppers",
          "From Poland",
          categories[5],
          1.99,
          150,
          "1a985895bfb004cbe6101bcebe57f979",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Mixed Beans",
          "From all over the world",
          categories[3],
          0.99,
          200,
          "03ed3b91e1647e7007799944be4b93f2",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Chickpeas",
          "From India",
          categories[3],
          0.89,
          400,
          "6f8757945ceb7607898ca6937dda185f",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Red Beans",
          "From Mexico",
          categories[3],
          0.59,
          400,
          "b789b12c9ea14dc61d988cd30e9e036e",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Walnuts",
          "From Switzerland",
          categories[4],
          2.99,
          100,
          "5cdd98d8baa139db9f21f5a1e92448ee",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Hazelnuts",
          "From Austria",
          categories[4],
          2.99,
          80,
          "64a4a6209a4dc513a0c707878e488de6",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Pumpkin Seeds",
          "From France",
          categories[4],
          3.99,
          100,
          "644001b6ab8b805f8974b86b948d2453",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Almonds",
          "From Morocco",
          categories[4],
          3.99,
          120,
          "01940d04bac54289b7620f9aef70f463",
          callback
        );
      },
      function(callback) {
        itemCreate(
          "Cashew Nuts",
          "From Pakistan",
          categories[4],
          4.99,
          50,
          "4cbe4bc5639d114bbb760a557c8a2a87",
          callback
        );
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
