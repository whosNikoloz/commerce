import type { TenantConfig } from "@/types/tenant";

// NOTE: refined color palettes for contrast/accessibility, Georgian-friendly font stacks,
// fresher content copy, and future-proofed countdown dates (Asia/Tbilisi, UTC+4).
// Keep the same section structure so it matches existing components.


export const TENANTS: Record<string, TenantConfig> = {
  "commerce-sxvadomain.vercel.app": {
    templateId: 1,
    themeColor: "#2563eb",
    theme: {
      mode: "dark",
      brand: {
        primary: "37 99 235",
        primaryDark: "29 78 216",
        surface: "241 245 249",
        surfaceDark: "2 6 23",
        muted: "226 232 240",
        mutedDark: "15 23 42",
      },
      text: {
        light: "226 232 240",
        subtle: "148 163 184",
        lightDark: "248 250 252",
        subtleDark: "100 116 139",
      },
      fonts: {
        primary: "Inter, system-ui, -apple-system, Segoe UI, Roboto, FiraGO, sans-serif",
        secondary: "Inter, system-ui, -apple-system, Segoe UI, Roboto, FiraGO, sans-serif",
        heading: "Sora, Inter, FiraGO, system-ui, sans-serif",
      },
    },
    homepage: {
      templateId: 1,
      sections: [
        {
          type: "HeroWithSearch",
          enabled: true,
          order: 1,
          data: {
            headline: {
              ka: "ტექნოლოგია, რომელიც ზუსტად გჭირდება",
              en: "The Tech You Actually Need",
            },
            subheadline: {
              ka: "გააკეთე ჭკვიანი არჩევანი — საუკეთესო ფასად, სანდო გარანტიით",
              en: "Make the smart choice — best prices with rock‑solid warranty",
            },
            searchPlaceholder: {
              ka: "პროდუქტის ძებნა…",
              en: "Search products…",
            },
            promoBadge: {
              ka: "🔥 -50% შერჩეულზე",
              en: "🔥 Up to 50% off",
            },
            imageUrl: "/hero/hero-tech.jpg",
          },
        },
        {
          type: "CategoryGrid",
          enabled: true,
          order: 2,
          data: {
            title: {
              ka: "კატეგორიები",
              en: "Shop by Category",
            },
            categories: [
              {
                name: {
                  ka: "ლეპტოპები",
                  en: "Laptops",
                },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 168,
              },
              {
                name: {
                  ka: "სმარტფონები",
                  en: "Smartphones",
                },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 264,
              },
              {
                name: {
                  ka: "ტაბლეტები",
                  en: "Tablets",
                },
                imageUrl: "/cat-tablets.jpg",
                href: "/category/tablets",
                productCount: 92,
              },
              {
                name: {
                  ka: "აქსესუარები",
                  en: "Accessories",
                },
                imageUrl: "/cat-accessories.jpg",
                href: "/category/accessories",
                productCount: 447,
              },
            ],
          },
        },
        {
          type: "BrandStrip",
          enabled: true,
          order: 3,
          data: {
            title: {
              ka: "ბრენდები test",
              en: "Popular Brands",
            },
          },
        },
        {
          type: "DealCountdown",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "დღის შეთავაზება",
              en: "Deal of the Day",
            },
            endsAtISO: new Date("2025-10-05T16:00:00.000Z").toISOString(),
            dealItems: [
              {
                sku: "LAP-001",
                title: {
                  ka: "MacBook Pro 16\"",
                  en: "MacBook Pro 16\"",
                },
                image: "/product-macbook.jpg",
                price: 1999,
                originalPrice: 2499,
                href: "/product/macbook-pro-16",
              },
              {
                sku: "PHO-042",
                title: {
                  ka: "iPhone 15 Pro",
                  en: "iPhone 15 Pro",
                },
                image: "/product-iphone.jpg",
                price: 899,
                originalPrice: 1099,
                href: "/product/iphone-15-pro",
              },
              {
                sku: "TAB-023",
                title: {
                  ka: "iPad Air",
                  en: "iPad Air",
                },
                image: "/product-ipad.jpg",
                price: 549,
                originalPrice: 699,
                href: "/product/ipad-air",
              },
              {
                sku: "ACC-156",
                title: {
                  ka: "AirPods Pro",
                  en: "AirPods Pro",
                },
                image: "/product-airpods.jpg",
                price: 199,
                originalPrice: 249,
                href: "/product/airpods-pro",
              },
            ],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 5,
          data: {
            title: {
              ka: "ლეპტოპები",
              en: "Laptops",
            },
            subtitle: {
              ka: "სამუშაოსთვის და თამაშისთვის",
              en: "For work & play",
            },
            limit: 4,
            viewAllHref: "/category/laptops",
            filterBy: {},
            sortBy: "featured",
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 6,
          data: {
            title: {
              ka: "უახლესი სმარტფონები",
              en: "Latest Smartphones",
            },
            subtitle: {
              ka: "ახალი მოდელები",
              en: "Newest models",
            },
            limit: 4,
            viewAllHref: "/category/phones",
            filterBy: {
              isNewArrival: true,
            },
            sortBy: "newest",
          },
        },
        {
          type: "ComparisonBlock",
          enabled: true,
          order: 7,
          data: {
            title: {
              ka: "შეადარეთ",
              en: "Compare Products",
            },
            description: {
              ka: "იპოვეთ სწორი არჩევანი",
              en: "Find the right fit",
            },
            products: [
              {
                sku: "LAP-001",
                name: {
                  ka: "MacBook Pro",
                  en: "MacBook Pro",
                },
                image: "/product-macbook.jpg",
                specs: [
                  {
                    label: {
                      ka: "პროცესორი",
                      en: "Processor",
                    },
                    value: "M3 Pro",
                  },
                  {
                    label: {
                      ka: "RAM",
                      en: "RAM",
                    },
                    value: "16GB",
                  },
                  {
                    label: {
                      ka: "შენახვა",
                      en: "Storage",
                    },
                    value: "512GB SSD",
                  },
                ],
                price: 1999,
                href: "/product/macbook-pro-16",
              },
              {
                sku: "LAP-015",
                name: {
                  ka: "Dell XPS 15",
                  en: "Dell XPS 15",
                },
                image: "/product-dell.jpg",
                specs: [
                  {
                    label: {
                      ka: "პროცესორი",
                      en: "Processor",
                    },
                    value: "Intel i7",
                  },
                  {
                    label: {
                      ka: "RAM",
                      en: "RAM",
                    },
                    value: "16GB",
                  },
                  {
                    label: {
                      ka: "შენახვა",
                      en: "Storage",
                    },
                    value: "512GB SSD",
                  },
                ],
                price: 1599,
                href: "/product/dell-xps-15",
              },
            ],
          },
        },
        {
          type: "Reviews",
          enabled: true,
          order: 8,
          data: {
            title: {
              ka: "შეფასებები",
              en: "Customer Reviews",
            },
            reviews: [
              {
                author: "გიორგი მელაძე",
                rating: 5,
                text: {
                  ka: "სწრაფი მიწოდება და შესანიშნავი მხარდაჭერა",
                  en: "Fast delivery and great support",
                },
                date: "2025-01-15",
                productName: {
                  ka: "MacBook Pro",
                  en: "MacBook Pro",
                },
              },
              {
                author: "მარიამ ხატია",
                rating: 5,
                text: {
                  ka: "რეალურად საუკეთესო ფასი ვნახე",
                  en: "Truly the best prices",
                },
                date: "2025-01-12",
              },
              {
                author: "ლუკა გელოვანი",
                rating: 4,
                text: {
                  ka: "კარგი არჩევანი და სერვისი",
                  en: "Good selection and service",
                },
                date: "2025-01-10",
                productName: {
                  ka: "iPhone 15",
                  en: "iPhone 15",
                },
              },
            ],
          },
        },
        {
          type: "TrustBadges",
          enabled: true,
          order: 9,
          data: {
            badges: [
              {
                icon: "shield",
                title: {
                  ka: "დაცული გადახდები",
                  en: "Secure Payments",
                },
                description: {
                  ka: "SSL/3D Secure",
                  en: "SSL/3D Secure",
                },
              },
              {
                icon: "truck",
                title: {
                  ka: "უფასო მიწოდება",
                  en: "Free Shipping",
                },
                description: {
                  ka: "200₾+ შეკვეთებზე",
                  en: "Orders over $200",
                },
              },
              {
                icon: "creditCard",
                title: {
                  ka: "გადახდის wszystkie მეთოდი",
                  en: "All major methods",
                },
                description: {
                  ka: "ბარათი • Apple Pay",
                  en: "Card • Apple Pay",
                },
              },
              {
                icon: "headphones",
                title: {
                  ka: "24/7 მხარდაჭერა",
                  en: "24/7 Support",
                },
                description: {
                  ka: "ონლაინ ჩატი / ზარი",
                  en: "Live chat / phone",
                },
              },
            ],
          },
        },
        {
          type: "NewsletterApp",
          enabled: true,
          order: 10,
          data: {
            title: {
              ka: "გამოიწერე სიახლეები",
              en: "Subscribe for Updates",
            },
            description: {
              ka: "ექსკლუზიური ფასდაკლებები და პრომო კოდები",
              en: "Exclusive deals & promo codes",
            },
            emailPlaceholder: {
              ka: "ელ.ფოსტა",
              en: "Your email",
            },
            ctaLabel: {
              ka: "გამოწერა",
              en: "Subscribe",
            },
            appLinks: {
              ios: "https://apps.apple.com",
              android: "https://play.google.com",
            },
          },
        },
      ],
    },
  },

  "commerce-topaz-sigma-62.vercel.app": {
    templateId: 4,
    themeColor: "#22c55e",
    theme: {
      mode: "dark",
      brand: {
        primary: "34 197 94",
        primaryDark: "34 197 94",
        surface: "248 250 252",
        surfaceDark: "31 50 33",
        muted: "226 232 240",
        mutedDark: "195 65 9",
      },
      text: {
        light: "30 41 59",
        subtle: "100 116 139",
        lightDark: "226 232 240",
        subtleDark: "148 163 184",
      },
      fonts: {
        primary: "\"Lato\", sans-serif",
        secondary: "Inter, FiraGO, system-ui, sans-serif",
        heading: "Poppins, Inter, FiraGO, system-ui, sans-serif",
      },
    },
    homepage: {
      templateId: 4,
      sections: [
        {
          type: "HeroCategoryGrid",
          enabled: true,
          order: 1,
          data: {
            headline: {
              ka: "შეიძინეთ ონლაინ",
              en: "Shop Online",
            },
            subheadline: {
              ka: "აღმოაჩინეთ საუკეთესო პროდუქტები",
              en: "Discover the Best Products",
            },
            description: {
              ka: "ათასობით პროდუქტი, სწრაფი მიწოდება და უმაღლესი ხარისხი",
              en: "Thousands of products, fast delivery and premium quality",
            },
            badge: {
              ka: "🔥 ახალი კოლექცია",
              en: "🔥 New Collection",
            },
            backgroundImage: "/hero_client.jpg",
            primaryCta: {
              label: {
                ka: "იყიდე ახლა",
                en: "Shop Now",
              },
              href: "/products",
            },
            stats: [
              {
                value: "10,000+",
                label: {
                  ka: "პროდუქტი",
                  en: "Products",
                },
              },
              {
                value: "50,000+",
                label: {
                  ka: "კმაყოფილი მომხმარებელი",
                  en: "Happy Customers",
                },
              },
              {
                value: "24/7",
                label: {
                  ka: "მხარდაჭერა",
                  en: "Support",
                },
              },
            ],
            features: [
              {
                ka: "✓ უფასო მიწოდება 100₾+ შენაძენზე",
                en: "✓ Free shipping on orders 100₾+",
              },
              {
                ka: "✓ 30 დღიანი დაბრუნების გარანტია",
                en: "✓ 30-day return guarantee",
              },
              {
                ka: "✓ უსაფრთხო გადახდა",
                en: "✓ Secure payment",
              },
            ],
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 2,
          data: {
            imageUrl: "/banners/promo-1.jpg",
            mobileImageUrl: "/banners/promo-1.jpg",
            href: "/category/deals",
            alt: {
              ka: "სპეციალური შეთავაზება",
              en: "Special Offer",
            },
            badge: {
              ka: "🔥 ახალი",
              en: "🔥 New",
            },
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
            subtitle: {
              ka: "უახლესი კოლექცია",
              en: "Latest collection",
            },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {
              isNewArrival: true,
            },
            sortBy: "newest",
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 4,
          data: {
            imageUrl: "/banners/promo-2.jpg",
            mobileImageUrl: "/banners/promo-2.jpg",
            href: "/category/new-arrivals",
            alt: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
          },
        },
        {
          type: "CategoryCarousel",
          enabled: true,
          order: 5,
          data: {
            title: {
              ka: "პოპულარული კატეგორიები",
              en: "Popular Categories",
            },
            categories: [
              {
                name: {
                  ka: "ტელეფონები",
                  en: "Phones",
                },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 150,
              },
              {
                name: {
                  ka: "ლეპტოპები",
                  en: "Laptops",
                },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 80,
              },
              {
                name: {
                  ka: "აქსესუარები",
                  en: "Accessories",
                },
                imageUrl: "/cat-accessories.jpg",
                href: "/category/accessories",
                productCount: 200,
              },
            ],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
            subtitle: {
              ka: "უახლესი კოლექცია",
              en: "Latest collection",
            },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {
              isNewArrival: true,
            },
            sortBy: "newest",
          },
        },
        {
          type: "BrandStrip",
          enabled: true,
          order: 6,
          data: {
            title: {
              ka: "ცნობილი ბრენდები",
              en: "Featured Brands test",
            },
          },
        },
      ],
    },
  },

  "localhost:3000": {
    templateId: 4,
    themeColor: "#22c55e",
    theme: {
      mode: "dark",
      brand: {
        primary: "34 197 94",
        primaryDark: "34 197 94",
        surface: "177 189 200",
        surfaceDark: "47 91 51",
        muted: "226 232 240",
        mutedDark: "195 65 9",
      },
      text: {
        light: "30 41 59",
        subtle: "100 116 139",
        lightDark: "226 232 240",
        subtleDark: "148 163 184",
      },
      fonts: {
        primary: "\"Lato\", sans-serif",
        secondary: "Inter, FiraGO, system-ui, sans-serif",
        heading: "Poppins, Inter, FiraGO, system-ui, sans-serif",
      },
    },
    homepage: {
      templateId: 4,
      sections: [
        {
          type: "HeroCategoryGrid",
          enabled: true,
          order: 1,
          data: {
            headline: {
              ka: "შეიძინეთ ონლაინ",
              en: "Shop Online",
            },
            subheadline: {
              ka: "აღმოაჩინეთ საუკეთესო პროდუქტები",
              en: "Discover the Best Products",
            },
            description: {
              ka: "ათასობით პროდუქტი, სწრაფი მიწოდება და უმაღლესი ხარისხი",
              en: "Thousands of products, fast delivery and premium quality",
            },
            badge: {
              ka: "🔥 ახალი კოლექცია",
              en: "🔥 New Collection",
            },
            backgroundImage: "/hero_client.jpg",
            primaryCta: {
              label: {
                ka: "იყიდე ახლა",
                en: "Shop Now",
              },
              href: "/products",
            },
            stats: [
              {
                value: "10,000+",
                label: {
                  ka: "პროდუქტი",
                  en: "Products",
                },
              },
              {
                value: "50,000+",
                label: {
                  ka: "კმაყოფილი მომხმარებელი",
                  en: "Happy Customers",
                },
              },
              {
                value: "24/7",
                label: {
                  ka: "მხარდაჭერა",
                  en: "Support",
                },
              },
            ],
            features: [
              {
                ka: "✓ უფასო მიწოდება 100₾+ შენაძენზე",
                en: "✓ Free shipping on orders 100₾+",
              },
              {
                ka: "✓ 30 დღიანი დაბრუნების გარანტია",
                en: "✓ 30-day return guarantee",
              },
              {
                ka: "✓ უსაფრთხო გადახდა",
                en: "✓ Secure payment",
              },
            ],
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 2,
          data: {
            imageUrl: "/banners/promo-1.jpg",
            mobileImageUrl: "/banners/promo-1.jpg",
            href: "/category/deals",
            alt: {
              ka: "სპეციალური შეთავაზება",
              en: "Special Offer",
            },
            badge: {
              ka: "🔥 ახალი",
              en: "🔥 New",
            },
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals test",
            },
            subtitle: {
              ka: "უახლესი კოლექცია",
              en: "Latest collection",
            },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {},
            sortBy: "newest",
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 4,
          data: {
            imageUrl: "/banners/promo-2.jpg",
            mobileImageUrl: "/banners/promo-2.jpg",
            href: "/category/new-arrivals",
            alt: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
          },
        },
        {
          type: "CategoryCarousel",
          enabled: true,
          order: 5,
          data: {
            title: {
              ka: "პოპულარული კატეგორიები",
              en: "Popular Categories",
            },
            categories: [
              {
                name: {
                  ka: "ტელეფონები",
                  en: "Phones",
                },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 150,
              },
              {
                name: {
                  ka: "ლეპტოპები",
                  en: "Laptops",
                },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 80,
              },
              {
                name: {
                  ka: "აქსესუარები",
                  en: "Accessories",
                },
                imageUrl: "/cat-accessories.jpg",
                href: "/category/accessories",
                productCount: 200,
              },
            ],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
            subtitle: {
              ka: "უახლესი კოლექცია",
              en: "Latest collection",
            },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {
              isNewArrival: true,
            },
            sortBy: "newest",
          },
        },
        {
          type: "BrandStrip",
          enabled: true,
          order: 6,
          data: {
            title: {
              ka: "ცნობილი ბრენდები",
              en: "Featured Brands test",
            },
          },
        },
      ],
    },
  },
};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];
