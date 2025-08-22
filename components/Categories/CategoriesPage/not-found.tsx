import { CategoryCarousel } from "@/components/Home/category-carousel";
import Link from "next/link";

export default function CategoryNotFound() {
    return (
        <div className="flex min-h-[45vh] items-center justify-center mt-20">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold">Category not found</h2>
                <p className="text-muted-foreground">
                    The category you’re looking for doesn’t exist or was removed.
                </p>

                <div className="mx-auto max-w-5xl">
                    <CategoryCarousel />
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                    <Link href="/" className="px-4 py-2 rounded-md border">
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}