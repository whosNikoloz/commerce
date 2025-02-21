"use client";

import Image from "next/image";

import { CartItem, useCart } from "@/app/context/cartContext";
import { useTranslation } from '@/hooks/useTranslation'


const products: CartItem[] = [
  {
    id: 1, name: "Product 1", price: 29.99, image: "/img1.jpg", quantity: 1, discount: 10, originalPrice: 29.99,
    darkImage: ""
  },
  {
    id: 2, name: "Product 2", price: 49.99, image: "/img2.jpg", quantity: 1, discount: 0, originalPrice: 49.99,
    darkImage: ""
  },
  {
    id: 3, name: "Product 3", price: 49.99, image: "/img1.jpg", quantity: 1, discount: 0, originalPrice: 49.99,
    darkImage: ""
  },
];

export default function ProductList() {
  const { addToCart } = useCart();
  const dictionary = useTranslation();  // Context will now provide dictionary data


  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="border p-4">
          <Image
            alt={product.name}
            className="w-full h-40 object-cover"
            height={160}
            src={product.image}
            width={160}
          />
          <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-700">Price: ${product.price}</p>
          <button
            className="mt-2 w-full bg-blue-600 text-white p-2 rounded-md"
            onClick={() => addToCart(product)}
          >
            {dictionary.addToCart}
          </button>
        </div>
      ))}
    </div>
  );
}
