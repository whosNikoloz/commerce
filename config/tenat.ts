import type { TenantConfig } from "@/types/tenant";

export const TENANTS: Record<string, TenantConfig> = {
  "commerce-topaz-sigma-62.vercel.app": {
    "templateId": 1,
    "themeColor": "#2563eb",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "37 99 235",
        "primaryDark": "44 109 238",
        "surface": "241 245 249",
        "surfaceDark": "2 6 23",
        "muted": "226 232 240",
        "mutedDark": "16 24 41"
      },
      "text": {
        "light": "30 41 59",
        "subtle": "100 116 139",
        "lightDark": "228 221 222",
        "subtleDark": "106 119 138"
      }
    }
  },
  "commerce-sxvadomain.vercel.app": {
    "templateId": 3,
    "themeColor": "#10b981",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "16 185 129",
        "primaryDark": "5 150 105",
        "surface": "240 253 244",
        "surfaceDark": "6 20 13",
        "muted": "209 250 229",
        "mutedDark": "19 78 74"
      },
      "text": {
        "light": "17 24 39",
        "subtle": "107 114 128",
        "lightDark": "236 253 245",
        "subtleDark": "134 239 172"
      }
    }
  },
  "localhost:3000": {
    "templateId": 1,
    "themeColor": "#2563eb",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "37 99 235",
        "primaryDark": "37 99 235",
        "surface": "241 245 249",
        "surfaceDark": "2 6 23",
        "muted": "226 232 240",
        "mutedDark": "16 24 41"
      },
      "text": {
        "light": "30 41 59",
        "subtle": "100 116 139",
        "lightDark": "228 221 222",
        "subtleDark": "106 119 138"
      },
      "fonts": {
        "primary": "Georgia, serif",
        "secondary": "Inter, system-ui, sans-serif",
        "heading": "Inter, system-ui, sans-serif"
      }
    },
    "homepage": {
      "templateId": 1,
      "sections": [
        {
          "type": "HeroWithSearch",
          "enabled": true,
          "order": 1,
          "data": {
            "headline": {
              "ka": "ტექნოლოგია რომელიც გჭირდება",
              "en": "Technology You Need"
            },
            "subheadline": {
              "ka": "იპოვე საუკეთესო ელექტრონიკა და ტექნოლოგიური პროდუქტები",
              "en": "Find the best electronics and tech products"
            },
            "searchPlaceholder": {
              "ka": "ძებნა პროდუქტების...",
              "en": "Search products..."
            },
            "promoBadge": {
              "ka": "🔥 50%-მდე ფასდაკლება",
              "en": "🔥 Up to 50% Off"
            },
            "imageUrl": "/hero-tech.jpg"
          }
        },
        {
          "type": "CategoryGrid",
          "enabled": true,
          "order": 2,
          "data": {
            "title": {
              "ka": "კატეგორიების მიხედვით",
              "en": "Shop by Category"
            },
            "categories": [
              {
                "name": {
                  "ka": "ლეპტოპები",
                  "en": "Laptops"
                },
                "imageUrl": "/cat-laptops.jpg",
                "href": "/category/laptops",
                "productCount": 150
              },
              {
                "name": {
                  "ka": "სმარტფონები",
                  "en": "Smartphones"
                },
                "imageUrl": "/cat-phones.jpg",
                "href": "/category/phones",
                "productCount": 230
              },
              {
                "name": {
                  "ka": "ტაბლეტები",
                  "en": "Tablets"
                },
                "imageUrl": "/cat-tablets.jpg",
                "href": "/category/tablets",
                "productCount": 85
              },
              {
                "name": {
                  "ka": "აქსესუარები",
                  "en": "Accessories"
                },
                "imageUrl": "/cat-accessories.jpg",
                "href": "/category/accessories",
                "productCount": 420
              }
            ]
          }
        },
        {
          "type": "BrandStrip",
          "enabled": true,
          "order": 3,
          "data": {
            "title": {
              "ka": "პოპულარული ბრენდები",
              "en": "Popular Brands"
            },
            "brands": [
              {
                "name": "Apple",
                "logoUrl": "/brand-apple.svg",
                "href": "/brand/apple"
              },
              {
                "name": "Samsung",
                "logoUrl": "/brand-samsung.svg",
                "href": "/brand/samsung"
              },
              {
                "name": "Dell",
                "logoUrl": "/brand-dell.svg",
                "href": "/brand/dell"
              },
              {
                "name": "HP",
                "logoUrl": "/brand-hp.svg",
                "href": "/brand/hp"
              },
              {
                "name": "Lenovo",
                "logoUrl": "/brand-lenovo.svg",
                "href": "/brand/lenovo"
              },
              {
                "name": "Sony",
                "logoUrl": "/brand-sony.svg",
                "href": "/brand/sony"
              }
            ]
          }
        },
        {
          "type": "DealCountdown",
          "enabled": true,
          "order": 4,
          "data": {
            "title": {
              "ka": "დღის შეთავაზება",
              "en": "Deal of the Day"
            },
            "endsAtISO": "2025-10-01T12:04:01.989Z",
            "dealItems": [
              {
                "sku": "LAP-001",
                "title": {
                  "ka": "MacBook Pro 16\"",
                  "en": "MacBook Pro 16\""
                },
                "image": "/product-macbook.jpg",
                "price": 1999,
                "originalPrice": 2499,
                "href": "/product/macbook-pro-16"
              },
              {
                "sku": "PHO-042",
                "title": {
                  "ka": "iPhone 15 Pro",
                  "en": "iPhone 15 Pro"
                },
                "image": "/product-iphone.jpg",
                "price": 899,
                "originalPrice": 1099,
                "href": "/product/iphone-15-pro"
              },
              {
                "sku": "TAB-023",
                "title": {
                  "ka": "iPad Air",
                  "en": "iPad Air"
                },
                "image": "/product-ipad.jpg",
                "price": 549,
                "originalPrice": 699,
                "href": "/product/ipad-air"
              },
              {
                "sku": "ACC-156",
                "title": {
                  "ka": "AirPods Pro",
                  "en": "AirPods Pro"
                },
                "image": "/product-airpods.jpg",
                "price": 199,
                "originalPrice": 249,
                "href": "/product/airpods-pro"
              }
            ]
          }
        },
        {
          "type": "ProductRailLaptops",
          "enabled": true,
          "order": 5,
          "data": {
            "title": {
              "ka": "ლეპტოპები",
              "en": "Laptops"
            },
            "subtitle": {
              "ka": "სამუშაოსთვის და თამაშებისთვის",
              "en": "For work and gaming"
            },
            "category": "laptops",
            "limit": 4,
            "viewAllHref": "/category/laptops"
          }
        },
        {
          "type": "ProductRailPhones",
          "enabled": true,
          "order": 6,
          "data": {
            "title": {
              "ka": "უახლესი სმარტფონები",
              "en": "Latest Smartphones"
            },
            "subtitle": {
              "ka": "ყველაზე ახალი მოდელები",
              "en": "Newest models"
            },
            "category": "phones",
            "limit": 4,
            "viewAllHref": "/category/phones"
          }
        },
        {
          "type": "ComparisonBlock",
          "enabled": true,
          "order": 7,
          "data": {
            "title": {
              "ka": "შეადარეთ პროდუქტები",
              "en": "Compare Products"
            },
            "description": {
              "ka": "იპოვეთ სწორი არჩევანი თქვენთვის",
              "en": "Find the right choice for you"
            },
            "products": [
              {
                "sku": "LAP-001",
                "name": {
                  "ka": "MacBook Pro",
                  "en": "MacBook Pro"
                },
                "image": "/product-macbook.jpg",
                "specs": [
                  {
                    "label": {
                      "ka": "პროცესორი",
                      "en": "Processor"
                    },
                    "value": "M3 Pro"
                  },
                  {
                    "label": {
                      "ka": "RAM",
                      "en": "RAM"
                    },
                    "value": "16GB"
                  },
                  {
                    "label": {
                      "ka": "შენახვა",
                      "en": "Storage"
                    },
                    "value": "512GB SSD"
                  }
                ],
                "price": 1999,
                "href": "/product/macbook-pro-16"
              },
              {
                "sku": "LAP-015",
                "name": {
                  "ka": "Dell XPS 15",
                  "en": "Dell XPS 15"
                },
                "image": "/product-dell.jpg",
                "specs": [
                  {
                    "label": {
                      "ka": "პროცესორი",
                      "en": "Processor"
                    },
                    "value": "Intel i7"
                  },
                  {
                    "label": {
                      "ka": "RAM",
                      "en": "RAM"
                    },
                    "value": "16GB"
                  },
                  {
                    "label": {
                      "ka": "შენახვა",
                      "en": "Storage"
                    },
                    "value": "512GB SSD"
                  }
                ],
                "price": 1599,
                "href": "/product/dell-xps-15"
              }
            ]
          }
        },
        {
          "type": "Reviews",
          "enabled": true,
          "order": 8,
          "data": {
            "title": {
              "ka": "მომხმარებელთა შეფასებები",
              "en": "Customer Reviews"
            },
            "reviews": [
              {
                "author": "გიორგი მელაძე",
                "rating": 5,
                "text": {
                  "ka": "შესანიშნავი მომსახურება და სწრაფი მიწოდება!",
                  "en": "Excellent service and fast delivery!"
                },
                "date": "2025-01-15",
                "productName": {
                  "ka": "MacBook Pro",
                  "en": "MacBook Pro"
                }
              },
              {
                "author": "მარიამ ხატია",
                "rating": 5,
                "text": {
                  "ka": "საუკეთესო ფასები და ხარისხი.",
                  "en": "Best prices and quality."
                },
                "date": "2025-01-12"
              },
              {
                "author": "ლუკა გელოვანი",
                "rating": 4,
                "text": {
                  "ka": "კარგი არჩევანი, რეკომენდირებულია.",
                  "en": "Good selection, recommended."
                },
                "date": "2025-01-10",
                "productName": {
                  "ka": "iPhone 15",
                  "en": "iPhone 15"
                }
              }
            ]
          }
        },
        {
          "type": "TrustBadges",
          "enabled": true,
          "order": 9,
          "data": {
            "badges": [
              {
                "icon": "shield",
                "title": {
                  "ka": "დაცული გადახდები",
                  "en": "Secure Payments"
                },
                "description": {
                  "ka": "100% უსაფრთხო ტრანზაქციები",
                  "en": "100% secure transactions"
                }
              },
              {
                "icon": "truck",
                "title": {
                  "ka": "უფასო მიწოდება",
                  "en": "Free Shipping"
                },
                "description": {
                  "ka": "შეკვეთებზე 200₾-ზე მეტი",
                  "en": "On orders over $200"
                }
              },
              {
                "icon": "creditCard",
                "title": {
                  "ka": "მარტივი გადახდა",
                  "en": "Easy Payments"
                },
                "description": {
                  "ka": "ყველა ძირითადი მეთოდი",
                  "en": "All major methods accepted"
                }
              },
              {
                "icon": "headphones",
                "title": {
                  "ka": "24/7 მხარდაჭერა",
                  "en": "24/7 Support"
                },
                "description": {
                  "ka": "ყოველთვის აქ რომ დაგეხმაროთ",
                  "en": "Always here to help you"
                }
              }
            ]
          }
        },
        {
          "type": "NewsletterApp",
          "enabled": true,
          "order": 10,
          "data": {
            "title": {
              "ka": "გამოიწერე სიახლეები",
              "en": "Subscribe for Updates"
            },
            "description": {
              "ka": "მიიღე ექსკლუზიური შეთავაზებები და სიახლეები",
              "en": "Get exclusive offers and news"
            },
            "emailPlaceholder": {
              "ka": "შენი ელ. ფოსტა",
              "en": "Your email"
            },
            "ctaLabel": {
              "ka": "გამოწერა",
              "en": "Subscribe"
            },
            "appLinks": {
              "ios": "https://apps.apple.com",
              "android": "https://play.google.com"
            }
          }
        }
      ]
    }
  },
  "nika,ge": {
    "templateId": 2,
    "themeColor": "#f97316",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "249 115 22",
        "primaryDark": "194 65 12",
        "surface": "255 247 237",
        "surfaceDark": "30 27 25",
        "muted": "253 230 138",
        "mutedDark": "66 32 6"
      },
      "text": {
        "light": "31 41 55",
        "subtle": "107 114 128",
        "lightDark": "250 250 249",
        "subtleDark": "156 163 175"
      }
    }
  },
  "test-shop.example.com": {
    "templateId": 3,
    "themeColor": "#a855f7",
    "theme": {
      "mode": "dark",
      "brand": {
        "primary": "168 85 247",
        "primaryDark": "168 85 247",
        "surface": "241 245 249",
        "surfaceDark": "2 6 23",
        "muted": "226 232 240",
        "mutedDark": "16 24 41"
      },
      "text": {
        "light": "30 41 59",
        "subtle": "100 116 139",
        "lightDark": "228 221 222",
        "subtleDark": "106 119 138"
      }
    },
    "homepage": {
      "templateId": 3,
      "sections": []
    }
  }
};

export const DEFAULT_TENANT: TenantConfig = TENANTS["localhost:3000"];
