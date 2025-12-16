import { PlaceHolderImages } from "./placeholder-images";

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};

const getImageData = (id: string) => {
    const image = PlaceHolderImages.find(p => p.id === id);
    if (!image) {
        return { imageUrl: "https://picsum.photos/seed/error/600/400", imageHint: "placeholder" };
    }
    return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Paneer Butter Masala', price: 250, ...getImageData('paneer-butter-masala') },
  { id: 2, name: 'Dal Makhani', price: 220, ...getImageData('dal-makhani') },
  { id: 3, name: 'Garlic Naan', price: 60, ...getImageData('garlic-naan') },
  { id: 4, name: 'Veg Biryani', price: 280, ...getImageData('veg-biryani') },
  { id: 5, name: 'Gulab Jamun (2pcs)', price: 80, ...getImageData('gulab-jamun') },
  { id: 6, name: 'Masala Dosa', price: 150, ...getImageData('masala-dosa') },
  { id: 7, name: 'Chole Bhature', price: 180, ...getImageData('chole-bhature') },
  { id: 8, name: 'Lassi', price: 90, ...getImageData('lassi') },
  { id: 9, name: 'Idli Sambhar', price: 120, ...getImageData('idli-sambhar') },
  { id: 10, name: 'Samosa (2pcs)', price: 50, ...getImageData('samosa') },
  { id: 11, name: 'Jalebi', price: 70, ...getImageData('jalebi') },
  { id: 12, name: 'Mineral Water', price: 30, ...getImageData('mineral-water') },
];
