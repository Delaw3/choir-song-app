import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://lauphix1_db_user:Ebussco5567@choir.i97r9sf.mongodb.net/";
const dbName = process.env.MONGODB_DB_NAME || "choir-song";

const categoriesToSeed = [
  {
    name: "Mass",
    slug: "mass",
    description: "Liturgical music for the Holy Mass",
    subCategories: [
      "Entrance",
      "Kyrie",
      "Gloria",
      "Credo",
      "Offertory",
      "Sanctus",
      "Agnus Dei",
      "Communion Rite",
    ],
    sortOrder: 0,
    status: "active",
  },
  {
    name: "Communion",
    slug: "communion",
    description: "Songs for Holy Communion",
    subCategories: [],
    sortOrder: 1,
    status: "active",
  },
  {
    name: "Anthems",
    slug: "anthems",
    description: "Choral anthems and sacred pieces",
    subCategories: [],
    sortOrder: 2,
    status: "active",
  },
  {
    name: "Christmas",
    slug: "christmas",
    description: "Hymns and carols for the Christmas season",
    subCategories: [],
    sortOrder: 3,
    status: "active",
  },
  {
    name: "Non Liturgical",
    slug: "non-liturgical",
    description: "Classical, spiritual, and concert repertoire",
    subCategories: [],
    sortOrder: 4,
    status: "active",
  },
];

async function seedCategories() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(dbName);
    const col = db.collection("songCategories");

    // Ensure unique index on slug
    await col.createIndex({ slug: 1 }, { unique: true });

    const now = new Date();

    for (const cat of categoriesToSeed) {
      const result = await col.updateOne(
        { slug: cat.slug },
        {
          $set: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            subCategories: cat.subCategories,
            sortOrder: cat.sortOrder,
            status: cat.status,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );

      console.log(
        `Category "${cat.name}" (${cat.slug}):`,
        result.upsertedId ? `Inserted id ${result.upsertedId}` : "Updated existing"
      );
    }

    const allCategories = await col.find({}).sort({ sortOrder: 1 }).toArray();
    console.log("\nCurrent categories in database:");
    console.dir(
      allCategories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        subCategoriesCount: c.subCategories?.length ?? 0,
        subCategories: c.subCategories,
        status: c.status,
      })),
      { depth: null }
    );
  } catch (err) {
    console.error("Error seeding categories:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed.");
  }
}

seedCategories();
