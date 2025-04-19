import Image from "next/image";
import { Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
}

interface SimilarProductsProps {
  products: Product[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square bg-white">
              <Image
                fill
                alt={product.name}
                className="object-contain p-4"
                src={product.image || "/placeholder.svg"}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : star <= product.rating
                            ? "fill-primary text-primary opacity-50"
                            : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating})
                </span>
              </div>
              <p className="font-bold">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
