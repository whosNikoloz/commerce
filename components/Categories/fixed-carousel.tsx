"use client";

import { Card } from "@heroui/card";
import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css"; // Import Splide styles

const FixedCardCarousel = () => {
  const items = [
    { id: 1, title: "ყველა კატეგორია", image: "/img1.jpg" },
    { id: 2, title: "საჩუქრები", image: "/img2.jpg" },
    { id: 3, title: "ტექნიკა", image: "/img1.jpg" },
    { id: 4, title: "სილამაზე & მოვლა", image: "/img1.jpg" },
    { id: 5, title: "სახლი & ეზო", image: "/img2.jpg" },
    { id: 6, title: "ბარი & მეტი", image: "/img1.jpg" },
    { id: 7, title: "სახლის მოვლა", image: "/img2.jpg" },
    { id: 8, title: "სახლის სარემონტო", image: "/img1.jpg" },
    { id: 9, title: "სახლის სარემონტო", image: "/img2.jpg" },
  ];

  return (
    <div className="w-full flex flex-row items-center gap-2 mt-3">
      <Card className="w-full md:w-36 h-36 bg-black text-white flex items-center justify-center p-3">
        <h3 className="text-center text-xs font-medium">{items[0].title}</h3>
      </Card>

      <Splide
        className="w-2/5 md:flex-1"
        options={{
          type: "slide",
          perPage: 6,
          perMove: 1,
          pagination: false,
          gap: "1rem",
          arrows: true,
          breakpoints: {
            1200: { perPage: 5, gap: "0.8rem" },
            1000: { perPage: 4, gap: "0.6rem" },
            800: { perPage: 3, gap: "0.5rem" },
            600: { perPage: 2, gap: "0.4rem" },
          },
        }}
      >
        {items.slice(1).map((item) => (
          <SplideSlide key={item.id}>
            <Card className="w-full md:w-36 h-36 flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 transition-colors">
              <img
                alt={item.title}
                className="w-16 h-16 md:w-24 md:h-24 object-cover mb-1"
                src={item.image}
              />
              <h3 className="text-center text-black text-xs font-medium">
                {item.title}
              </h3>
            </Card>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default FixedCardCarousel;
