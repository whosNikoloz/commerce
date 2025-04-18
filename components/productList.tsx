"use client";

import Image from "next/image";

import { CartItem, useCart } from "@/app/context/cartContext";
import { useTranslation } from "@/hooks/useTranslation";

const products: CartItem[] = [
  {
    id: 1,
    name: "Product 1",
    price: 29.99,
    image: "/img1.jpg",
    quantity: 1,
    discount: 10,
    originalPrice: 29.99,
    darkImage: "",
  },
  {
    id: 2,
    name: "Product 2",
    price: 49.99,
    image: "/img2.jpg",
    quantity: 1,
    discount: 0,
    originalPrice: 49.99,
    darkImage: "",
  },
  {
    id: 3,
    name: "Product 3",
    price: 49.99,
    image: "/img1.jpg",
    quantity: 1,
    discount: 0,
    originalPrice: 49.99,
    darkImage: "",
  },
];

export default function ProductList() {
  const { addToCart } = useCart();
  const dictionary = useTranslation(); // Context will now provide dictionary data

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
        >
          <div className="relative w-full h-64">
            <Image
              alt={product.name}
              className="object-cover w-full h-full"
              height={300}
              src={product.image}
              width={300}
            />
            {product.discount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {product.discount}% OFF
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {product.name}
            </h3>
            <p className="mt-2 text-lg font-bold text-gray-900">
              ${product.price}
            </p>
            {product.discount > 0 && (
              <p className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </p>
            )}
            <button
              className="mt-4 w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
              onClick={() => addToCart(product)}
            >
              {dictionary.addToCart}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
