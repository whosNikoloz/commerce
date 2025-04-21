"use client";

import { useState, useEffect } from "react";

import { Breadcrumb } from "./breadcrumb";
import { ImageGallery } from "./image-gallery";
import { ProductInfo } from "./product-info";
import { ProductInfoBottom } from "./product-info-bottom";
import { Specifications } from "./specifications";
import { Description } from "./description";
import { SimilarProducts } from "./similar-products";
import { ReviewsSection } from "./reviews-section";

export default function ProductDetail() {
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const scrollThreshold = isMobile ? 900 : 700;

      setIsPriceVisible(window.scrollY < scrollThreshold);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);
  // Product data
  const productImages = ["/img2.jpg", "/img1.jpg", "/img2.jpg"];

  const productFeatures = [
    "20V MAX lithium-ion battery for extended runtime",
    "2-speed transmission (0-450 & 0-1,500 RPM) for a variety of applications",
    "1/2-inch single-sleeve ratcheting chuck for tight bit gripping",
    "Ergonomic handle design for comfort and control",
  ];

  const productSpecs = [
    { label: "Brand", value: "PowerPro Tools" },
    { label: "Model", value: "DCD780B" },
    { label: "Power Source", value: "Battery Powered" },
    { label: "Voltage", value: "20V" },
    { label: "Battery Included", value: "Yes (2 batteries)" },
    { label: "Chuck Size", value: "1/2 inch" },
    { label: "Maximum Speed", value: "1,500 RPM" },
    { label: "Weight", value: "3.5 lbs" },
    { label: "Dimensions", value: "8.5 x 3 x 7.5 inches" },
    { label: "Warranty", value: "3 years limited" },
  ];

  const productDescription = [
    "The Professional Cordless Drill Set is designed for both professional contractors and DIY enthusiasts who demand power, precision, and reliability. This high-performance drill features a powerful 20V MAX lithium-ion battery system that provides extended runtime and overall life.",
    "The drill's 2-speed transmission (0-450 & 0-1,500 RPM) allows users to match the appropriate speed to the application for optimized performance. Its 1/2-inch single-sleeve ratcheting chuck provides tight bit gripping strength, and the ergonomic handle delivers comfort and control.",
    "This complete set includes the drill/driver, two 20V MAX lithium-ion batteries, a fast charger, a belt hook, a carrying case, and a comprehensive 30-piece accessory kit with drill bits, driver bits, and more. The LED work light illuminates dark work areas, and the battery fuel gauge allows users to check the charge level at any time.",
    "Whether you're drilling into wood, metal, or plastic, or driving screws for your latest project, this drill set provides the versatility and power you need. Its compact and lightweight design reduces user fatigue while allowing access to tight spaces.",
  ];

  const similarProducts = [
    {
      id: 1,
      name: "Power Drill XL200",
      price: 89.99,
      rating: 4.3,
      image: "/img2.jpg",
    },
    {
      id: 2,
      name: "Hammer Set Pro",
      price: 45.99,
      rating: 4.7,
      image: "/img2.jpg",
    },
    {
      id: 3,
      name: "Screwdriver Kit",
      price: 29.99,
      rating: 4.5,
      image: "/img2.jpg",
    },
    {
      id: 4,
      name: "Measuring Tape",
      price: 12.99,
      rating: 4.2,
      image: "/img2.jpg",
    },
  ];

  const reviews = [
    {
      name: "Michael T.",
      rating: 5,
      date: "2 weeks ago",
      title: "Excellent power and battery life",
      comment:
        "I've been using this drill for various home projects and it has exceeded my expectations. The battery lasts much longer than my previous drill and it has plenty of power for all my needs. The case and accessories are a great bonus.",
    },
    {
      name: "Sarah J.",
      rating: 4,
      date: "1 month ago",
      title: "Great value for the price",
      comment:
        "This drill set offers excellent value. The drill itself is powerful and the included bits cover most needs. My only complaint is that the carrying case could be more durable, but that's a minor issue.",
    },
    {
      name: "Robert K.",
      rating: 5,
      date: "2 months ago",
      title: "Professional quality at a reasonable price",
      comment:
        "As a contractor, I need reliable tools that can handle daily use. This drill has been perfect - powerful, comfortable to use, and the batteries charge quickly. Highly recommended for both pros and DIYers.",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "#" },
    { label: "Tools", href: "#" },
    { label: "Power Tools", href: "#" },
    { label: "Professional Cordless Drill Set" },
  ];

  const ratingDistribution = {
    5: 70,
    4: 20,
    3: 7,
    2: 2,
    1: 1,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Left side - Image Gallery with square zoom */}
        <ImageGallery
          images={productImages}
          productName="Professional Cordless Drill Set"
        />

        {/* Right side - Product Info */}
        <ProductInfo
          discount={25}
          features={productFeatures}
          originalPrice={199.99}
          price={149.99}
          rating={4}
          reviewCount={256}
          stock={24}
          title="Professional Cordless Drill Set"
        />
      </div>

      {/* Specifications */}
      <Specifications specs={productSpecs} />

      {/* Description */}
      <Description paragraphs={productDescription} />

      {/* Similar Products */}
      <SimilarProducts products={similarProducts} />

      {/* Reviews */}
      <ReviewsSection
        averageRating={4.7}
        ratingDistribution={ratingDistribution}
        reviews={reviews}
        totalReviews={256}
      />

      {/* Bottom Price Info - Shows when main price is hidden */}
      <ProductInfoBottom
        discount={25}
        isVisible={!isPriceVisible}
        name="Professional Cordless Drill Set"
        originalPrice={199.99}
        price={149.99}
        stock={24}
      />
    </div>
  );
}
