import { Product } from "../types/Product";

export const products: Product[] = [
  {
    id: 1,
    title: "Apple iPhone 15",
    description: "128GB Blue",
    price: 79999,
    category: "Mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    rating: 4.8,
    stock: 20,
  },
  {
    id: 2,
    title: "HP Pavilion Laptop",
    description: "16GB RAM | 512GB SSD",
    price: 65999,
    category: "Electronics",
    image: "https://picsum.photos/300/300",
    rating: 4.5,
    stock: 15,
  },
];