import Image from "next/image";

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
      <h2 className="font-heading text-2xl font-bold mb-6">Similar Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group rounded-lg border border-gray-200 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative w-full h-60">
              <Image
                alt={product.name}
                className="rounded-t-lg"
                layout="fill"
                objectFit="cover"
                src={product.image}
              />
              <span className="font-primary absolute top-2 left-2 rounded-full bg-black px-2 text-sm font-medium text-white">
                39% OFF
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white truncate">
                {product.name}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-primary text-xl font-bold text-slate-900 dark:text-white">${product.price}</p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      aria-hidden="true"
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating) ? "text-yellow-300" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="font-primary ml-2 text-xs bg-yellow-200 px-2 py-0.5 rounded font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
