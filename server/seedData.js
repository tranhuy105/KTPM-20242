const mongoose = require("mongoose");
const { Product, User, Order, Category, Brand } = require("./models");
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

// Brand logos (placeholder URLs)
const BRAND_LOGOS = [
  "https://example.com/logos/logo1.png",
  "https://example.com/logos/logo2.png",
  "https://example.com/logos/logo3.png",
  "https://example.com/logos/logo4.png",
  "https://example.com/logos/logo5.png",
];

// Brand websites
const BRAND_WEBSITES = [
  "https://www.brand-official.com",
  "https://www.luxury-brand.com",
  "https://www.premium-collection.com",
  "https://www.heritage-luxury.com",
  "https://www.elite-fashion.com",
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

// Product colors
const PRODUCT_COLORS = [
  "Đen",
  "Trắng",
  "Vàng",
  "Bạc",
  "Đỏ",
  "Xanh Navy",
  "Xanh Lá",
  "Nâu",
  "Hồng",
  "Tím",
  "Xám",
  "Be",
  "Cam",
  "Burgundy",
];

// Product sizes
const PRODUCT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "One Size",
];

// Product materials
const PRODUCT_MATERIALS = [
  "Da",
  "Da Bò",
  "Da Cá Sấu",
  "Vải Lụa",
  "Vải Cashmere",
  "Vải Cotton",
  "Vải Linen",
  "Kim Loại",
  "Vàng",
  "Bạc",
  "Bạch Kim",
  "Gỗ",
  "Thủy Tinh",
  "Sứ",
  "Đá Cẩm Thạch",
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
        "Sovereign",
        "Timeless",
        "Luxe",
        "Opulent",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Edition",
        "Series",
        "Line",
        "Leather",
        "Crocodile",
        "Calfskin",
        "Monogram",
        "Embossed",
        "Quilted",
      ],
      1
    )[0];
  } else {
    prefix = getRandomItems(
      [
        "Luxury",
        "Premium",
        "Elite",
        "Signature",
        "Exclusive",
        "Prestige",
        "Heritage",
        "Bespoke",
        "Imperial",
        "Royal",
      ],
      1
    )[0];

    suffix = getRandomItems(
      [
        "Collection",
        "Edition",
        "Series",
        "Selection",
        "Line",
        "Masterpiece",
        "Signature",
        "Limited",
        "Reserve",
        "Artisan",
      ],
      1
    )[0];
  }

  return `${prefix} ${suffix}`;
}

