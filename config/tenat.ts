import type { TenantConfig } from "@/types/tenant";

// NOTE: refined color palettes for contrast/accessibility, Georgian-friendly font stacks,
// fresher content copy, and future-proofed countdown dates (Asia/Tbilisi, UTC+4).
// Keep the same section structure so it matches existing components.

const FUTURE_DEAL_END_1 = new Date("2025-10-05T20:00:00+04:00").toISOString();
const FUTURE_DEAL_END_2 = new Date("2025-10-07T12:00:00+04:00").toISOString();
const FUTURE_DEAL_END_LOCAL = new Date("2025-10-04T23:59:59+04:00").toISOString();

export const TENANTS: Record<string, TenantConfig> = {
  "commerce-topaz-sigma-62.vercel.app": {
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
            imageUrl: "/hero-tech.jpg",
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
              ka: "ბრენდები",
              en: "Popular Brands",
            },
            brands: [
              {
                name: "Apple",
                logoUrl: "/brand-apple.svg",
                href: "/brand/apple",
              },
              {
                name: "Samsung",
                logoUrl: "/brand-samsung.svg",
                href: "/brand/samsung",
              },
              {
                name: "Dell",
                logoUrl: "/brand-dell.svg",
                href: "/brand/dell",
              },
              {
                name: "HP",
                logoUrl: "/brand-hp.svg",
                href: "/brand/hp",
              },
              {
                name: "Lenovo",
                logoUrl: "/brand-lenovo.svg",
                href: "/brand/lenovo",
              },
              {
                name: "Sony",
                logoUrl: "/brand-sony.svg",
                href: "/brand/sony",
              },
            ],
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
          type: "ProductRailLaptops",
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
            category: "laptops",
            limit: 4,
            viewAllHref: "/category/laptops",
          },
        },
        {
          type: "ProductRailPhones",
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
            category: "phones",
            limit: 4,
            viewAllHref: "/category/phones",
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

  "commerce-sxvadomain.vercel.app": {
    templateId: 2,
    themeColor: "#10b981",
    theme: {
      mode: "dark",
      brand: {
        primary: "16 185 129",
        primaryDark: "5 150 105",
        surface: "240 253 244",
        surfaceDark: "6 20 13",
        muted: "209 250 229",
        mutedDark: "19 78 74",
      },
      text: {
        light: "236 253 245",
        subtle: "165 180 189",
        lightDark: "248 250 252",
        subtleDark: "134 239 172",
      },
      fonts: {
        primary: "Inter, FiraGO, system-ui, sans-serif",
        secondary: "Inter, FiraGO, system-ui, sans-serif",
        heading: "Playfair Display, Georgia, FiraGO, serif",
      },
    },
    homepage: {
      templateId: 2,
      sections: [
        {
          type: "HeroLifestyle",
          enabled: true,
          order: 1,
          data: {
            headline: {
              ka: "შექმენი თბილი სახლი",
              en: "Create a Warm Home",
            },
            subheadline: {
              ka: "ელეგანტური დიზაინი ყოველდღიურ კომფორტში",
              en: "Elegant design for everyday comfort",
            },
            imageUrl: "/hero-furniture.jpg",
            overlayOpacity: 0.35,
            cta: {
              label: {
                ka: "ახლავე ნახე",
                en: "Shop Now",
              },
              href: "/categories",
            },
            secondaryCta: {
              label: {
                ka: "კოლექციები",
                en: "Collections",
              },
              href: "/collections",
            },
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
                  ka: "სალონი",
                  en: "Living Room",
                },
                imageUrl: "/cat-living.jpg",
                href: "/category/living-room",
                productCount: 132,
              },
              {
                name: {
                  ka: "საძინებელი",
                  en: "Bedroom",
                },
                imageUrl: "/cat-bedroom.jpg",
                href: "/category/bedroom",
                productCount: 104,
              },
              {
                name: {
                  ka: "სამზარეულო",
                  en: "Kitchen",
                },
                imageUrl: "/cat-kitchen.jpg",
                href: "/category/kitchen",
                productCount: 82,
              },
              {
                name: {
                  ka: "გარეთ",
                  en: "Outdoor",
                },
                imageUrl: "/cat-outdoor.jpg",
                href: "/category/outdoor",
                productCount: 62,
              },
            ],
          },
        },
        {
          type: "ConfiguratorBlock",
          enabled: true,
          order: 3,
          data: {
            title: {
              ka: "შექმენი შენი დივანი",
              en: "Build Your Sofa",
            },
            description: {
              ka: "აირჩიე ზომა, მასალა და ფერი",
              en: "Choose size, material & color",
            },
            steps: [
              {
                label: {
                  ka: "ზომა",
                  en: "Size",
                },
                options: [
                  {
                    ka: "2 ადგილიანი",
                    en: "2‑Seater",
                  },
                  {
                    ka: "3 ადგილიანი",
                    en: "3‑Seater",
                  },
                  {
                    ka: "L-ფორმა",
                    en: "L‑Shape",
                  },
                  {
                    ka: "U-ფორმა",
                    en: "U‑Shape",
                  },
                ],
              },
              {
                label: {
                  ka: "მასალა",
                  en: "Material",
                },
                options: [
                  {
                    ka: "ტყავი",
                    en: "Leather",
                  },
                  {
                    ka: "ქსოვილი",
                    en: "Fabric",
                  },
                  {
                    ka: "ხავერდი",
                    en: "Velvet",
                  },
                ],
              },
              {
                label: {
                  ka: "ფერი",
                  en: "Color",
                },
                options: [
                  {
                    ka: "ნაცრისფერი",
                    en: "Grey",
                  },
                  {
                    ka: "ლურჯი",
                    en: "Blue",
                  },
                  {
                    ka: "ბეჟი",
                    en: "Beige",
                  },
                  {
                    ka: "მწვანე",
                    en: "Green",
                  },
                ],
              },
            ],
            cta: {
              label: {
                ka: "განაგრძეთ",
                en: "Continue",
              },
              href: "/configurator",
            },
          },
        },
        {
          type: "ProductRailNewArrivals",
          enabled: true,
          order: 4,
          data: {
            title: {
              ka: "ახალი ჩამოსვლები",
              en: "New Arrivals",
            },
            subtitle: {
              ka: "უახლესი კოლექციები",
              en: "Latest collections",
            },
            category: "new-arrivals",
            limit: 4,
            viewAllHref: "/category/new-arrivals",
          },
        },
        {
          type: "ProductRailBestSofas",
          enabled: true,
          order: 5,
          data: {
            title: {
              ka: "საუკეთესო დივნები",
              en: "Best Sofas",
            },
            subtitle: {
              ka: "პოპულარული მოდელები",
              en: "Most popular",
            },
            category: "sofas",
            limit: 4,
            viewAllHref: "/category/sofas",
          },
        },
        {
          type: "CustomerGallery",
          enabled: true,
          order: 6,
          data: {
            title: {
              ka: "გალერეა",
              en: "Customer Gallery",
            },
            subtitle: {
              ka: "გაუზიარეთ თქვენი სივრცე #MyHomeStyle",
              en: "Share your space #MyHomeStyle",
            },
            hashtag: {
              ka: "#MyHomeStyle",
              en: "#MyHomeStyle",
            },
            images: [
              {
                url: "/gallery-1.jpg",
                caption: {
                  ka: "თანამედროვე სალონი",
                  en: "Modern living room",
                },
                author: "@home_decor_lover",
              },
              {
                url: "/gallery-2.jpg",
                caption: {
                  ka: "კომფორტული საძინებელი",
                  en: "Cozy bedroom",
                },
                author: "@interior_style",
              },
              {
                url: "/gallery-3.jpg",
                caption: {
                  ka: "მინიმალისტური სამზარეულო",
                  en: "Minimalist kitchen",
                },
                author: "@design_hub",
              },
              {
                url: "/gallery-4.jpg",
                caption: {
                  ka: "ბაღის კუთხე",
                  en: "Outdoor corner",
                },
                author: "@garden_design",
              },
            ],
          },
        },
        {
          type: "BrandStory",
          enabled: true,
          order: 7,
          data: {
            title: {
              ka: "ჩვენი ისტორია",
              en: "Our Story",
            },
            story: {
              ka: "<p>უკვე 20 წელია ვქმნით ხარისხიან ავეჯს საქართველოში. ჩვენი მიზანია — სახლი, სადაც მართლაც კარგად იგრძნობთ თავს.</p><p>თითოეული პროდუქტი მზადდება გამოცდილი ოსტატების მიერ საუკეთესო მასალებით.</p>",
              en: "<p>For 20 years, we've crafted quality furniture in Georgia. Our goal is a home where you truly feel good.</p><p>Each piece is made by master craftsmen using premium materials.</p>",
            },
            imageUrl: "/brand-story.jpg",
            stats: [
              {
                value: "20+",
                label: {
                  ka: "წელი გამოცდილება",
                  en: "Years Experience",
                },
              },
              {
                value: "50K+",
                label: {
                  ka: "კმაყოფილი კლიენტი",
                  en: "Happy Customers",
                },
              },
              {
                value: "500+",
                label: {
                  ka: "პროდუქტი",
                  en: "Products",
                },
              },
            ],
          },
        },
        {
          type: "ReviewsWarranty",
          enabled: true,
          order: 8,
          data: {
            title: {
              ka: "ჩვენზე ამბობენ",
              en: "What They Say",
            },
            reviews: [
              {
                author: "ნინო ბერიძე",
                rating: 5,
                text: {
                  ka: "საუკეთესო ხარისხი და მომსახურება!",
                  en: "Best quality & service!",
                },
                date: "2025-01-14",
              },
              {
                author: "დავით გორგილაძე",
                rating: 5,
                text: {
                  ka: "ძალიან კომფორტული დივანი.",
                  en: "Very comfortable sofa.",
                },
                date: "2025-01-10",
              },
              {
                author: "თამარ გვარამია",
                rating: 5,
                text: {
                  ka: "მშვენიერი დიზაინი და მასალები.",
                  en: "Beautiful design & materials.",
                },
                date: "2025-01-08",
              },
              {
                author: "გიორგი წერეთელი",
                rating: 4,
                text: {
                  ka: "რეკომენდებულია!",
                  en: "Highly recommended!",
                },
                date: "2025-01-05",
              },
            ],
            warrantyInfo: {
              title: {
                ka: "გარანტია და მხარდაჭერა",
                en: "Warranty & Support",
              },
              details: [
                {
                  ka: "5 წლიანი გარანტია",
                  en: "5‑Year Warranty",
                },
                {
                  ka: "უფასო მიწოდება",
                  en: "Free Delivery",
                },
                {
                  ka: "30 დღიანი დაბრუნება",
                  en: "30‑Day Returns",
                },
                {
                  ka: "24/7 მხარდაჭერა",
                  en: "24/7 Support",
                },
              ],
            },
          },
        },
        {
          type: "Newsletter",
          enabled: true,
          order: 9,
          data: {
            title: {
              ka: "იყავით კურსში",
              en: "Stay Updated",
            },
            description: {
              ka: "პროექტები, რჩევები და ფასდაკლებები თქვენს ელფოსტაზე",
              en: "Ideas, tips & deals in your inbox",
            },
            emailPlaceholder: {
              ka: "თქვენი ელ.ფოსტა",
              en: "Your email",
            },
            ctaLabel: {
              ka: "გამოწერა",
              en: "Subscribe",
            },
            privacyNote: {
              ka: "თქვენი მონაცემები დაცულია",
              en: "Your data is protected",
            },
          },
        },
      ],
    },
  },

  "localhost:3000": {
    templateId: 1,
    themeColor: "#22c55e",
    theme: {
      mode: "light",
      brand: {
        primary: "34 197 94",
        primaryDark: "34 197 94",
        surface: "248 250 252",
        surfaceDark: "2 6 23",
        muted: "226 232 240",
        mutedDark: "30 41 59",
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
      templateId: 1,
      sections: [
        {
          type: "HeroWithSearch",
          enabled: true,
          order: 1,
          data: {
            headline: {
              ka: "სწრაფი ტესტი, ბრწყინვალე UI",
              en: "Fast Demos, Polished UI",
            },
            subheadline: {
              ka: "ლოკალურ გარემოში ყველაფერი მკაფიოდ მუშაობს",
              en: "Everything crisp in local dev",
            },
            searchPlaceholder: {
              ka: "მოძებნე პროდუქტი…",
              en: "Search products…",
            },
            promoBadge: {
              ka: "🎉 ახალი კომპონენტები",
              en: "🎉 New components",
            },
            imageUrl: "/hero-tech.jpg",
          },
        },
        {
          type: "CategoryGrid",
          enabled: true,
          order: 2,
          data: {
            title: {
              ka: "კატეგორიები",
              en: "Categories",
            },
            categories: [
              {
                name: {
                  ka: "ლეპტოპები",
                  en: "Laptops",
                },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 150,
              },
              {
                name: {
                  ka: "სმარტფონები",
                  en: "Smartphones",
                },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 230,
              },
              {
                name: {
                  ka: "ტაბლეტები",
                  en: "Tablets",
                },
                imageUrl: "/cat-tablets.jpg",
                href: "/category/tablets",
                productCount: 85,
              },
              {
                name: {
                  ka: "აქსესუარები",
                  en: "Accessories",
                },
                imageUrl: "/cat-accessories.jpg",
                href: "/category/accessories",
                productCount: 420,
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
              ka: "ბრენდები",
              en: "Brands",
            },
            brands: [
              {
                name: "Apple",
                logoUrl: "/brand-apple.svg",
                href: "/brand/apple",
              },
              {
                name: "Samsung",
                logoUrl: "/brand-samsung.svg",
                href: "/brand/samsung",
              },
              {
                name: "Dell",
                logoUrl: "/brand-dell.svg",
                href: "/brand/dell",
              },
              {
                name: "HP",
                logoUrl: "/brand-hp.svg",
                href: "/brand/hp",
              },
              {
                name: "Lenovo",
                logoUrl: "/brand-lenovo.svg",
                href: "/brand/lenovo",
              },
              {
                name: "Sony",
                logoUrl: "/brand-sony.svg",
                href: "/brand/sony",
              },
            ],
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
            endsAtISO: new Date("2025-10-04T19:59:59.000Z").toISOString(),
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
          type: "ProductRailLaptops",
          enabled: true,
          order: 5,
          data: {
            title: {
              ka: "ლეპტოპები",
              en: "Laptops",
            },
            subtitle: {
              ka: "სამუშაოსა და თამაშისთვის",
              en: "Work & gaming",
            },
            category: "laptops",
            limit: 4,
            viewAllHref: "/category/laptops",
          },
        },
        {
          type: "ProductRailPhones",
          enabled: true,
          order: 6,
          data: {
            title: {
              ka: "სმარტფონები",
              en: "Smartphones",
            },
            subtitle: {
              ka: "ახალი მოდელები",
              en: "Newest models",
            },
            category: "phones",
            limit: 4,
            viewAllHref: "/category/phones",
          },
        },
        {
          type: "ComparisonBlock",
          enabled: true,
          order: 7,
          data: {
            title: {
              ka: "შედარება",
              en: "Compare",
            },
            description: {
              ka: "იპოვე სწორი კონფიგურაცია",
              en: "Pick the right config",
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
                      ka: "CPU",
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
                      ka: "მეხსიერება",
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
                      ka: "CPU",
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
                      ka: "მეხსიერება",
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
              en: "Reviews",
            },
            reviews: [
              {
                author: "Demo User A",
                rating: 5,
                text: {
                  ka: "ელვისებური მიწოდება!",
                  en: "Lightning-fast delivery!",
                },
                date: "2025-01-11",
                productName: {
                  ka: "MacBook Pro",
                  en: "MacBook Pro",
                },
              },
              {
                author: "Demo User B",
                rating: 5,
                text: {
                  ka: "ძალიან კარგი სერვისი.",
                  en: "Great service.",
                },
                date: "2025-01-10",
              },
              {
                author: "Demo User C",
                rating: 4,
                text: {
                  ka: "კარგი ფასები.",
                  en: "Good prices.",
                },
                date: "2025-01-08",
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
                  ka: "დაცული გადახდა",
                  en: "Secure",
                },
                description: {
                  ka: "SSL/PCI",
                  en: "SSL/PCI",
                },
              },
              {
                icon: "truck",
                title: {
                  ka: "უფასო მიწოდება",
                  en: "Free Shipping",
                },
                description: {
                  ka: "200₾+",
                  en: "$200+",
                },
              },
              {
                icon: "creditCard",
                title: {
                  ka: "მარტივი გადახდა",
                  en: "Easy Payment",
                },
                description: {
                  ka: "ბარათი/Apple Pay",
                  en: "Card/Apple Pay",
                },
              },
              {
                icon: "headphones",
                title: {
                  ka: "24/7 მხარდაჭერა",
                  en: "24/7 Support",
                },
                description: {
                  ka: "ონლაინ ჩატი",
                  en: "Live chat",
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
              ka: "საინტერესო სიახლეები",
              en: "Fresh Updates",
            },
            description: {
              ka: "ბილდების, კომპონენტებისა და ფიჩერების ანონსები",
              en: "Builds, components & features",
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
};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];
