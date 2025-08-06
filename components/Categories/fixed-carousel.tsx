"use client";

import { Card } from "@heroui/card";
import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import Link from "next/link";

const FixedCardCarousel = () => {
  const items = [
    { id: 1, title: "ყველა კატეგორია", fomated_name: "all", image: "/img1.jpg" },
    { id: 2, title: "საჩუქრები", fomated_name: "presents", image: "/img2.jpg" },
    { id: 3, title: "ტექნიკა", fomated_name: "tec", image: "/img1.jpg" },
    { id: 4, title: "სილამაზე & მოვლა", fomated_name: "beuty", image: "/img1.jpg" },
    { id: 5, title: "სახლი & ეზო", fomated_name: "house", image: "/img2.jpg" },
    { id: 6, title: "ბარი & მეტი", fomated_name: "bar", image: "/img1.jpg" },
    { id: 7, title: "სახლის მოვლა", fomated_name: "houses", image: "/img2.jpg" },
    { id: 8, title: "სახლის სარემონტო", fomated_name: "repair", image: "/img1.jpg" },
    { id: 9, title: "სარემონტო დამატებითი", fomated_name: "repair-extra", image: "/img1.jpg" },
    { id: 10, title: "ინსტრუმენტები", fomated_name: "tools", image: "/img1.jpg" },
    { id: 11, title: "კომპლექტაცია", fomated_name: "kits", image: "/img1.jpg" },
  ];

  return (
    <div className="w-full max-w-screen-2xl mx-auto flex flex-row items-start gap-4 mt-6 px-4">
      {/* Static Main Card */}
      <div className="flex-shrink-0 w-44 md:w-56">
        <Card className="h-64 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md flex items-center justify-center p-4 hover:shadow-lg transition">
          <h3 className="text-center text-base font-semibold leading-snug">
            {items[0].title}
          </h3>
        </Card>
      </div>

      {/* Carousel */}
      <div className="flex-grow overflow-hidden">
        <Splide
          className="w-full"
          options={{
            type: "slide",
            pagination: false,
            arrows: false,
            gap: "1rem",
            autoWidth: false,
            perPage: 6,
            breakpoints: {
              1400: { perPage: 4 },
              1100: { perPage: 4 },
              900: { perPage: 4 },
              600: { perPage: 4 },
              400: { perPage: 4 },
            },
          }}
        >
          {items.slice(1).map((item) => (
            <SplideSlide key={item.id}>
              <Card
                as={Link}
                href={`/category/${item.fomated_name}`}
                className="h-64 w-full max-w-[170px] md:max-w-[180px] flex flex-col items-center justify-center rounded-2xl p-4 bg-white hover:bg-gray-100 shadow-sm hover:shadow-md transition"
              >
                <img
                  alt={item.title}
                  src={item.image}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-md object-cover mb-3 border"
                />
                <h3 className="text-center text-sm font-medium text-gray-800 leading-tight">
                  {item.title}
                </h3>
              </Card>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default FixedCardCarousel;
