import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Predefined Demo Location coordinates (Sri City Central Hub)
export const DEMO_COORDINATES = {
  latitude: 13.5558,
  longitude: 80.0272,
  formattedAddress: "Gnan Marg, Sri City, Andhra Pradesh 517646, India",
  city: "Sri City (Demo)",
};

interface DemoItemDef {
  name: string;
  description: string;
  price: number;
  image: string;
}

interface DemoRestaurantDef {
  demoKey: string;
  name: string;
  description: string;
  image: string;
  phone: number;
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress: string;
  items: DemoItemDef[];
}

export const DEMO_RESTAURANTS: DemoRestaurantDef[] = [
  {
    demoKey: "demo_rest_spice_symphony",
    name: "[Demo] Spice Symphony (Biryani & Curries)",
    description:
      "Royal North Indian curries, slow-cooked biryanis, and tandoori breads",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
    phone: 9876500101,
    coordinates: [80.0278, 13.5562], // ~150m from hub
    formattedAddress:
      "Plot 12, Central Commercial Boulevard, Sri City, AP 517646, India",
    items: [
      {
        name: "Dum Handi Chicken Biryani",
        description:
          "Aromatic basmati rice layered with tender spiced chicken and saffron",
        price: 280,
        image:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Paneer Butter Masala",
        description:
          "Cottage cheese cubes simmered in a velvety butter tomato gravy",
        price: 230,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Garlic Butter Naan (2 pcs)",
        description:
          "Crispy clay-oven baked bread brushed with fresh garlic and butter",
        price: 75,
        image:
          "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Tandoori Chicken Tikka",
        description:
          "Char-grilled marinated chicken skewers served with mint chutney",
        price: 240,
        image:
          "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_rustic_crust",
    name: "[Demo] The Rustic Crust (Pizza & Pasta)",
    description:
      "Hand-tossed sourdough pizzas, creamy pastas, and Italian garlic bread",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    phone: 9876500102,
    coordinates: [80.0265, 13.5548], // ~250m from hub
    formattedAddress: "Shop 4, Innovation Park Road, Sri City, AP 517646, India",
    items: [
      {
        name: "Margherita Superiore",
        description:
          "San Marzano tomato sauce, fresh mozzarella, and sweet basil leaves",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Smoked Pepperoni Feast",
        description:
          "Loaded with spicy pepperoni slices and melted mozzarella",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Creamy Alfredo Penne",
        description:
          "Tossed in rich garlic parmesan cream sauce with sautéed mushrooms",
        price: 260,
        image:
          "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Cheese Garlic Breadsticks",
        description:
          "Toasted herb baguette topped with garlic butter and melted mozzarella",
        price: 140,
        image:
          "https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_tokyo_wok",
    name: "[Demo] Tokyo Wok & Ramen",
    description:
      "Steaming ramen bowls, pan-fried gyozas, dim sum, and wok noodles",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    phone: 9876500103,
    coordinates: [80.029, 13.5575], // ~400m from hub
    formattedAddress:
      "Ground Floor, Tech Vista Arcade, Sri City, AP 517646, India",
    items: [
      {
        name: "Shoyu Chicken Ramen",
        description:
          "Rich soy broth with spring noodles, tender chicken, soft egg, and nori",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Chili Garlic Hakka Noodles",
        description:
          "Wok-tossed noodles with crunchy bell peppers and spicy chili garlic paste",
        price: 180,
        image:
          "https://res.cloudinary.com/dk2q1qz1d/image/upload/v1779701106/nycshrvtxw3njgfc9ryk.jpg",
      },
      {
        name: "Steamed Chicken Dim Sum (6 pcs)",
        description:
          "Delicate steamed dumplings served with fiery chili scallion dip",
        price: 210,
        image:
          "https://res.cloudinary.com/dk2q1qz1d/image/upload/v1779701134/nsiria36vllzhvxnwb1a.jpg",
      },
      {
        name: "Crispy Vegetable Spring Rolls",
        description:
          "Golden fried rolls filled with julienne vegetables and sweet chili dip",
        price: 150,
        image:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_burger_barrel",
    name: "[Demo] Burger & Barrel Bistro",
    description:
      "Crispy chicken burgers, gourmet vegetarian patties, loaded fries, and thick shakes",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    phone: 9876500104,
    coordinates: [80.025, 13.5535], // ~450m from hub
    formattedAddress: "Block C, Metro Galleria, Sri City, AP 517646, India",
    items: [
      {
        name: "Classic Crispy Chicken Burger",
        description:
          "Fried buttermilk chicken breast, spicy mayo, and pickles on brioche",
        price: 220,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Smoky BBQ Paneer Burger",
        description:
          "Grilled spiced paneer steak with caramelized onions and house BBQ glaze",
        price: 190,
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Peri-Peri Seasoned Fries",
        description:
          "Crispy golden shoestring fries tossed in fiery African peri-peri spices",
        price: 110,
        image:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Belgian Chocolate Milkshake",
        description:
          "Thick blended shake with dark cocoa, whole milk, and chocolate chips",
        price: 160,
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_southern_tiffin",
    name: "[Demo] Southern Tiffin House",
    description:
      "Authentic South Indian dosas, fluffy idlis, crispy vada, and degree filter coffee",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    phone: 9876500105,
    coordinates: [80.0305, 13.5585], // ~600m from hub
    formattedAddress: "Temple View Road, Sri City, AP 517646, India",
    items: [
      {
        name: "Ghee Roast Masala Dosa",
        description:
          "Crisp golden crepe roasted in pure ghee stuffed with spiced potato masala",
        price: 120,
        image:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Steamed Idli Sambar (3 pcs)",
        description:
          "Steamed rice cakes served with hot lentil vegetable sambar and coconut chutney",
        price: 70,
        image:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Crispy Medu Vada (2 pcs)",
        description:
          "Golden lentil fritters with crushed peppercorns and ginger",
        price: 80,
        image:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Traditional Kumbakonam Filter Coffee",
        description:
          "Freshly brewed chicory coffee frothed with boiling whole milk",
        price: 45,
        image:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_sweet_tooth",
    name: "[Demo] Sweet Tooth Bakery & Cafe",
    description:
      "Artisan cheesecakes, warm fudge brownies, fresh pastries, and cold coffees",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    phone: 9876500106,
    coordinates: [80.024, 13.557], // ~500m from hub
    formattedAddress: "1st Avenue Promenade, Sri City, AP 517646, India",
    items: [
      {
        name: "New York Baked Cheesecake",
        description:
          "Dense and creamy classic cheesecake on a graham cracker butter crust",
        price: 190,
        image:
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Hot Sizzling Walnut Brownie",
        description:
          "Dark chocolate fudge brownie studded with walnuts and warm ganache",
        price: 150,
        image:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Red Velvet Cupcake",
        description:
          "Moist crimson sponge crowned with vanilla cream cheese frosting",
        price: 90,
        image:
          "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Iced Caramel Macchiato",
        description:
          "Espresso poured over chilled milk, vanilla syrup, and rich caramel drizzle",
        price: 140,
        image:
          "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    demoKey: "demo_rest_green_garden",
    name: "[Demo] Green Garden Bowls",
    description:
      "Wholesome protein grain bowls, Mediterranean wraps, and cold-pressed juices",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    phone: 9876500107,
    coordinates: [80.0285, 13.553], // ~350m from hub
    formattedAddress: "Eco Zone Plaza, Sri City, AP 517646, India",
    items: [
      {
        name: "Mediterranean Falafel Bowl",
        description:
          "Crisp falafels, garlic hummus, quinoa, pickled cabbage, and tahini drizzle",
        price: 240,
        image:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Grilled Paneer Protein Salad",
        description:
          "Herb-crusted cottage cheese with mixed greens, walnuts, and lemon vinaigrette",
        price: 220,
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Berry Blast Antioxidant Smoothie",
        description:
          "Blended strawberries, blueberries, Greek yogurt, and chia seeds",
        price: 160,
        image:
          "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
];

export async function seedDemoData() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  if (!mongoUri) {
    console.error("❌ Error: MONGO_URI is not defined.");
    console.error(
      "Please set MONGO_URI in services/restaurant/.env or export it in your environment."
    );
    process.exit(1);
  }

  let sanitizedHost = "unknown";
  try {
    const parsed = new URL(mongoUri);
    sanitizedHost = parsed.hostname;
  } catch {
    sanitizedHost = "remote-cluster";
  }

  console.log(`Connecting to MongoDB cluster (${sanitizedHost})...`);
  const conn = await mongoose.connect(mongoUri, dbName ? { dbName } : {});
  const db = conn.connection.db;

  if (!db) {
    throw new Error("Failed to access MongoDB database instance.");
  }

  console.log(`✅ Connected to database: "${db.databaseName}"`);

  try {
    const usersCol = db.collection("users");
    const restaurantsCol = db.collection("restaurants");
    const menuItemsCol = db.collection("menuitems");
    const ridersCol = db.collection("riders");
    const addressesCol = db.collection("addresses");

    // Ensure 2dsphere indexes on geospatial collections
    await restaurantsCol.createIndex({ autoLocation: "2dsphere" });
    await ridersCol.createIndex({ location: "2dsphere" });
    await addressesCol.createIndex({ location: "2dsphere" });

    // 1. Upsert Demo Seller User (idempotent by unique email)
    const sellerEmail = "seller@zippy.demo";
    const sellerResult = await usersCol.findOneAndUpdate(
      { email: sellerEmail },
      {
        $set: {
          name: "Zippy Demo Seller",
          email: sellerEmail,
          image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          role: "seller",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    const demoSellerId = sellerResult?._id?.toString();
    console.log(`✅ Demo Seller ready (User ID: ${demoSellerId})`);

    // 2. Upsert Demo Customer User (idempotent by unique email)
    const customerEmail = "customer@zippy.demo";
    const customerResult = await usersCol.findOneAndUpdate(
      { email: customerEmail },
      {
        $set: {
          name: "Demo Customer",
          email: customerEmail,
          image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          role: "customer",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    const demoCustomerId = customerResult?._id?.toString();
    console.log(`✅ Demo Customer ready (User ID: ${demoCustomerId})`);

    // 3. Upsert Demo Delivery Address near the hub for Demo Customer
    const addressResult = await addressesCol.findOneAndUpdate(
      {
        userId: demoCustomerId,
        formattedAddress: DEMO_COORDINATES.formattedAddress,
      },
      {
        $set: {
          userId: demoCustomerId,
          mobile: 9876543210,
          formattedAddress: DEMO_COORDINATES.formattedAddress,
          location: {
            type: "Point",
            coordinates: [
              DEMO_COORDINATES.longitude,
              DEMO_COORDINATES.latitude,
            ],
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`✅ Demo Customer Address ready (ID: ${addressResult?._id})`);

    // 4. Upsert Demo Rider Account
    const riderEmail = "rider@zippy.demo";
    const riderUserResult = await usersCol.findOneAndUpdate(
      { email: riderEmail },
      {
        $set: {
          name: "Zippy Demo Rider",
          email: riderEmail,
          image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          role: "rider",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    const demoRiderUserId = riderUserResult?._id?.toString();

    const riderResult = await ridersCol.findOneAndUpdate(
      { userId: demoRiderUserId },
      {
        $set: {
          userId: demoRiderUserId,
          picture: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          phoneNumber: "9876500001",
          aadharNumber: "123456789012",
          drivingLicenseNumber: "DL-DEMO-2026-SRI",
          isVerified: true,
          isAvailble: true,
          location: {
            type: "Point",
            coordinates: [
              DEMO_COORDINATES.longitude,
              DEMO_COORDINATES.latitude,
            ],
          },
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log(
      `✅ Demo Rider online (ID: ${riderResult?._id}, User: ${demoRiderUserId})`
    );

    // 5. Clean up any stale or orphaned demo restaurants from previous runs
    const activeDemoKeys = DEMO_RESTAURANTS.map((r) => r.demoKey);
    const staleRestaurants = await restaurantsCol
      .find({
        $or: [
          { demoKey: { $in: activeDemoKeys }, ownerId: { $ne: demoSellerId } },
          { ownerId: demoSellerId, demoKey: { $nin: activeDemoKeys } },
        ],
      })
      .toArray();

    if (staleRestaurants.length > 0) {
      const staleIds = staleRestaurants.map((r) => r._id);
      await menuItemsCol.deleteMany({ restaurantId: { $in: staleIds } });
      await restaurantsCol.deleteMany({ _id: { $in: staleIds } });
    }

    // 6. Upsert Demo Restaurants and their Menu Items
    let restaurantCount = 0;
    let menuCount = 0;

    for (const rDef of DEMO_RESTAURANTS) {
      const restResult = await restaurantsCol.findOneAndUpdate(
        {
          demoKey: rDef.demoKey,
        },
        {
          $set: {
            demoKey: rDef.demoKey,
            name: rDef.name,
            description: rDef.description,
            image: rDef.image,
            ownerId: demoSellerId,
            phone: rDef.phone,
            isVerified: true,
            isOpen: true,
            autoLocation: {
              type: "Point",
              coordinates: rDef.coordinates,
              formattedAddress: rDef.formattedAddress,
            },
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      const restaurantId = restResult?._id;
      restaurantCount++;

      for (const itemDef of rDef.items) {
        await menuItemsCol.findOneAndUpdate(
          {
            restaurantId,
            name: itemDef.name,
          },
          {
            $set: {
              restaurantId,
              name: itemDef.name,
              description: itemDef.description,
              price: itemDef.price,
              image: itemDef.image,
              isAvailable: true,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
        menuCount++;
      }
    }

    console.log("\n🎉 Demo data seeded successfully!");
    console.log(`   - Restaurants: ${restaurantCount}`);
    console.log(`   - Menu Items: ${menuCount}`);
    console.log(
      `   - Demo Location: ${DEMO_COORDINATES.city} [lat: ${DEMO_COORDINATES.latitude}, lng: ${DEMO_COORDINATES.longitude}]`
    );
    console.log(`   - Status: Idempotent and ready for recruiter testing.`);
  } catch (err: any) {
    console.error("❌ Seeding failed:", err.message);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

// Run directly when invoked from CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith("seedDemo.js") ||
    process.argv[1].endsWith("seedDemo.ts"))
) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
