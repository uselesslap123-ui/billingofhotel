
export type MenuItem = {
  id: number;
  name: string;
  price: number;
  icon: string;
};

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Paneer Butter Masala', price: 250, icon: '🧀' },
  { id: 2, name: 'Dal Makhani', price: 220, icon: '🍲' },
  { id: 3, name: 'Garlic Naan', price: 60, icon: '🍞' },
  { id: 4, name: 'Veg Biryani', price: 280, icon: '🍚' },
  { id: 5, name: 'Gulab Jamun (2pcs)', price: 80, icon: '🍮' },
  { id: 6, name: 'Masala Dosa', price: 150, icon: '🥞' },
  { id: 7, name: 'Chole Bhature', price: 180, icon: '🥙' },
  { id: 8, name: 'Lassi', price: 90, icon: '🥛' },
  { id: 9, name: 'Idli Sambhar', price: 120, icon: '🥣' },
  { id: 10, name: 'Samosa (2pcs)', price: 50, icon: '🔺' },
  { id: 11, name: 'Jalebi', price: 70, icon: '🍥' },
  { id: 12, name: 'Mineral Water', price: 30, icon: '💧' },
];
