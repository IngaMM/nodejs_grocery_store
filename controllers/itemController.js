var Item = require("../models/item");
var Category = require("../models/category");
var async = require("async");
var fs = require("fs");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

// Display list of all Items.
exports.item_list = function(req, res, next) {
  Item.find({}, "name category")
    .populate("category")
    .exec(function(err, list_items) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("item_list", { title: "Item List", item_list: list_items });
    });
};

// Display detail page for a specific Item.
exports.item_detail = function(req, res, next) {
  Item.findById(req.params.id)
    .populate("category")
    .exec(function(err, item) {
      if (err) {
        return next(err);
      }
      if (item == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        title: "Item Detail",
        item: item
      });
    });
};

// Display Item create form on GET.
exports.item_create_get = function(req, res, next) {
  // Get all categories, which we can use for adding to our item.
  Category.find(function(err, categories) {
    if (err) {
      return next(err);
    }
    res.render("item_form", {
      title: "Create Item",
      categories: categories
    });
  });
};

// Handle Item create on POST.
exports.item_create_post = [
  // Validate fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("price", "Price must be greater than zero.")
    .trim()
    .isFloat({ gt: 0.0 }),
  body("numberInStock", "Number must be an integer equal or greater than 0")
    .trim()
    .isFloat({ ge: 0 }),

  // Sanitize fields (using wildcard).
  sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    var item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock
    });

    // Set image if a file is uploaded
    if (req.file) {
      item.image = req.file.filename;
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      Category.find(function(err, categories) {
        if (err) {
          return next(err);
        }

        res.render("item_form", {
          title: "Create Item",
          item: item,
          categories: categories,
          errors: errors.array()
        });
      });
      return;
    } else {
      // Data from form is valid. Save item.
      item.save(function(err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new item record.
        res.redirect(item.url);
      });
    }
  }
];

// Display Item delete form on GET.
exports.item_delete_get = function(req, res, next) {
  Item.findById(req.params.id).exec(function(err, item) {
    if (err) {
      return next(err);
    }
    if (item == null) {
      // No results.
      res.redirect("/inventory/items");
    }
    // Successful, so render.
    res.render("item_delete", {
      title: "Delete Item",
      item: item
    });
  });
};

// Handle Item delete on POST.
exports.item_delete_post = function(req, res, next) {
  Item.findById(req.body.itemid).exec(function(err, results) {
    if (err) {
      return next(err);
    }

    // Success
    // Remove image if present
    if (req.body.imageName) {
      fs.stat("./public/images/" + req.body.imageName, function(err, stats) {
        if (err) {
          return console.error(err);
        }
        fs.unlink("./public/images/" + req.body.imageName, function(err) {
          if (err) return console.log(err);
          console.log("image deleted successfully");
        });
      });
    }

    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
      if (err) {
        return next(err);
      }
      // Success - go to items list
      res.redirect("/inventory/items");
    });
  });
};

// Display Item update form on GET.
exports.item_update_get = function(req, res, next) {
  // Get item and categories for form.
  async.parallel(
    {
      item: function(callback) {
        Item.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      categories: function(callback) {
        Category.find(callback);
      }
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("item_form", {
        title: "Update Item",
        categories: results.categories,
        item: results.item
      });
    }
  );
};

// Handle Item update on POST.
exports.item_update_post = [
  // Validate fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("price", "Price must be greater than zero.")
    .trim()
    .isFloat({ gt: 0.0 }),
  body("numberInStock", "Number must be an integer equal or greater than 0")
    .trim()
    .isFloat({ ge: 0 }),

  // Sanitize fields (using wildcard).
  sanitizeBody("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped/trimmed data and old id.
    var item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      image: req.body.previousImage,
      _id: req.params.id //This is required, or a new ID will be assigned!
    });

    // Remove image if requested
    if (req.body.deleteImage) {
      item.image = "";
      fs.stat("./public/images/" + req.body.previousImage, function(
        err,
        stats
      ) {
        if (err) {
          return console.error(err);
        }
        fs.unlink("./public/images/" + req.body.previousImage, function(err) {
          if (err) return console.log(err);
          console.log("image deleted successfully");
        });
      });
    }

    // Update image if a file is uploaded
    if (req.file) {
      item.image = req.file.filename;
      // Remove previous image
      fs.stat("./public/images/" + req.body.previousImage, function(
        err,
        stats
      ) {
        if (err) {
          return console.error(err);
        }
        fs.unlink("./public/images/" + req.body.previousImage, function(err) {
          if (err) return console.log(err);
          console.log("previous image deleted successfully");
        });
      });
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      Category.find(function(err, categories) {
        if (err) {
          return next(err);
        }

        res.render("item_form", {
          title: "Update Item",
          categories: categories,
          item: item,
          errors: errors.array()
        });
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Item.findByIdAndUpdate(req.params.id, item, {}, function(err, theitem) {
        if (err) {
          return next(err);
        }
        // Success - go to items list
        res.redirect(theitem.url);
      });
    }
  }
];
