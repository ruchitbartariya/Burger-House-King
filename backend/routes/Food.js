const express = require("express");
const Food = require("../models/Food");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL FOOD ITEMS
|--------------------------------------------------------------------------
| Method : GET
| Route  : /api/foods
|
| Purpose:
| Returns all food items stored in MongoDB.
|
| Example:
| GET http://localhost:5000/api/foods
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    // Fetch all food items and sort newest first.
    const foods = await Food.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Fetch Food Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch food items.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ADD NEW FOOD ITEM
|--------------------------------------------------------------------------
| Method : POST
| Route  : /api/foods
|
| Purpose:
| Adds a new food item into MongoDB.
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable,
    } = req.body;

    // Create a new Food document.
    const food = new Food({
      name,
      description,
      price,
      category,
      image,
      isAvailable,
    });

    // Save to MongoDB.
    await food.save();

    res.status(201).json({
      success: true,
      message: "Food added successfully.",
      food,
    });
  } catch (error) {
    console.error("Add Food Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE FOOD
|--------------------------------------------------------------------------
| Method : PUT
| URL    : /api/foods/:id
| Purpose:
| 1. Find food by ID
| 2. Update only the fields sent by the admin
| 3. Return the updated food
|--------------------------------------------------------------------------
*/

router.put("/:id", async (req, res) => {
  try {
    // Get the food ID from the URL
    const { id } = req.params;

    // Get updated data from the request body
    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable,
    } = req.body;

    // Find the food and update it
    const updatedFood = await Food.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        image,
        isAvailable,
      },
      {
        new: true,          // Return updated document
        runValidators: true // Apply schema validation
      }
    );

    // If no food exists with this ID
    if (!updatedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update food",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE FOOD
|--------------------------------------------------------------------------
| Method : DELETE
| URL    : /api/foods/:id
|
| Purpose:
| 1. Get the food ID from the URL
| 2. Find and delete that food from MongoDB
| 3. Return a success response
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
  try {
    // The ID comes from the URL.
    // Example: /api/foods/12345
    const { id } = req.params;

    // Find the food item by ID and delete it.
    const deletedFood = await Food.findByIdAndDelete(id);

    // If MongoDB cannot find a food item with this ID.
    if (!deletedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Successful deletion response.
    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
      food: deletedFood,
    });
  } catch (error) {
    console.error("Delete Food Error:", error);

    // Invalid MongoDB IDs usually create a CastError.
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to delete food",
      error: error.message,
    });
  }
});

module.exports = router;