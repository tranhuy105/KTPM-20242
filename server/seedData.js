const mongoose = require("mongoose");
const { Product, User, Order, Category } = require("./models");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const slugify = require("slugify");
require("dotenv").config();

// Constants
const NUM_USERS = 50;
const NUM_CATEGORIES = 20;
const NUM_PRODUCTS = 1000;
const DEFAULT_IMAGE =
  "https://avatars.githubusercontent.com/u/136960770?s=400&u=7c6b4e1418dbe389da05427cf522c5546cb1d360&v=4";
const SECONDARY_IMAGE =
  "https://kongmedia.vn/wp-content/uploads/sites/3/2019/12/c5e20abd0428c093e022d8931b952856d464e881.png";

// Luxury Vietnamese and international brands
const LUXURY_BRANDS = [
  "Louis Vuitton",
  "Gucci",
  "Dior",
  "Hermès",
  "Prada",
  "Chanel",
  "Versace",
  "Burberry",
  "Givenchy",
  "Fendi",
  "Bvlgari",
  "Cartier",
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Tag Heuer",
  "Longines",
  "Chopard",
  "Montblanc",
  "Bottega Veneta",
  "Valentino",
  "Balenciaga",
  "Saint Laurent",
  "Loewe",
  "Celine",
  "Phúc Long Heritage",
  "D'Diamond Palace",
  "Yen Collection",
  "Sài Gòn Haute",
  "Minh Long Royal",
];

// Luxury product categories
const LUXURY_CATEGORIES = [
  {
    name: "Đồng Hồ Cao Cấp",
    children: [
      "Đồng Hồ Nam",
      "Đồng Hồ Nữ",
      "Đồng Hồ Giới Hạn",
      "Đồng Hồ Cổ Điển",
    ],
  },
  {
    name: "Trang Sức",
    children: [
      "Nhẫn",
      "Vòng Tay",
      "Dây Chuyền",
      "Hoa Tai",
      "Kim Cương",
      "Đá Quý",
    ],
  },
  {
    name: "Túi Xách & Ví",
    children: [
      "Túi Xách Nữ",
      "Túi Xách Nam",
      "Ví Da",
      "Túi Du Lịch",
      "Túi Tote",
    ],
  },
  {
    name: "Thời Trang Nam",
    children: [
      "Áo Vest",
      "Áo Sơ Mi",
      "Quần Âu",
      "Giày Da",
      "Thắt Lưng",
      "Cà Vạt",
    ],
  },
  {
    name: "Thời Trang Nữ",
    children: [
      "Đầm Dạ Hội",
      "Áo Dài",
      "Túi Clutch",
      "Giày Cao Gót",
      "Khăn Lụa",
    ],
  },
  {
    name: "Nước Hoa",
    children: ["Nước Hoa Nam", "Nước Hoa Nữ", "Nước Hoa Unisex", "Bộ Quà Tặng"],
  },
  {
    name: "Mỹ Phẩm Cao Cấp",
    children: ["Trang Điểm", "Chăm Sóc Da", "Son Môi", "Phấn Nền", "Mặt Nạ"],
  },
  {
    name: "Đồ Trang Trí",
    children: [
      "Đèn Trang Trí",
      "Bình Hoa",
      "Tranh Nghệ Thuật",
      "Đồ Sứ",
      "Đồ Thủy Tinh",
    ],
  },
  {
    name: "Rượu & Đồ Uống",
    children: ["Rượu Vang", "Whisky", "Cognac", "Champagne", "Rượu Mạnh"],
  },
];

// Luxury product tags in Vietnamese
const LUXURY_TAGS = [
  "Cao Cấp",
  "Hạng Sang",
  "Giới Hạn",
  "Thủ Công",
  "Phiên Bản Đặc Biệt",
  "Bộ Sưu Tập Mới",
  "Nhập Khẩu",
  "Chính Hãng",
  "Quý Hiếm",
  "Đẳng Cấp",
  "Sang Trọng",
  "Thiết Kế Riêng",
  "Bespoke",
  "Mùa Mới",
  "Vĩnh Cửu",
  "Phiên Bản Giới Hạn",
  "Handmade",
  "Da Thật",
  "Tinh Xảo",
  "Kim Cương",
];

// Helper function to create slugs
function createSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "vi",
  });
}

// Helper function to generate a luxury price range (higher prices for luxury items)
function generateLuxuryPrice(min, max) {
  // Generate a price in the given range that typically ends in 000000 for luxury items
  const basePrice =
    Math.floor(Math.random() * ((max - min) / 1000000)) * 1000000 + min;
  return Math.floor(basePrice / 1000000) * 1000000;
}

