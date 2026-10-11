const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| FOOD SCHEMA
|--------------------------------------------------------------------------
| This schema defines the structure of every food item stored in MongoDB.
|
| Example MongoDB document:
|
| {
|   name: "Chicken Burger",
|   description: "Juicy chicken burger with fresh vegetables",
|   price: 199,
|   category: "Burger",
|   image: "https://example.com/burger.jpg",
|   isAvailable: true
| }
|--------------------------------------------------------------------------
*/

const foodSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | FOOD NAME
    |--------------------------------------------------------------------------
    | trim: true removes unnecessary spaces.
    |
    | Example:
    | "  Chicken Burger  " becomes "Chicken Burger"
    */
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      minlength: [2, "Food name must contain at least 2 characters"],
      maxlength: [100, "Food name cannot exceed 100 characters"],
    },

    /*
    |--------------------------------------------------------------------------
    | FOOD DESCRIPTION
    |--------------------------------------------------------------------------
    */
    description: {
      type: String,
      required: [true, "Food description is required"],
      trim: true,
      minlength: [5, "Description must contain at least 5 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    /*
    |--------------------------------------------------------------------------
    | FOOD PRICE
    |--------------------------------------------------------------------------
    | min: 0 prevents negative prices.
    */
    price: {
      type: Number,
      required: [true, "Food price is required"],
      min: [0, "Food price cannot be negative"],
    },

    /*
    |--------------------------------------------------------------------------
    | FOOD CATEGORY
    |--------------------------------------------------------------------------
    | enum allows only the listed category values.
    */
    category: {
      type: String,
      required: [true, "Food category is required"],
      enum: [
        "Burger",
        "Pizza",
        "Wrap",
        "Sandwich",
        "Fries",
        "Drink",
        "Dessert",
        "Other",
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | FOOD IMAGE
    |--------------------------------------------------------------------------
    | For now, we store an image URL.
    |
    | Later we can upload images using Cloudinary.
    */
    image: {
      type: String,
      required: [true, "Food image URL is required"],
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AVAILABILITY
    |--------------------------------------------------------------------------
    | true  = customer can order this food.
    | false = item is out of stock.
    */
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    /*
    |--------------------------------------------------------------------------
    | TIMESTAMPS
    |--------------------------------------------------------------------------
    | MongoDB automatically stores:
    |
    | createdAt
    | updatedAt
    */
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
| MongoDB collection will usually be created as:
|
| foods
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model("Food", foodSchema);