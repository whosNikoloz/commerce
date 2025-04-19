import { Button } from "@heroui/button";
import { Star } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
}

interface ReviewsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  reviews: Review[];
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  ratingDistribution,
  reviews,
}: ReviewsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-5xl font-bold mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.floor(averageRating)
                      ? "fill-primary text-primary"
                      : star <= averageRating
                        ? "fill-primary text-primary opacity-50"
                        : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on {totalReviews} reviews
            </p>

            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <Star className="h-4 w-4 fill-primary text-primary" />
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${ratingDistribution[rating]}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">
                  {ratingDistribution[rating]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-2/3">
          <Button className="w-full mb-6">Write a Review</Button>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="border-b pb-6 last:border-0">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{review.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <h5 className="font-medium mb-1">{review.title}</h5>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}

            <Button className="w-full">Load More Reviews</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