// Seed users
async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      isActive: true,
      avatar: DEFAULT_IMAGE,
    });
    await adminUser.save();
    console.log("Admin user created");

    // Create regular users
    const userData = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      userData.push({
        firstName,
        lastName,
        username: faker.internet.username({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName }),
        password: await bcrypt.hash("password123", 10),
        role: "customer",
        isActive: Math.random() > 0.1, // 90% active
        avatar: faker.image.avatar(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: "Vietnam",
        },
        phone: faker.phone.number(),
      });
    }

    // Use create instead of insertMany to ensure we get the documents with _id back
    const users = await User.create(userData);
    console.log(`${users.length} regular users created`);

    // Return all users including admin
    return [...users, adminUser];
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Category image URLs for each category
const CATEGORY_IMAGES = {
  // Parent categories
  "Đồng Hồ Cao Cấp":
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=1000&auto=format&fit=crop",
  "Trang Sức":
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop",
  "Túi Xách & Ví":
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
  "Thời Trang Nam":
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop",
  "Thời Trang Nữ":
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1000&auto=format&fit=crop",
  "Nước Hoa":
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
  "Mỹ Phẩm Cao Cấp":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop",
  "Đồ Trang Trí":
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop",
  "Rượu & Đồ Uống":
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=1000&auto=format&fit=crop",

  // Child categories
  "Đồng Hồ Nam":
    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop",
  "Đồng Hồ Nữ":
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
  "Đồng Hồ Giới Hạn":
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop",
  "Đồng Hồ Cổ Điển":
    "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop",
  Nhẫn: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop",
  "Vòng Tay":
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1000&auto=format&fit=crop",
  "Dây Chuyền":
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop",
  "Hoa Tai":
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop",
  "Kim Cương":
    "https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=1000&auto=format&fit=crop",
  "Đá Quý":
    "https://images.unsplash.com/photo-1551751299-1b51cab2694c?q=80&w=1000&auto=format&fit=crop",
  "Túi Xách Nữ":
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop",
  "Túi Xách Nam":
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
  "Ví Da":
    "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
  "Túi Du Lịch":
    "https://images.unsplash.com/photo-1553808373-92b0bcc3af15?q=80&w=1000&auto=format&fit=crop",
  "Túi Tote":
    "https://images.unsplash.com/photo-1591561954555-607968c989ab?q=80&w=1000&auto=format&fit=crop",
  "Áo Vest":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
  "Áo Sơ Mi":
    "https://images.unsplash.com/photo-1598961942613-ba897716405b?q=80&w=1000&auto=format&fit=crop",
  "Quần Âu":
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop",
  "Giày Da":
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop",
  "Thắt Lưng":
    "https://images.unsplash.com/photo-1553591589-2e96ef7eca65?q=80&w=1000&auto=format&fit=crop",
  "Cà Vạt":
    "https://images.unsplash.com/photo-1589756823695-278bc923f962?q=80&w=1000&auto=format&fit=crop",
  "Đầm Dạ Hội":
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
  "Áo Dài":
    "https://images.unsplash.com/photo-1553591589-2e96ef7eca65?q=80&w=1000&auto=format&fit=crop",
  "Túi Clutch":
    "https://images.unsplash.com/photo-1575844264771-892081089af5?q=80&w=1000&auto=format&fit=crop",
  "Giày Cao Gót":
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop",
  "Khăn Lụa":
    "https://images.unsplash.com/photo-1601370552761-d129028bd833?q=80&w=1000&auto=format&fit=crop",
  "Nước Hoa Nam":
    "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?q=80&w=1000&auto=format&fit=crop",
  "Nước Hoa Nữ":
    "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?q=80&w=1000&auto=format&fit=crop",
  "Nước Hoa Unisex":
    "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?q=80&w=1000&auto=format&fit=crop",
  "Bộ Quà Tặng":
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
  "Trang Điểm":
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
  "Chăm Sóc Da":
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000&auto=format&fit=crop",
  "Son Môi":
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop",
  "Phấn Nền":
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=1000&auto=format&fit=crop",
  "Mặt Nạ":
    "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1000&auto=format&fit=crop",
  "Đèn Trang Trí":
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1000&auto=format&fit=crop",
  "Bình Hoa":
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
  "Tranh Nghệ Thuật":
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
  "Đồ Sứ":
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop",
  "Đồ Thủy Tinh":
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop",
  "Rượu Vang":
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop",
  Whisky:
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=1000&auto=format&fit=crop",
  Cognac:
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=1000&auto=format&fit=crop",
  Champagne:
    "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?q=80&w=1000&auto=format&fit=crop",
  "Rượu Mạnh":
    "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?q=80&w=1000&auto=format&fit=crop",
};