// Helper function to get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate luxury product names
function generateLuxuryProductName(category) {
  let prefix = "";
  let suffix = "";

  // Generate prefixes based on category
  if (category.includes("Đồng Hồ")) {
    prefix = getRandomItems(
      [
        "Royal",
        "Elite",
        "Grand",
        "Imperial",
        "Sovereign",
        "Dynasty",
        "Legacy",
        "Prestige",
        "Heritage",
        "Lumiere",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Masterpiece",
        "Collection",
        "Limited",
        "Chronograph",
        "Tourbillon",
        "Automatic",
        "Skeleton",
        "Moonphase",
        "Platinum",
        "Diamond",
      ],
      1
    )[0];
  } else if (category.includes("Trang Sức")) {
    prefix = getRandomItems(
      [
        "Eternal",
        "Divine",
        "Celestial",
        "Opulent",
        "Majestic",
        "Radiant",
        "Imperial",
        "Exquisite",
        "Precious",
        "Brilliant",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Diamond",
        "Sapphire",
        "Ruby",
        "Emerald",
        "Gold",
        "Platinum",
        "Pearl",
        "Signature",
        "Infinity",
      ],
      1
    )[0];
  } else if (category.includes("Túi") || category.includes("Ví")) {
    prefix = getRandomItems(
      [
        "Classic",
        "Iconic",
        "Elite",
        "Signature",
        "Heritage",
        "Prestige",
        "Imperial",
        "Sovereign",
        "Dynasty",
        "Noble",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Monogram",
        "Edition",
        "Calfskin",
        "Crocodile",
        "Handcrafted",
        "Exotic",
        "Leather",
        "Limited",
        "Series",
      ],
      1
    )[0];
  } else if (category.includes("Thời Trang")) {
    prefix = getRandomItems(
      [
        "Couture",
        "Elite",
        "Bespoke",
        "Signature",
        "Atelier",
        "Runway",
        "Exclusive",
        "Luxe",
        "Prestige",
        "Heritage",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Edition",
        "Line",
        "Series",
        "Capsule",
        "Silk",
        "Cashmere",
        "Handcrafted",
        "Limited",
        "Seasonal",
      ],
      1
    )[0];
  } else if (category.includes("Nước Hoa")) {
    prefix = getRandomItems(
      [
        "Essence",
        "Parfum",
        "Elixir",
        "Aroma",
        "L'eau",
        "Mystique",
        "Enchant",
        "Divine",
        "Secret",
        "Royal",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "de Parfum",
        "Intense",
        "Collection Privée",
        "Exclusive",
        "Limited Edition",
        "Noir",
        "Blanc",
        "Orient",
        "Absolue",
        "Oud",
      ],
      1
    )[0];
  } else {
    prefix = getRandomItems(
      [
        "Luxe",
        "Elite",
        "Premium",
        "Royal",
        "Imperial",
        "Exclusive",
        "Heritage",
        "Prestige",
        "Signature",
        "Distinguished",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Limited",
        "Edition",
        "Series",
        "Selection",
        "Reserve",
        "Signature",
        "Luxury",
        "Exclusive",
        "Elite",
      ],
      1
    )[0];
  }

  // Create the product name
  const model =
    faker.string.alpha(2).toUpperCase() +
    "-" +
    faker.number.int({ min: 100, max: 999 });

  return `${prefix} ${model} ${suffix}`;
}

