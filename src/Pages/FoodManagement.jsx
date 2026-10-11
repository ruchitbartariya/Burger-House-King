import { useEffect, useState } from "react";

export const FoodManagement = () => {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  // Stores all food items fetched from the backend.
  const [foods, setFoods] = useState([]);

  // Controls the loading message while fetching data.
  const [loading, setLoading] = useState(true);

  // Stores API or validation errors.
  const [error, setError] = useState("");

  // Stores the ID of the food being edited.
  // null means the form is currently in "Add Food" mode.
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Stores all form input values.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Burger",
    image: "",
    isAvailable: true,
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH ALL FOODS
  |--------------------------------------------------------------------------
  */

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/foods");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch food items");
      }

      setFoods(data.foods || []);
    } catch (err) {
      console.error("Fetch foods error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RUN ON PAGE LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchFoods();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE FORM INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Burger",
      image: "",
      isAvailable: true,
    });

    setEditingFoodId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | ADD OR UPDATE FOOD
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.image.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const foodData = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      const isEditing = Boolean(editingFoodId);

      const url = isEditing
        ? `http://localhost:5000/api/foods/${editingFoodId}`
        : "http://localhost:5000/api/foods";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to save food item");
        return;
      }

      if (isEditing) {
        /*
        Replace the old food item in state with the updated food item.
        */
        setFoods((previousFoods) =>
          previousFoods.map((food) =>
            food._id === editingFoodId ? data.food : food
          )
        );

        alert("Food updated successfully");
      } else {
        /*
        Add the newly created food item at the beginning of the list.
        */
        setFoods((previousFoods) => [data.food, ...previousFoods]);

        alert("Food added successfully");
      }

      resetForm();
    } catch (err) {
      console.error("Save food error:", err);
      alert("Something went wrong");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | START EDITING
  |--------------------------------------------------------------------------
  */

  const handleEdit = (food) => {
    setEditingFoodId(food._id);

    setFormData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      category: food.category || "Burger",
      image: food.image || "",
      isAvailable: food.isAvailable ?? true,
    });

    // Move the page back to the form.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE FOOD
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (foodId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this food item?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/foods/${foodId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to delete food item");
        return;
      }

      setFoods((previousFoods) =>
        previousFoods.filter((food) => food._id !== foodId)
      );

      if (editingFoodId === foodId) {
        resetForm();
      }

      alert("Food deleted successfully");
    } catch (err) {
      console.error("Delete food error:", err);
      alert("Something went wrong");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE AVAILABILITY
  |--------------------------------------------------------------------------
  | For now, we reuse the PUT API and send the complete food object
  | with the opposite isAvailable value.
  |--------------------------------------------------------------------------
  */

  const handleAvailabilityToggle = async (food) => {
    const updatedFoodData = {
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      isAvailable: !food.isAvailable,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/foods/${food._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFoodData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to update availability");
        return;
      }

      setFoods((previousFoods) =>
        previousFoods.map((currentFood) =>
          currentFood._id === food._id ? data.food : currentFood
        )
      );
    } catch (err) {
      console.error("Availability update error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F5EC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8A5A44]">
            Menu Administration
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold text-[#4B2418] mt-2">
            Food Management
          </h1>

          <p className="text-[#6D4C41] mt-3">
            Add, edit, delete and control food availability.
          </p>
        </div>

        {/* Add/Edit form */}
        <section className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-3xl p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#4B2418]">
                {editingFoodId ? "Edit Food Item" : "Add New Food"}
              </h2>

              <p className="text-[#6D4C41] mt-1">
                {editingFoodId
                  ? "Update the selected food item."
                  : "Create a new menu item for customers."}
              </p>
            </div>

            {editingFoodId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-xl font-bold"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block font-bold text-[#4B2418] mb-2">
                Food Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Chicken Burger"
                className="w-full bg-white border border-[#DCCFB8] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#5A2D20]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#4B2418] mb-2">
                Price
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="199"
                min="0"
                className="w-full bg-white border border-[#DCCFB8] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#5A2D20]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#4B2418] mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white border border-[#DCCFB8] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#5A2D20]"
              >
                <option value="Burger">Burger</option>
                <option value="Pizza">Pizza</option>
                <option value="Wrap">Wrap</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Fries">Fries</option>
                <option value="Drink">Drink</option>
                <option value="Dessert">Dessert</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#4B2418] mb-2">
                Image URL
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/food.jpg"
                className="w-full bg-white border border-[#DCCFB8] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#5A2D20]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#4B2418] mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description of the food item"
                rows="4"
                className="w-full bg-white border border-[#DCCFB8] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#5A2D20] resize-none"
                required
              />
            </div>

            <label className="md:col-span-2 flex items-center gap-3 text-[#4B2418] font-bold">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-5 h-5"
              />

              Available for customers
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-[#5A2D20] hover:bg-[#3E1E14] text-white px-7 py-3 rounded-xl font-bold transition"
              >
                {editingFoodId ? "Update Food" : "Add Food"}
              </button>
            </div>
          </form>
        </section>

        {/* API error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Food list heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#4B2418]">
              Menu Items
            </h2>

            <p className="text-[#6D4C41] mt-1">
              {foods.length} food item(s) found
            </p>
          </div>

          <button
            type="button"
            onClick={fetchFoods}
            className="self-start bg-[#FFFDF8] border border-[#DCCFB8] text-[#4B2418] px-5 py-2.5 rounded-xl font-bold hover:bg-[#EFE7D6]"
          >
            Refresh Foods
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-[#4B2418]">
              Loading food items...
            </h2>
          </div>
        ) : foods.length === 0 ? (
          <div className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-bold text-[#4B2418]">
              No food items found
            </h2>

            <p className="text-[#6D4C41] mt-2">
              Add your first menu item using the form above.
            </p>
          </div>
        ) : (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <article
                key={food._id}
                className="bg-[#FFFDF8] border border-[#DCCFB8] rounded-3xl overflow-hidden shadow-sm"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-52 object-cover"
                />

                <div className="p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#8A5A44]">
                        {food.category}
                      </p>

                      <h3 className="text-2xl font-bold text-[#4B2418] mt-1">
                        {food.name}
                      </h3>
                    </div>

                    <span className="text-xl font-bold text-[#5A2D20]">
                      ₹{food.price}
                    </span>
                  </div>

                  <p className="text-[#6D4C41] mt-3">
                    {food.description}
                  </p>

                  <div className="mt-4">
                    <span
                      className={`inline-block border px-3 py-1 rounded-full text-sm font-bold ${
                        food.isAvailable
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {food.isAvailable
                        ? "Available"
                        : "Out of Stock"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => handleEdit(food)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(food._id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold"
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAvailabilityToggle(food)}
                      className="col-span-2 bg-[#5A2D20] hover:bg-[#3E1E14] text-white py-2.5 rounded-xl font-bold"
                    >
                      Mark as{" "}
                      {food.isAvailable
                        ? "Out of Stock"
                        : "Available"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};