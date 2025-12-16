
export type MenuItem = {
  id: number;
  name: string;
  price: number;
  icon: string;
  category: string;
};

export const menuItems: MenuItem[] = [
  // Nashta (Breakfast)
  { id: 1, name: 'Pohe', price: 40, icon: '🥣', category: '☕ Nashta (Breakfast)' },
  { id: 2, name: 'Kanda Pohe', price: 45, icon: '🧅', category: '☕ Nashta (Breakfast)' },
  { id: 3, name: 'Batata Pohe', price: 45, icon: '🥔', category: '☕ Nashta (Breakfast)' },
  { id: 4, name: 'Upma', price: 40, icon: '🥣', category: '☕ Nashta (Breakfast)' },
  { id: 5, name: 'Sheera', price: 50, icon: '🍮', category: '☕ Nashta (Breakfast)' },
  { id: 6, name: 'Misal Pav', price: 80, icon: '🌶️', category: '☕ Nashta (Breakfast)' },
  { id: 7, name: 'Usal Pav', price: 70, icon: '🍲', category: '☕ Nashta (Breakfast)' },
  { id: 8, name: 'Vada Pav', price: 20, icon: '🍔', category: '☕ Nashta (Breakfast)' },
  { id: 9, name: 'Samosa', price: 25, icon: '🔺', category: '☕ Nashta (Breakfast)' },
  { id: 10, name: 'Thalipeeth', price: 60, icon: '🥞', category: '☕ Nashta (Breakfast)' },
  { id: 11, name: 'Sabudana Khichadi', price: 55, icon: '🥣', category: '☕ Nashta (Breakfast)' },
  { id: 12, name: 'Idli', price: 40, icon: '🍚', category: '☕ Nashta (Breakfast)' },
  { id: 13, name: 'Medu Vada', price: 50, icon: '🍩', category: '☕ Nashta (Breakfast)' },
  { id: 14, name: 'Dosa', price: 70, icon: '🥞', category: '☕ Nashta (Breakfast)' },

  // Bhaji (Vegetable Items)
  { id: 15, name: 'Kanda Bhaji', price: 50, icon: '🧅', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 16, name: 'Batata Bhaji', price: 50, icon: '🥔', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 17, name: 'Aloo Gobi', price: 120, icon: ' cauliflower', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 18, name: 'Bhendi Fry', price: 110, icon: '🟢', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 19, name: 'Matki Usal', price: 100, icon: '🍲', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 20, name: 'Chawli Usal', price: 100, icon: '🍲', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 21, name: 'Vangyachi Bhaji', price: 120, icon: '🍆', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 22, name: 'Bharli Vangi', price: 140, icon: '🍆', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 23, name: 'Gajar Batata Bhaji', price: 110, icon: '🥕', category: '🍛 Bhaji (Vegetable Items)' },
  { id: 24, name: 'Kobi Bhaji', price: 100, icon: '🥬', category: '🍛 Bhaji (Vegetable Items)' },

  // Amti / Dal
  { id: 25, name: 'Varan', price: 80, icon: '🥣', category: '🍲 Amti / Dal' },
  { id: 26, name: 'Dal Tadka', price: 100, icon: '🥣', category: '🍲 Amti / Dal' },
  { id: 27, name: 'Amti', price: 90, icon: '🥣', category: '🍲 Amti / Dal' },
  { id: 28, name: 'Toor Dal', price: 90, icon: '🥣', category: '🍲 Amti / Dal' },
  { id: 29, name: 'Masoor Dal', price: 90, icon: '🥣', category: '🍲 Amti / Dal' },

  // Bhat / Rice Items
  { id: 30, name: 'Sadhya Bhat', price: 60, icon: '🍚', category: '🍚 Bhat / Rice Items' },
  { id: 31, name: 'Jeera Rice', price: 80, icon: '🍚', category: '🍚 Bhat / Rice Items' },
  { id: 32, name: 'Masala Bhat', price: 100, icon: '🍚', category: '🍚 Bhat / Rice Items' },
  { id: 33, name: 'Vangi Bhat', price: 110, icon: '🍚', category: '🍚 Bhat / Rice Items' },
  { id: 34, name: 'Dal Khichadi', price: 120, icon: '🍚', category: '🍚 Bhat / Rice Items' },
  { id: 35, name: 'Pulav', price: 130, icon: '🍚', category: '🍚 Bhat / Rice Items' },

  // Non-Veg (If Required)
  { id: 36, name: 'Chicken Curry', price: 220, icon: '🍗', category: '🍗 Non-Veg (If Required)' },
  { id: 37, name: 'Chicken Sukka', price: 250, icon: '🍗', category: '🍗 Non-Veg (If Required)' },
  { id: 38, name: 'Anda Curry', price: 150, icon: '🥚', category: '🍗 Non-Veg (If Required)' },
  { id: 39, name: 'Egg Bhurji', price: 120, icon: '🍳', category: '🍗 Non-Veg (If Required)' },
  { id: 40, name: 'Mutton Curry', price: 300, icon: '🍖', category: '🍗 Non-Veg (If Required)' },
  { id: 41, name: 'Fish Fry', price: 280, icon: '🐟', category: '🍗 Non-Veg (If Required)' },
  { id: 42, name: 'Fish Curry', price: 260, icon: '🐠', category: '🍗 Non-Veg (If Required)' },

  // Bhakri / Poli
  { id: 43, name: 'Chapati', price: 15, icon: '🫓', category: '🍞 Bhakri / Poli' },
  { id: 44, name: 'Tandoor Roti', price: 20, icon: '🫓', category: '🍞 Bhakri / Poli' },
  { id: 45, name: 'Jowar Bhakri', price: 25, icon: '🫓', category: '🍞 Bhakri / Poli' },
  { id: 46, name: 'Bajra Bhakri', price: 25, icon: '🫓', category: '🍞 Bhakri / Poli' },
  { id: 47, name: 'Tandoor Naan', price: 40, icon: '🍞', category: '🍞 Bhakri / Poli' },
  { id: 48, name: 'Butter Naan', price: 50, icon: '🧈', category: '🍞 Bhakri / Poli' },
  
  // Side Items
  { id: 49, name: 'Koshimbir', price: 30, icon: '🥗', category: '🥗 Side Items' },
  { id: 50, name: 'Solkadhi', price: 40, icon: '🥛', category: '🥗 Side Items' },
  { id: 51, name: 'Papad', price: 15, icon: '🍽️', category: '🥗 Side Items' },
  { id: 52, name: 'Loncha (Thecha / Lime)', price: 20, icon: '🌶️', category: '🥗 Side Items' },
  { id: 53, name: 'Tak (Buttermilk)', price: 25, icon: '🥛', category: '🥗 Side Items' },
  { id: 54, name: 'Dahi', price: 30, icon: '🥣', category: '🥗 Side Items' },
  
  // God Padarth (Sweets)
  { id: 55, name: 'Gulab Jamun', price: 40, icon: '🍮', category: '🍮 God Padarth (Sweets)' },
  { id: 56, name: 'Shrikhand', price: 60, icon: '🍨', category: '🍮 God Padarth (Sweets)' },
  { id: 57, name: 'Amrakhand', price: 70, icon: '🥭', category: '🍮 God Padarth (Sweets)' },
  { id: 58, name: 'Puran Poli', price: 80, icon: '🥞', category: '🍮 God Padarth (Sweets)' },
  { id: 59, name: 'Sheera', price: 50, icon: '🍮', category: '🍮 God Padarth (Sweets)' },
];