// Seed categories
async function seedCategories() {
  try {
    // Clear existing categories
    await Category.deleteMany({});

    const categories = [];
    const categoryMap = new Map();

    // Create parent categories
    for (const categoryData of LUXURY_CATEGORIES) {
      const parentCategory = new Category({
        name: categoryData.name,
        slug: createSlug(categoryData.name),
        description: `Bộ sưu tập ${categoryData.name.toLowerCase()} cao cấp và sang trọng.`,
        isActive: true,
        displayOrder: categories.length,
        image: CATEGORY_IMAGES[categoryData.name] || DEFAULT_IMAGE,
      });

      await parentCategory.save();
      categories.push(parentCategory);
      categoryMap.set(categoryData.name, parentCategory);

      // Create child categories
      for (const childName of categoryData.children) {
        const childCategory = new Category({
          name: childName,
          slug: createSlug(childName),
          description: `Bộ sưu tập ${childName.toLowerCase()} cao cấp và sang trọng.`,
          parent: parentCategory._id,
          ancestors: [
            {
              _id: parentCategory._id,
              name: parentCategory.name,
              slug: parentCategory.slug,
            },
          ],
          isActive: true,
          displayOrder: 0,
          image: CATEGORY_IMAGES[childName] || DEFAULT_IMAGE,
        });

        await childCategory.save();
        categories.push(childCategory);
        categoryMap.set(childName, childCategory);
      }
    }

    console.log(`${categories.length} categories created`);
    return { categories, categoryMap };
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

// Seed brands
async function seedBrands() {
  try {
    // Clear existing brands
    await Brand.deleteMany({});

    const brands = [];

    // Create brands
    for (const brandName of LUXURY_BRANDS) {
      const brandSlug = createSlug(brandName);

      const brand = new Brand({
        name: brandName,
        slug: brandSlug,
        description: `${brandName} - thương hiệu xa xỉ hàng đầu với những sản phẩm đẳng cấp và tinh tế.`,
        logo: getRandomItems(BRAND_LOGOS, 1)[0],
        website: getRandomItems(BRAND_WEBSITES, 1)[0],
        isActive: true,
        seo: {
          title: `${brandName} - Thương Hiệu Xa Xỉ Hàng Đầu`,
          description: `Khám phá bộ sưu tập ${brandName} độc quyền với thiết kế sang trọng và chất lượng vượt trội.`,
          keywords: getRandomItems(LUXURY_TAGS, 5),
        },
      });

      await brand.save();
      brands.push(brand);
    }

    console.log(`${brands.length} brands created`);
    return brands;
  } catch (error) {
    console.error("Error seeding brands:", error);
    throw error;
  }
}

// Seed products
async function seedProducts(categories, categoryMap, brands, users) {
  try {
    // Clear existing products
    await Product.deleteMany({});

    const products = [];
    const brandMap = new Map(brands.map((brand) => [brand.name, brand]));

    // Check if users are valid MongoDB documents with _id
    if (!users || users.length === 0 || !users[0]._id) {
      console.error(
        "No valid users with _id provided. Users may not have been saved to the database properly."
      );
      // Create a dummy user ID for testing
      const dummyUserId = new mongoose.Types.ObjectId();
      users = [{ _id: dummyUserId }];
    }

    for (let i = 0; i < NUM_PRODUCTS; i++) {
      // Select a random category (prefer child categories)
      const childCategories = categories.filter((c) => c.parent);
      const category =
        Math.random() > 0.1
          ? childCategories[Math.floor(Math.random() * childCategories.length)]
          : categories[Math.floor(Math.random() * categories.length)];

      // Select a random brand
      const brand = brands[Math.floor(Math.random() * brands.length)];

      // Generate product name
      const productName = `${brand.name} ${generateLuxuryProductName(
        category.name
      )}`;
      const slug = createSlug(productName + "-" + faker.string.alphanumeric(5));

      // Generate price (luxury items have higher prices)
      const price = generateLuxuryPrice(1000000, 500000000); // 1M to 500M VND
      const hasDiscount = Math.random() > 0.7;
      const compareAtPrice = hasDiscount
        ? price + generateLuxuryPrice(10000000, 50000000)
        : null;

      // Random inventory
      const inventoryQuantity = Math.floor(Math.random() * 100);

      // Generate images using category images
      const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images per product
      const images = [];

      // Get the category image
      const categoryImage = CATEGORY_IMAGES[category.name] || DEFAULT_IMAGE;
      // Get the parent category image if this is a child category
      const parentCategoryImage = category.parent
        ? CATEGORY_IMAGES[
            categories.find((c) => c._id.equals(category.parent))?.name
          ] || DEFAULT_IMAGE
        : DEFAULT_IMAGE;

      // First image is always from the category
      images.push({
        url: categoryImage,
        alt: `${productName} - ${category.name}`,
        isDefault: true,
      });

      // Add additional images
      for (let j = 1; j < numImages; j++) {
        // Alternate between parent category image and brand-specific image
        const imageUrl =
          j % 2 === 1
            ? parentCategoryImage
            : j === 2
            ? DEFAULT_IMAGE
            : SECONDARY_IMAGE;

        images.push({
          url: imageUrl,
          alt: `${productName} - Hình ${j + 1}`,
          isDefault: false,
        });
      }

      // Generate variants (30% of products have variants)
      const hasVariants = Math.random() > 0.7;
      const variants = [];

      if (hasVariants) {
        const numVariants = Math.floor(Math.random() * 5) + 2;
        for (let v = 0; v < numVariants; v++) {
          // Generate a variant price that's either higher or lower than base price but still positive
          const priceAdjustment =
            Math.random() > 0.5 ? 10000000 : -Math.min(5000000, price * 0.5);
          const variantPrice = Math.max(1000000, price + priceAdjustment);

          variants.push({
            name: `Phiên bản ${v + 1}`,
            sku: `${slug.substring(0, 8)}-V${v + 1}`,
            attributes: {
              color: getRandomItems(PRODUCT_COLORS, 1)[0],
              size: getRandomItems(PRODUCT_SIZES, 1)[0],
            },
            price: variantPrice,
            compareAtPrice: hasDiscount
              ? variantPrice + Math.abs(generateLuxuryPrice(5000000, 20000000))
              : null,
            inventoryQuantity: Math.floor(Math.random() * 50),
            weight: Math.floor(Math.random() * 1000) + 100,
            weightUnit: "g",
          });
        }
      }

      // Random tags
      const tags = getRandomItems(
        LUXURY_TAGS,
        Math.floor(Math.random() * 5) + 1
      );

      // Random color, size, material
      const color = getRandomItems(PRODUCT_COLORS, 1)[0];
      const size = getRandomItems(PRODUCT_SIZES, 1)[0];
      const material = getRandomItems(PRODUCT_MATERIALS, 1)[0];

      // Create product
      const product = new Product({
        name: productName,
        slug,
        description: faker.commerce.productDescription(),
        shortDescription: faker.commerce.productDescription().substring(0, 150),
        brand: brand._id,
        brandName: brand.name,
        images,
        category: category._id,
        tags,
        price,
        compareAtPrice,
        variants,
        seo: {
          title: productName,
          description: `${productName} - ${category.name} cao cấp từ ${brand.name}`,
          keywords: [...tags, brand.name, category.name],
        },
        isPublished: Math.random() > 0.2,
        isFeatured: Math.random() > 0.8,
        hasVariants,
        inventoryQuantity,
        color,
        size,
        material,
        attributes: {
          color,
          size,
          material,
          origin: Math.random() > 0.5 ? "Vietnam" : "Imported",
          warranty: `${Math.floor(Math.random() * 5) + 1} năm`,
        },
        releaseDate: faker.date.past(),
      });

      // Add random reviews (90% of products have reviews)
      if (Math.random() > 0.1) {
        const numReviews = Math.floor(Math.random() * 10) + 1;
        let validReviewCount = 0;

        for (let r = 0; r < numReviews; r++) {
          // Use real users from seed data
          const randomUser = users[Math.floor(Math.random() * users.length)];

          // Only add review if user has a valid _id
          if (randomUser && randomUser._id) {
            product.reviews.push({
              user: randomUser._id,
              rating: Math.floor(Math.random() * 5) + 1,
              title: faker.lorem.sentence(3),
              content: faker.lorem.paragraph(),
              isVerifiedPurchase: Math.random() > 0.3,
            });
            validReviewCount++;
          }
        }

        // Calculate average rating only if there are valid reviews
        if (validReviewCount > 0) {
          const sum = product.reviews.reduce(
            (total, review) => total + review.rating,
            0
          );
          product.averageRating = sum / product.reviews.length;
          product.reviewCount = product.reviews.length;
        } else {
          // Set default values if no valid reviews
          product.averageRating = 0;
          product.reviewCount = 0;
        }
      }

      await product.save();
      products.push(product);

      // Update progress
      if ((i + 1) % 100 === 0 || i === NUM_PRODUCTS - 1) {
        console.log(`Created ${i + 1}/${NUM_PRODUCTS} products`);
      }
    }

    console.log(`${products.length} products created`);
    return products;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

// Main function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Seed data
    const users = await seedUsers();
    const { categories, categoryMap } = await seedCategories();
    const brands = await seedBrands();
    const products = await seedProducts(categories, categoryMap, brands, users);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
