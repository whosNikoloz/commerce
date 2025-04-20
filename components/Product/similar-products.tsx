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
            className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow bg-white dark:bg-neutral-900"
          >
            <div className="relative aspect-square bg-white dark:bg-neutral-900">
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="object-contain p-4"
              />
              {/* {product.isNew && (
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  New
                </span>
              )} */}
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= product.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                    />
                  ))}
                </div>
                {/* <span className="text-xs text-muted-foreground">
                  ({product.reviewsCount})
                </span> */}
              </div>
              <p className="font-bold">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
