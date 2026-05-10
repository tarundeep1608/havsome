/**
 * Menu seed data for Havsome - Run this once to populate Firestore
 * Usage: Import and call seedMenu() from browser console or a temp page
 */
export const SEED_DATA = [
  // Pocket Pizzas
  { name: "Golden Corn Pizza", price: 80, category: "Pocket Pizzas", type: "veg", description: "6\" pocket pizza" },
  { name: "Onion Pizza", price: 80, category: "Pocket Pizzas", type: "veg", description: "6\" pocket pizza" },
  { name: "Capsicum Pizza", price: 80, category: "Pocket Pizzas", type: "veg", description: "6\" pocket pizza" },
  { name: "Paneer Pizza", price: 90, category: "Pocket Pizzas", type: "veg", description: "6\" pocket pizza" },

  // Premium Pizzas (Veg)
  { name: "Margherita Pizza", price: 120, category: "Premium Pizzas (Veg)", type: "veg", sizes: [{label:"7\"",price:120},{label:"10\"",price:240},{label:"12\"",price:360}] },
  { name: "Cheese & Corn", price: 140, category: "Premium Pizzas (Veg)", type: "veg", sizes: [{label:"7\"",price:140},{label:"10\"",price:280},{label:"12\"",price:420}] },
  { name: "3 Pepper Pizza", price: 150, category: "Premium Pizzas (Veg)", type: "veg", description: "Capsicum, Red Peppericka, Jalapeno", sizes: [{label:"7\"",price:150},{label:"10\"",price:300},{label:"12\"",price:450}] },
  { name: "Romania Veg", price: 150, category: "Premium Pizzas (Veg)", type: "veg", description: "Mushrooms, Onion, Olives, Peppericka", sizes: [{label:"7\"",price:150},{label:"10\"",price:300},{label:"12\"",price:450}] },
  { name: "Indi Veg", price: 150, category: "Premium Pizzas (Veg)", type: "veg", description: "Onion, Capsicum, Golden corn", sizes: [{label:"7\"",price:150},{label:"10\"",price:300},{label:"12\"",price:450}] },
  { name: "Paneer Makhani", price: 180, category: "Premium Pizzas (Veg)", type: "veg", description: "Paneer, Onion, Capsicum, Peppricka", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },
  { name: "Tandoori Paneer", price: 180, category: "Premium Pizzas (Veg)", type: "veg", description: "Paneer, Capsicum, Onion, Peppricka", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },
  { name: "Paneer Pepper", price: 180, category: "Premium Pizzas (Veg)", type: "veg", description: "Paneer, Capsicum, Onion, Peppricka", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },
  { name: "Veggie Supreme", price: 180, category: "Premium Pizzas (Veg)", type: "veg", description: "Corn, Capsicum, Onion, Mushroom, Olives, Peppericka, Jalapeno", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },

  // Premium Pizzas (Non-Veg)
  { name: "Peri-Peri Chicken Pizza", price: 180, category: "Premium Pizzas (Non-Veg)", type: "non-veg", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },
  { name: "Tandoori Chicken Pizza", price: 180, category: "Premium Pizzas (Non-Veg)", type: "non-veg", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },
  { name: "Makhani Chicken Pizza", price: 180, category: "Premium Pizzas (Non-Veg)", type: "non-veg", sizes: [{label:"7\"",price:180},{label:"10\"",price:340},{label:"12\"",price:530}] },

  // Garlic Bread
  { name: "Garlic Bread Sticks", price: 100, category: "Garlic Bread", type: "veg" },
  { name: "Cheesy Bread Sticks", price: 130, category: "Garlic Bread", type: "veg" },
  { name: "Classic Stuffed", price: 160, category: "Garlic Bread", type: "veg", description: "Best In Town" },
  { name: "Paneer Tikka Stuffed", price: 170, category: "Garlic Bread", type: "veg" },
  { name: "Veggie Delight Stuffed", price: 180, category: "Garlic Bread", type: "veg", description: "Mushroom, Capsicum & Onion" },
  { name: "Non-Veg Stuffed", price: 180, category: "Garlic Bread", type: "non-veg" },

  // Pasta
  { name: "White Sauce Pasta (Veg)", price: 170, category: "Pasta", type: "veg" },
  { name: "Red Sauce Pasta (Veg)", price: 170, category: "Pasta", type: "veg" },
  { name: "Mixed Sauce Pasta (Veg)", price: 190, category: "Pasta", type: "veg" },
  { name: "Cheese White Sauce (Veg)", price: 200, category: "Pasta", type: "veg" },
  { name: "Cheese Red Sauce (Veg)", price: 200, category: "Pasta", type: "veg" },
  { name: "Cheese Mixed Sauce (Veg)", price: 210, category: "Pasta", type: "veg" },
  { name: "White Sauce Pasta (Non-Veg)", price: 200, category: "Pasta", type: "non-veg" },
  { name: "Red Sauce Pasta (Non-Veg)", price: 210, category: "Pasta", type: "non-veg" },
  { name: "Mixed Sauce Pasta (Non-Veg)", price: 220, category: "Pasta", type: "non-veg" },
  { name: "Cheese White Sauce (Non-Veg)", price: 230, category: "Pasta", type: "non-veg" },
  { name: "Cheese Red Sauce (Non-Veg)", price: 230, category: "Pasta", type: "non-veg" },
  { name: "Cheese Mixed Sauce (Non-Veg)", price: 240, category: "Pasta", type: "non-veg" },

  // Burgers (Veg)
  { name: "Mini Veg Burger", price: 50, category: "Burgers (Veg)", type: "veg" },
  { name: "Classic Veg Burger", price: 90, category: "Burgers (Veg)", type: "veg" },
  { name: "Classic Veg Tangy & Spicy", price: 100, category: "Burgers (Veg)", type: "veg" },
  { name: "Loaded Cheesy Burger", price: 120, category: "Burgers (Veg)", type: "veg" },
  { name: "Crunchy Paneer Burger", price: 140, category: "Burgers (Veg)", type: "veg" },
  { name: "Peri-Peri Paneer Burger", price: 150, category: "Burgers (Veg)", type: "veg" },
  { name: "Makhani Paneer Burger", price: 150, category: "Burgers (Veg)", type: "veg" },

  // Burgers (Non-Veg)
  { name: "Mini Chicken Burger", price: 70, category: "Burgers (Non-Veg)", type: "non-veg" },
  { name: "Crispy Chicken Burger", price: 100, category: "Burgers (Non-Veg)", type: "non-veg" },
  { name: "Makhani Chicken Burger", price: 120, category: "Burgers (Non-Veg)", type: "non-veg" },
  { name: "Peri Peri Chicken Burger", price: 120, category: "Burgers (Non-Veg)", type: "non-veg" },
  { name: "Zinger Chicken Burger", price: 160, category: "Burgers (Non-Veg)", type: "non-veg" },

  // Wraps (Veg)
  { name: "Mini Veg Wrap", price: 60, category: "Wraps (Veg)", type: "veg" },
  { name: "Crispy Veg Wrap", price: 100, category: "Wraps (Veg)", type: "veg" },
  { name: "Loaded Cheesy Wrap", price: 130, category: "Wraps (Veg)", type: "veg" },
  { name: "Crunchy Paneer Wrap", price: 160, category: "Wraps (Veg)", type: "veg" },
  { name: "Peri-Peri Paneer Wrap", price: 170, category: "Wraps (Veg)", type: "veg" },

  // Wraps (Non-Veg)
  { name: "Mini Chicken Wrap", price: 80, category: "Wraps (Non-Veg)", type: "non-veg" },
  { name: "Crispy Chicken Wrap", price: 100, category: "Wraps (Non-Veg)", type: "non-veg" },
  { name: "Makhani Chicken Wrap", price: 120, category: "Wraps (Non-Veg)", type: "non-veg" },
  { name: "Peri Peri Chicken Wrap", price: 120, category: "Wraps (Non-Veg)", type: "non-veg" },
  { name: "Zinger Chicken Wrap", price: 170, category: "Wraps (Non-Veg)", type: "non-veg" },

  // Kurkure Momo
  { name: "Veg Kurkure Momo (5 Pcs)", price: 90, category: "Kurkure Momo", type: "veg" },
  { name: "Veg Kurkure Momo (8 Pcs)", price: 120, category: "Kurkure Momo", type: "veg" },
  { name: "Paneer Kurkure Momo (5 Pcs)", price: 120, category: "Kurkure Momo", type: "veg" },
  { name: "Paneer Kurkure Momo (8 Pcs)", price: 150, category: "Kurkure Momo", type: "veg" },
  { name: "Chicken Kurkure Momo (5 Pcs)", price: 130, category: "Kurkure Momo", type: "non-veg" },
  { name: "Chicken Kurkure Momo (8 Pcs)", price: 180, category: "Kurkure Momo", type: "non-veg" },
  { name: "Cheese N Corn Kurkure Momo (5 Pcs)", price: 180, category: "Kurkure Momo", type: "veg" },
  { name: "Cheese N Corn Kurkure Momo (8 Pcs)", price: 220, category: "Kurkure Momo", type: "veg" },

  // Chicken Popcorn
  { name: "Chicken Popcorn (Small - 150g)", price: 160, category: "Chicken Popcorn", type: "non-veg" },
  { name: "Chicken Popcorn (Medium - 200g)", price: 250, category: "Chicken Popcorn", type: "non-veg" },
  { name: "Chicken Popcorn (Large - 350g)", price: 330, category: "Chicken Popcorn", type: "non-veg" },

  // Sides
  { name: "Salted Fries", price: 100, category: "Sides", type: "veg" },
  { name: "Peri-Peri Fries", price: 130, category: "Sides", type: "veg" },
  { name: "Cheesy Fries", price: 150, category: "Sides", type: "veg" },

  // Desserts
  { name: "Choco Lava Cake", price: 90, category: "Desserts", type: "veg" },
  { name: "Hot Chocolate Brownie", price: 150, category: "Desserts", type: "veg" },
  { name: "Hot Nutella Brownie", price: 170, category: "Desserts", type: "veg" },
  { name: "Hot White Chocolate Brownie", price: 150, category: "Desserts", type: "veg" },
  { name: "Havsome Special Brownie", price: 160, category: "Desserts", type: "veg" },

  // Waffwich
  { name: "White Chocolate Waffwich", price: 140, category: "Waffwich", type: "veg", description: "With Ice Cream" },
  { name: "Dark Chocolate Waffwich", price: 140, category: "Waffwich", type: "veg", description: "With Ice Cream" },
  { name: "Nutella Waffwich", price: 170, category: "Waffwich", type: "veg", description: "With Ice Cream" },
  { name: "Nutella Brownie Waffwich", price: 180, category: "Waffwich", type: "veg", description: "With Ice Cream" },
  { name: "KitKat White Chocolate Waffwich", price: 160, category: "Waffwich", type: "veg", description: "With Ice Cream" },
  { name: "Oreo White Chocolate Waffwich", price: 150, category: "Waffwich", type: "veg", description: "With Ice Cream" },

  // Ice Tea
  { name: "Lemon Ice Tea", price: 100, category: "Ice Tea", type: "veg" },
  { name: "Peach Ice Tea", price: 100, category: "Ice Tea", type: "veg" },
  { name: "Watermelon Ice Tea", price: 100, category: "Ice Tea", type: "veg" },

  // Mocktails
  { name: "Virgin Mojito", price: 100, category: "Mocktails", type: "veg" },
  { name: "Blue Curacao Mojito", price: 100, category: "Mocktails", type: "veg" },
  { name: "Watermelon Mojito", price: 100, category: "Mocktails", type: "veg" },
  { name: "Peach Mojito", price: 100, category: "Mocktails", type: "veg" },
  { name: "Green Apple Mojito", price: 100, category: "Mocktails", type: "veg" },
  { name: "Chilli Guava Drink", price: 100, category: "Mocktails", type: "veg" },
  { name: "Sunset Cooler", price: 120, category: "Mocktails", type: "veg" },
  { name: "Spicy Mango Guava", price: 120, category: "Mocktails", type: "veg" },
  { name: "Electric Lagoon", price: 120, category: "Mocktails", type: "veg" },
  { name: "Mango Masala", price: 120, category: "Mocktails", type: "veg" },

  // Coffee
  { name: "Classic Cold Coffee", price: 130, category: "Coffee", type: "veg" },
  { name: "KitKat Frappe", price: 160, category: "Coffee", type: "veg" },
  { name: "Hazelnut Frappe", price: 160, category: "Coffee", type: "veg" },
  { name: "Mocha Brownie Frappe", price: 170, category: "Coffee", type: "veg" },
  { name: "Davidoff Cold Coffee", price: 160, category: "Coffee", type: "veg" },

  // Shakes
  { name: "Vanilla Shake", price: 120, category: "Shakes", type: "veg" },
  { name: "Strawberry Shake", price: 140, category: "Shakes", type: "veg" },
  { name: "Chocolate Shake", price: 150, category: "Shakes", type: "veg" },
  { name: "Black Currant Shake", price: 140, category: "Shakes", type: "veg" },
  { name: "Butterscotch Shake", price: 140, category: "Shakes", type: "veg" },
  { name: "Mango Frenzy", price: 140, category: "Shakes", type: "veg" },
  { name: "Blueberry Shake", price: 160, category: "Shakes", type: "veg" },
  { name: "Blueberry Brownie Shake", price: 180, category: "Shakes", type: "veg" },
  { name: "Oreo Shake", price: 150, category: "Shakes", type: "veg" },
  { name: "Oreo Chocolate Shake", price: 160, category: "Shakes", type: "veg" },
  { name: "Oreo Strawberry Shake", price: 160, category: "Shakes", type: "veg" },
  { name: "Oreo Blueberry Shake", price: 170, category: "Shakes", type: "veg" },
  { name: "KitKat Shake", price: 160, category: "Shakes", type: "veg" },
  { name: "Choco Brownie Shake", price: 170, category: "Shakes", type: "veg" },
  { name: "Oreo Brownie Shake", price: 170, category: "Shakes", type: "veg" },
  { name: "Strawberry Brownie Shake", price: 170, category: "Shakes", type: "veg" },
  { name: "Belgian Chocolate Shake", price: 160, category: "Shakes", type: "veg" },
  { name: "Nutella Shake", price: 180, category: "Shakes", type: "veg" },
  { name: "Nutella Oreo Shake", price: 190, category: "Shakes", type: "veg" },
  { name: "Nutella Brownie Shake", price: 190, category: "Shakes", type: "veg" },
  { name: "Choco Hazelnut Shake", price: 160, category: "Shakes", type: "veg" },

  // Healthy Wraps
  { name: "Grilled Paneer Wrap", price: 120, category: "Healthy Wraps", type: "veg", description: "Whole Wheat · K-350, P-20, C-11, F-15" },
  { name: "Loaded Paneer Wrap", price: 160, category: "Healthy Wraps", type: "veg", description: "Whole Wheat · K-420, P-34, C-16, F-24" },
  { name: "Roasted Chicken Wrap", price: 140, category: "Healthy Wraps", type: "non-veg", description: "Whole Wheat · K-250, P-30, C-10, F-10" },
  { name: "Loaded Chicken Wrap", price: 200, category: "Healthy Wraps", type: "non-veg", description: "Whole Wheat · K-345, P-47, C-10, F-12" },
  { name: "Chicken Kebab Wrap", price: 150, category: "Healthy Wraps", type: "non-veg", description: "Whole Wheat · K-415, P-30, C-30, F-20" },

  // Sandwiches
  { name: "Veg Sandwich", price: 120, category: "Sandwiches", type: "veg", description: "Brown Bread" },
  { name: "Paneer Tikka Sandwich", price: 150, category: "Sandwiches", type: "veg", description: "Brown Bread · K-515, P-30, C-61, F-12" },
  { name: "Creamy Paneer Sandwich", price: 180, category: "Sandwiches", type: "veg", description: "Brown Bread · K-610, P-34, C-71, F-15" },
  { name: "Chicken Tikka Sandwich", price: 150, category: "Sandwiches", type: "non-veg", description: "Brown Bread · K-545, P-45, C-58, F-12" },
  { name: "Creamy Chicken Sandwich", price: 180, category: "Sandwiches", type: "non-veg", description: "Brown Bread · K-640, P-48, C-58, F-15" },
  { name: "Loaded Chicken Sandwich", price: 210, category: "Sandwiches", type: "non-veg", description: "Brown Bread · K-665, P-67, C-58, F-15" },

  // Brown Rice Meals
  { name: "Grilled Paneer With Rice", price: 160, category: "Brown Rice Meals", type: "veg", description: "K-380, P-36, C-29, F-14" },
  { name: "Paneer & Veggies Rice Meal", price: 190, category: "Brown Rice Meals", type: "veg", description: "K-500, P-39, C-55, F-14" },
  { name: "Chicken & Rice Meal", price: 180, category: "Brown Rice Meals", type: "non-veg", description: "K-350, P-48, C-23, F-6" },
  { name: "Chicken & Veggies Rice Meal", price: 200, category: "Brown Rice Meals", type: "non-veg", description: "K-500, P-50, C-53, F-7" },

  // Salads
  { name: "Roasted Chicken Breast", price: 150, category: "Salads", type: "non-veg", description: "250g · K-300, P-56, C-0, F-7" },
  { name: "Grilled Paneer & Veggies", price: 160, category: "Salads", type: "veg", description: "K-400, P-36, C-33, F-13" },
  { name: "Paneer, Veggies & Broccoli Salad", price: 190, category: "Salads", type: "veg", description: "K-430, P-39, C-39, F-13" },
  { name: "Creamy Paneer Salad", price: 200, category: "Salads", type: "veg", description: "K-500, P-40, C-37, F-13" },
  { name: "Chicken & Veggies Salad", price: 180, category: "Salads", type: "non-veg", description: "K-370, P-48, C-27, F-6" },
  { name: "Loaded Chicken Salad", price: 230, category: "Salads", type: "non-veg", description: "K-430, P-59, C-27, F-7" },
  { name: "Creamy Chicken Salad", price: 210, category: "Salads", type: "non-veg", description: "K-420, P-50, C-30, F-10" },
  { name: "Chicken & Veggies Salad With Kebab", price: 240, category: "Salads", type: "non-veg", description: "K-520, P-54, C-40, F-15" },

  // Healthy Shakes
  { name: "Basic Protein Shake", price: 130, category: "Healthy Shakes", type: "veg", description: "K-270, P-30, C-15, F-7" },
  { name: "Make Your Own Protein Shake", price: 150, category: "Healthy Shakes", type: "veg", description: "K-280, P-30, C-20, F-7" },
];
