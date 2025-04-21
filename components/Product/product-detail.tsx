"use client";

import { useState, useEffect } from "react";

import { ImageGallery } from "./image-gallery";
import { ProductInfoBottom } from "./product-info-bottom";
import { ProductInfo } from "./product-info";
import { SimilarProducts } from "./similar-products";
import { Specifications } from "./specifications";

import { Product } from "@/types/Product";

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
  // Product data
  const sampleProduct: Product = {
    id: 32529,
    brand: "Deerma",
    name: "Deerma DX1000W Handheld Vacuum Cleaner Blue",
    name_ka: "ხელის მტვერსასრუტი Deerma DX1000W Blue",
    headline: "Deerma DX1000W Handheld Vacuum Cleaner Blue",
    headline_ka:
      "ხელის მტვერსასრუტი Deerma DX1000W Handheld Vacuum Cleaner Blue",
    headlineAlt:
      "khelis mTversasruTi deerma dx1000w handheld vacuum cleaner blue",
    shortDescription:
      '<h3><strong><a href="https://veli.store/category/teqnika/sony/6875/"><span style="color:#3498db">Sony</span></a> </strong></h3>\r\n\r\n<h3>&nbsp;</h3>\r\n\r\n<h3><strong>Sony WF-C700 უსადენო ყურსასმენი</strong></h3>\r\n\r\n<h3>&nbsp;</h3>\r\n\r\n<ul>\r\n\t<li>უსადენო ყურსასმენები&nbsp;ხმაურის შემცირების ტექნოლოგიით</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>Bluetooth 5.0 შეუფერხებელი, უწყვეტი კავშირი</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>15 საათი&nbsp;მუშაობის დრო და სწრაფი დატენვის ფუნქცია&nbsp;</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>IPX4&nbsp;რეიტინგი, კორპუსი უძლებს წყალსა და ნესტს</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>თანამედროვე, ერგონომიული და კომპაქტური დიზაინი</li>\r\n</ul>',
    shortDescription_ka:
      '<h3><strong><a href="https://veli.store/category/teqnika/sony/6875/"><span style="color:#3498db">Sony</span></a> </strong></h3>\r\n\r\n<h3>&nbsp;</h3>\r\n\r\n<h3><strong>Sony WF-C700 უსადენო ყურსასმენი</strong></h3>\r\n\r\n<h3>&nbsp;</h3>\r\n\r\n<ul>\r\n\t<li>უსადენო ყურსასმენები&nbsp;ხმაურის შემცირების ტექნოლოგიით</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>Bluetooth 5.0 შეუფერხებელი, უწყვეტი კავშირი</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>15 საათი&nbsp;მუშაობის დრო და სწრაფი დატენვის ფუნქცია&nbsp;</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>IPX4&nbsp;რეიტინგი, კორპუსი უძლებს წყალსა და ნესტს</li>\r\n</ul>\r\n\r\n<p>&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>თანამედროვე, ერგონომიული და კომპაქტური დიზაინი</li>\r\n</ul>',
    metaDescription:
      "Buy online at veli.store: Deerma DX1000W Handheld Vacuum Cleaner with high suction power and multi-functional design.",
    metaDescription_ka:
      "შეიძინე ონლაინ, veli.store-ზე: Deerma DX1000W ხელის მტვერსასრუტი მაღალი შესრუტვის სიმძლავრით და მრავალფუნქციური დიზაინით.",
    startPrice: 269,
    price: 201,
    inStock: 34,

    images: [
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue1.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue1-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue1-thumbnail-50x50.png",
      },
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue2.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue2-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue2-thumbnail-50x50.png",
      },
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue3.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-50x50.png",
      },
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue3.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-50x50.png",
      },
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue3.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-50x50.png",
      },
      {
        fullSize:
          "https://media.veli.store/media/product/deerma_DX1000_vacuum_cleaner_blue3.png",
        medium:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-200x200.png",
        thumbnail:
          "https://media.veli.store/media/__sized__/product/deerma_DX1000_vacuum_cleaner_blue3-thumbnail-50x50.png",
      },
    ],
    descriptions: [
      {
        title: "Deerma DX1000W Handheld Vacuum Cleaner",
        title_ka: "Deerma DX1000W ხელის მტვერსასრუტი",
        descriptionHtml: `Deerma DX1000W offers a portable and handheld vertical vacuum cleaner with high suction power. It's ideal for quick cleaning and hard-to-reach places. Equipped with an effective filtration system and sterilization function, providing a clean and healthy environment.`,
        descriptionHtml_ka: `Deerma DX1000W გთავაზობთ პორტატულ და ხელის, ვერტიკალურ მტვერსასრუტს მაღალი შესრუტვის სიმძლავრით. იდეალურია სწრაფი დასუფთავებისთვის და რთულად მისაწვდომი ადგილების დასალაგებლად. აღჭურვილია ეფექტური ფილტრაციის სისტემით და სტერილიზაციის ფუნქციით, რაც უზრუნველყოფს სუფთა და ჯანსაღ გარემოს.`,
      },
      {
        title: "ბრენდის ისტორია",
        title_ka: "ბრენდის ისტორია",
        descriptionHtml: `<p>დროთა განმავლობაში და რამდენიმე ათწლეულის კვლევის შემდეგ ნიკოლას კატენამ აღმოაჩინა ბრწყინვალების საიდუმლო: სწორი ჯიშის დარგვა სწორ ადგილას, ტერუარისა და ნიადაგის კომპონენტების მიხედვით. ამ მეთოდოლოგიისა და ფილოსოფიის წყალობით, რომელიც დღესაც გამოიყენება, მალბეკის ქვეყანაში არის ადგილი სხვა ყურძნისთვის, როგორიცაა შარდონე. სწორედ ამ ტექნოლოგიით მზადდება ღვინის ქარხანა Catena-ში შარდონე, ძალიან საინტერესო ჯიშის ღვინო, მენდოზას რეგიონში, არგენტინაში, ალპების ძირში, სადაც ოჯახი ამუშავებს თავის ვენახებს. მაღალ ფერდობებზე, რაც იწვევს დიდ კონტრასტებს დღესა და ღამეს შორის. ამის წყალობით ყურძენი ნელა და სწორად მწიფდება.</p>`,
        descriptionHtml_ka:
          "<p>დროთა განმავლობაში და რამდენიმე ათწლეულის კვლევის შემდეგ ნიკოლას კატენამ აღმოაჩინა ბრწყინვალების საიდუმლო: სწორი ჯიშის დარგვა სწორ ადგილას, ტერუარისა და ნიადაგის კომპონენტების მიხედვით. ამ მეთოდოლოგიისა და ფილოსოფიის წყალობით, რომელიც დღესაც გამოიყენება, მალბეკის ქვეყანაში არის ადგილი სხვა ყურძნისთვის, როგორიცაა შარდონე. სწორედ ამ ტექნოლოგიით მზადდება ღვინის ქარხანა Catena-ში შარდონე, ძალიან საინტერესო ჯიშის ღვინო, მენდოზას რეგიონში, არგენტინაში, ალპების ძირში, სადაც ოჯახი ამუშავებს თავის ვენახებს. მაღალ ფერდობებზე, რაც იწვევს დიდ კონტრასტებს დღესა და ღამეს შორის. ამის წყალობით ყურძენი ნელა და სწორად მწიფდება.</p>",
      },
    ],

    specificationGroups: [
      {
        headline: "General Information",
        headline_ka: "ზოგადი ინფორმაცია",
        specifications: [
          {
            key: "Brand",
            key_ka: "ბრენდი",
            value: "Deerma",
            value_ka: "Deerma",
          },
          {
            key: "Model",
            key_ka: "მოდელი",
            value: "DX1000W",
            value_ka: "DX1000W",
          },
          {
            key: "Type",
            key_ka: "ტიპი",
            value: "Handheld Vacuum Cleaner",
            value_ka: "ხელის მტვერსასრუტები",
          },
        ],
      },
      {
        headline: "Technical Specifications",
        headline_ka: "ტექნიკური მახასიათებლები",
        specifications: [
          {
            key: "Power",
            key_ka: "სიმძლავრე",
            value: "600 W",
            value_ka: "600 W",
          },
          {
            key: "Dust Container Size",
            key_ka: "მტვრის კონტეინერის ზომა",
            value: "0.5 L",
            value_ka: "0.5 ლ",
          },
          {
            key: "Cleaning Type",
            key_ka: "წმენდის ტიპი",
            value: "Dry",
            value_ka: "მშრალი",
          },
          {
            key: "Suction Power",
            key_ka: "შესრუტვის სიმძლავრე",
            value: "16000 Pa",
            value_ka: "16000 Pa",
          },
          {
            key: "Weight",
            key_ka: "წონა",
            value: "3.5 kg",
            value_ka: "3.5 კგ",
          },
        ],
      },
      {
        headline: "Warranty",
        headline_ka: "გარანტია",
        specifications: [
          {
            key: "Warranty Period",
            key_ka: "გარანტიის ვადა",
            value: "12 months",
            value_ka: "12 თვე",
          },
        ],
      },
    ],

    badges: [
      {
        headline: "ველი გირჩევს",
        icon: "https://media.veli.store/media/product_badge/veli-advice.svg",
        type: { id: 2, headline: "რჩეული" },
      },
      {
        headline: "მოთხოვნადი",
        icon: "https://media.veli.store/media/product_badge/popular.svg",
        type: { id: 7, headline: "მოთხოვნადი" },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 md:block  hidden p-4">
        {sampleProduct.name_ka}
      </h1>
      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        <div className="flex-1">
          <ImageGallery
            images={sampleProduct.images}
            productName="Professional Cordless Drill Set"
          />
        </div>
        <h1 className="text-3xl md:hidden block font-bold">
          {sampleProduct.name_ka}
        </h1>

        <div className="flex md:items-top place-items-start">
          <ul
            dangerouslySetInnerHTML={{
              __html: sampleProduct.shortDescription_ka,
            }}
            className="rich-content  text-sm list-disc max-w-xs ml-5"
          />
        </div>
        <ProductInfo
          discount={45}
          inStock={3}
          originalPrice={sampleProduct.startPrice}
          points={10}
          price={sampleProduct.price}
          onAddToCart={() => console.log("Added to cart")}
          onBuyNow={() => console.log("Buy now clicked")}
          onWishlist={() => console.log("Added to wishlist")}
        />
      </div>
      <SimilarProducts products={similarProducts} />

      <div className="flex space-y-5 flex-col max-w-4xl">
        {sampleProduct.descriptions.map((desc, index) => (
          <div key={index}>
            <h1 className="font-bold mb-6 text-xl">{desc.title}</h1>
            <ul
              dangerouslySetInnerHTML={{
                __html: desc.descriptionHtml_ka || desc.descriptionHtml,
              }}
              className="rich-content text-sm font-mono list-disc "
            />
          </div>
        ))}
      </div>

      {sampleProduct.specificationGroups.map((spec, index) => (
        <div key={index} className="my-12">
          <h1 className="font-bold mb-6 text-2xl">{spec.headline}</h1>
          <Specifications specs={spec.specifications} />
        </div>
      ))}

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