// Seed users
async function seedUsers() {
  console.log("Seeding users...");
  const users = [];

  // Create admin user
  const adminUser = new User({
    username: "admin",
    email: "admin@luxurystore.vn",
    password: await bcrypt.hash("admin123", 10),
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isAdmin: true,
    isActive: true,
    isVerified: true,
  });

  users.push(adminUser);

  // Create regular users
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = new User({
      username: faker.internet
        .userName({ firstName, lastName })
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""),
      email: faker.internet.email({ firstName, lastName }),
      password: await bcrypt.hash("password123", 10),
      firstName,
      lastName,
      phone: faker.phone.number(),
      isActive: true,
      isVerified: Math.random() > 0.2, // 80% are verified
      role: "customer",
    });

    // Add luxury address for most users - use upscale districts in Vietnam
    if (Math.random() > 0.2) {
      const upscaleDistricts = [
        "Quận 1, TP.HCM",
        "Quận 2, TP.HCM",
        "Quận 3, TP.HCM",
        "Thảo Điền, TP.HCM",
        "Phú Mỹ Hưng, TP.HCM",
        "Quận Ba Đình, Hà Nội",
        "Quận Hoàn Kiếm, Hà Nội",
        "Quận Tây Hồ, Hà Nội",
        "Quận Cầu Giấy, Hà Nội",
        "Đảo Phú Quốc, Kiên Giang",
        "Bãi Dài, Nha Trang",
        "Bán đảo Sơn Trà, Đà Nẵng",
      ];

      const district =
        upscaleDistricts[Math.floor(Math.random() * upscaleDistricts.length)];

      user.addresses.push({
        fullName: `${firstName} ${lastName}`,
        addressLine1: faker.location.streetAddress(),
        city: district.split(",")[1]?.trim() || "TP.HCM",
        state: district.split(",")[0]?.trim() || "Quận 1",
        postalCode: faker.location.zipCode(),
        country: "Việt Nam",
        phone: faker.phone.number(),
        isDefault: true,
      });
    }

    users.push(user);
  }

  await User.insertMany(users);
  console.log(`Seeded ${users.length} users`);
  return users;
}

// Seed categories
async function seedCategories() {
  console.log("Seeding categories...");
  const categories = [];
  const categoryMap = new Map();

  // Create parent categories
  for (const category of LUXURY_CATEGORIES) {
    const parentCategory = new Category({
      name: category.name,
      slug: createSlug(category.name),
      description: `Bộ sưu tập ${category.name.toLowerCase()} cao cấp và sang trọng, được thiết kế tinh xảo và chọn lọc kỹ lưỡng.`,
      isActive: true,
      displayOrder: categories.length + 1,
    });

    await parentCategory.save();
    categories.push(parentCategory);
    categoryMap.set(category.name, parentCategory);

    // Create child categories
    if (category.children && category.children.length) {
      for (const childName of category.children) {
        const childCategory = new Category({
          name: childName,
          slug: createSlug(childName),
          description: `Bộ sưu tập ${childName.toLowerCase()} cao cấp và sang trọng, được thiết kế tinh xảo và chọn lọc kỹ lưỡng.`,
          parent: parentCategory._id,
          ancestors: [
            {
              _id: parentCategory._id,
              name: parentCategory.name,
              slug: parentCategory.slug,
            },
          ],
          isActive: true,
          displayOrder: 1,
        });

        await childCategory.save();
        categories.push(childCategory);
        categoryMap.set(childName, childCategory);
      }
    }
  }

  console.log(`Seeded ${categories.length} categories`);
  return { categories, categoryMap };
}

