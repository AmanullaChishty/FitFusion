import { useState } from "react";
import { createMeal } from "../services/mealService";
import toast from "react-hot-toast";

interface LogMealFormProps {
  onMealAdded: () => void;
}

export default function LogMealForm({ onMealAdded }: LogMealFormProps) {
  const [form, setForm] = useState({
    meal_type: "breakfast",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [foodItems, setFoodItems] = useState([{ qty: "", item: "" }]);
  const [loading, setLoading] = useState(false);

  // Handle basic input changes (calories, macros, date, etc.)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle dynamic food item inputs
  const handleFoodItemChange = (
    index: number,
    field: "qty" | "item",
    value: string
  ) => {
    const newItems = [...foodItems];
    newItems[index][field] = value;
    setFoodItems(newItems);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, { qty: "", item: "" }]);
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      // Validate food items
      const validFoodItems = foodItems.filter(
        (f) => f.qty.trim() !== "" && f.item.trim() !== ""
      );

      if (validFoodItems.length === 0) {
        toast.error("Please add at least one food item.");
        setLoading(false);
        return;
      }

      await createMeal(token, {
        ...form,
        meal_type: form.meal_type as
          | "breakfast"
          | "lunch"
          | "dinner"
          | "snack",
        food_items: validFoodItems,
        calories: parseInt(form.calories),
        protein_g: parseFloat(form.protein_g),
        carbs_g: parseFloat(form.carbs_g),
        fats_g: parseFloat(form.fats_g),
      });

      toast.success("Meal logged successfully!");
      setForm({
        ...form,
        calories: "",
        protein_g: "",
        carbs_g: "",
        fats_g: "",
      });
      setFoodItems([{ qty: "", item: "" }]);
      onMealAdded();
    } catch (err) {
      console.error(err);
      toast.error("Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded-lg shadow space-y-4"
    >
      <h2 className="text-xl font-semibold">Log a Meal</h2>

      {/* Meal Type */}
      <div>
        <label className="block mb-1 font-medium">Meal Type</label>
        <select
          name="meal_type"
          value={form.meal_type}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      {/* Food Items */}
      <div>
        <label className="block mb-1 font-medium">Food Items</label>
        {foodItems.map((fi, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Qty (e.g. 150g)"
              value={fi.qty}
              onChange={(e) =>
                handleFoodItemChange(index, "qty", e.target.value)
              }
              className="w-1/3 border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Item (e.g. fish)"
              value={fi.item}
              onChange={(e) =>
                handleFoodItemChange(index, "item", e.target.value)
              }
              className="w-2/3 border rounded p-2"
              required
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeFoodItem(index)}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addFoodItem}
          className="text-blue-600 text-sm underline"
        >
          + Add Food Item
        </button>
      </div>

      {/* Macros */}
      {["calories", "protein_g", "carbs_g", "fats_g"].map((field) => (
        <div key={field}>
          <label className="block mb-1 font-medium capitalize">
            {field.replace("_g", field === "calories" ? "" : " (g)")}
          </label>
          <input
            type="number"
            name={field}
            value={form[field as keyof typeof form]}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>
      ))}

      {/* Date */}
      <div>
        <label className="block mb-1 font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Logging..." : "Log Meal"}
      </button>
    </form>
  );
}