// Seed products
async function seedProducts(categories, categoryMap) {
  console.log("Seeding products...");
  const products = [];
  const leafCategories = categories.filter(
    (c) =>
      !c.parent ||
      categories.some(
        (child) => child.parent && child.parent.toString() === c._id.toString()
      )
  );

  for (let i = 0; i < NUM_PRODUCTS; i++) {
    // Get a random category
    const category =
      leafCategories[Math.floor(Math.random() * leafCategories.length)];

    // Generate luxury product name
    const productName = generateLuxuryProductName(category.name);

    // Generate price based on category (luxury items have higher prices)
    let minPrice = 3000000; // 3 million VND minimum
    let maxPrice = 50000000; // 50 million VND default max

    // Adjust price ranges based on category
    if (category.name.includes("Đồng Hồ")) {
      minPrice = 30000000; // 30 million VND
      maxPrice = 500000000; // 500 million VND
    } else if (category.name.includes("Trang Sức")) {
      minPrice = 20000000; // 20 million VND
      maxPrice = 800000000; // 800 million VND
    } else if (category.name.includes("Túi") || category.name.includes("Ví")) {
      minPrice = 15000000; // 15 million VND
      maxPrice = 200000000; // 200 million VND
    } else if (category.name.includes("Nước Hoa")) {
      minPrice = 5000000; // 5 million VND
      maxPrice = 30000000; // 30 million VND
    }

    // Generate luxury price
    const price = generateLuxuryPrice(minPrice, maxPrice);

    // Some products have exclusive discount
    const hasDiscount = Math.random() > 0.8; // Fewer discounts for luxury items
    const compareAtPrice = hasDiscount
      ? Math.floor(price * (1 + Math.random() * 0.3))
      : null;

    // Generate random luxury tags
    const tags = getRandomItems(LUXURY_TAGS, Math.floor(Math.random() * 3) + 1);

    // Generate random luxury brand
    const brand =
      LUXURY_BRANDS[Math.floor(Math.random() * LUXURY_BRANDS.length)];

    const hasVariants = Math.random() > 0.5;
    const inventoryQuantity = Math.floor(Math.random() * 20) + 1; // Limited inventory for luxury products

    // Create luxury product descriptions
    const luxuryDescriptions = [
      `${productName} là biểu tượng của sự sang trọng và đẳng cấp. Sản phẩm được chế tác thủ công bởi những nghệ nhân hàng đầu, sử dụng vật liệu cao cấp nhất và công nghệ tiên tiến.`,
      `Thiết kế tinh tế và đẳng cấp, ${productName} mang đến sự sang trọng vượt thời gian. Mỗi chi tiết đều được chăm chút tỉ mỉ, phản ánh bản sắc thương hiệu ${brand}.`,
      `${productName} là tuyệt tác của sự hoàn hảo, kết hợp giữa nghệ thuật chế tác truyền thống và công nghệ hiện đại. Sản phẩm thuộc bộ sưu tập giới hạn, đại diện cho đẳng cấp và phong cách.`,
      `Với thiết kế độc đáo và vật liệu cao cấp, ${productName} là lựa chọn hoàn hảo cho những khách hàng tinh tế. Mỗi sản phẩm đều kèm theo giấy chứng nhận xuất xứ và bảo hành toàn cầu.`,
      `${productName} - kiệt tác của thương hiệu ${brand}, là sự kết hợp hoàn hảo giữa truyền thống và hiện đại. Sản phẩm được thiết kế dành riêng cho những người đam mê sự sang trọng và đẳng cấp.`,
    ];

    const description =
      luxuryDescriptions[Math.floor(Math.random() * luxuryDescriptions.length)];
    const shortDescription = `${productName} - Sản phẩm cao cấp từ thương hiệu ${brand}, biểu tượng cho sự sang trọng và đẳng cấp.`;

    // Create product
    const product = new Product({
      name: productName,
      slug: createSlug(productName),
      description,
      shortDescription,
      brand,
      price,
      compareAtPrice,
      category: category._id,
      tags,
      status: Math.random() > 0.1 ? "active" : "draft",
      isPublished: Math.random() > 0.1,
      isFeatured: Math.random() > 0.7, // More featured products for luxury store
      hasVariants,
      inventoryQuantity: hasVariants ? 0 : inventoryQuantity,
      inventoryTracking: true,
      images: [
        { url: DEFAULT_IMAGE, alt: productName, isDefault: true },
        {
          url: SECONDARY_IMAGE,
          alt: `${productName} - Hình ảnh bổ sung`,
          isDefault: false,
        },
      ],
      seo: {
        title: `${productName} | ${brand} | Luxury Store Vietnam`,
        description: `Mua ${productName} chính hãng ${brand} - sản phẩm cao cấp và sang trọng tại Luxury Store Vietnam.`,
        keywords: [
          ...tags,
          brand,
          "luxury",
          "cao cấp",
          "hàng hiệu",
          "chính hãng",
        ],
      },
    });

    // Add variants for products with variants
    if (hasVariants) {
      const variantTypes = [];

      // Determine variant types based on category
      if (category.name.includes("Thời Trang")) {
        variantTypes.push({
          name: "Kích cỡ",
          values: ["XS", "S", "M", "L", "XL"],
        });

        variantTypes.push({
          name: "Màu sắc",
          values: [
            "Đen",
            "Trắng",
            "Xanh Navy",
            "Đỏ Burgundy",
            "Be",
            "Xám Chì",
            "Nâu Caramel",
          ],
        });
      } else if (category.name.includes("Đồng Hồ")) {
        variantTypes.push({
          name: "Chất liệu",
          values: [
            "Vàng 18K",
            "Vàng Hồng",
            "Bạc 925",
            "Platinum",
            "Thép không gỉ",
            "Titanium",
          ],
        });

        variantTypes.push({
          name: "Kích thước mặt",
          values: ["36mm", "38mm", "40mm", "42mm", "44mm"],
        });
      } else if (category.name.includes("Trang Sức")) {
        variantTypes.push({
          name: "Chất liệu",
          values: [
            "Vàng 18K",
            "Vàng 24K",
            "Bạc 925",
            "Platinum",
            "Kim cương",
            "Ngọc trai",
          ],
        });

        variantTypes.push({
          name: "Kích thước",
          values: ["Nhỏ", "Trung bình", "Lớn"],
        });
      } else if (
        category.name.includes("Túi") ||
        category.name.includes("Ví")
      ) {
        variantTypes.push({
          name: "Chất liệu",
          values: [
            "Da bê",
            "Da cá sấu",
            "Da trăn",
            "Da đà điểu",
            "Canvas cao cấp",
            "Vải tweed",
          ],
        });

        variantTypes.push({
          name: "Màu sắc",
          values: [
            "Đen",
            "Nâu Cognac",
            "Đỏ Burgundy",
            "Xanh Navy",
            "Be",
            "Trắng ngà",
            "Vàng Champagne",
          ],
        });
      } else if (category.name.includes("Nước Hoa")) {
        variantTypes.push({
          name: "Dung tích",
          values: ["30ml", "50ml", "75ml", "100ml", "200ml"],
        });

        variantTypes.push({
          name: "Nồng độ",
          values: [
            "Eau de Toilette",
            "Eau de Parfum",
            "Parfum",
            "Cologne",
            "Extrait de Parfum",
          ],
        });
      } else {
        variantTypes.push({
          name: "Phiên bản",
          values: ["Tiêu chuẩn", "Cao cấp", "Giới hạn", "Đặc biệt", "Bespoke"],
        });

        variantTypes.push({
          name: "Chất liệu",
          values: [
            "Da cao cấp",
            "Kim loại quý",
            "Gỗ quý",
            "Pha lê",
            "Sứ cao cấp",
            "Composite cao cấp",
          ],
        });
      }

      // Generate luxury variants
      for (
        let variantIndex = 0;
        variantIndex <
        Math.min(
          6,
          variantTypes[0].values.length * (variantTypes[1]?.values.length || 1)
        );
        variantIndex++
      ) {
        const variantAttributes = {};

        // Assign attributes
        variantTypes.forEach((variantType) => {
          const randomValueIndex = Math.floor(
            Math.random() * variantType.values.length
          );
          variantAttributes[variantType.name] =
            variantType.values[randomValueIndex];
        });

        // Generate variant name
        const variantName = Object.values(variantAttributes).join(", ");

        // Generate variant price (luxury variants can have significant price differences)
        const priceAdjustment = Math.floor(Math.random() * 20) * 1000000;
        // Make sure the price is always positive
        const variantPrice = Math.max(
          minPrice,
          price + (Math.random() > 0.5 ? priceAdjustment : -priceAdjustment)
        );

        // Generate variant compareAtPrice (ensure it's always greater than the variant price)
        const variantCompareAtPrice = hasDiscount
          ? Math.floor(variantPrice * (1 + Math.random() * 0.3))
          : null;

        // Generate a unique SKU for the variant using random characters to ensure uniqueness
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        // Ensure the variant name is not empty
        const variantNameSlug = variantName
          ? variantName.replace(/[, ]/g, "-").toLowerCase().substring(0, 10)
          : "default";
        const sku = `${createSlug(productName).substring(
          0,
          8
        )}-${variantNameSlug}-${uniqueSuffix}`;

        product.variants.push({
          name: variantName,
          sku: sku, // This will never be null now
          attributes: variantAttributes,
          price: variantPrice,
          compareAtPrice: variantCompareAtPrice,
          inventoryQuantity: Math.floor(Math.random() * 10) + 1, // Very limited inventory for luxury variants
          weight: Math.random() * 2 + 0.1,
          weightUnit: "kg",
        });
      }
    }

    products.push(product);

    // Log progress
    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1}/${NUM_PRODUCTS} luxury products`);
    }
  }

  // Insert products one by one to better handle potential errors
  console.log(`Saving ${products.length} luxury products to the database...`);
  let savedCount = 0;

  for (const product of products) {
    try {
      await product.save();
      savedCount++;

      // Log progress every 10 products
      if (savedCount % 10 === 0) {
        console.log(`Saved ${savedCount}/${products.length} luxury products`);
      }
    } catch (error) {
      console.error(`Error saving product "${product.name}": ${error.message}`);
    }
  }

  console.log(
    `Successfully saved ${savedCount} out of ${products.length} luxury products`
  );
  return products;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log("Starting luxury store database seeding...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    console.log("Cleared existing data");

    // Seed data
    const users = await seedUsers();
    const { categories, categoryMap } = await seedCategories();
    const products = await seedProducts(categories, categoryMap);

    console.log("Luxury store database seeding completed successfully!");

    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
