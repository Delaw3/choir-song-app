import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "crypto";

const uri = process.env.MONGODB_URI || "mongodb+srv://lauphix1_db_user:Ebussco5567@choir.i97r9sf.mongodb.net/";
const dbName = process.env.MONGODB_DB_NAME || "choir-song";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const membersToSeed = [
  {
    displayName: "Amara Okafor",
    email: "member@choir.app",
    creditBalance: 84,
    role: "member",
    status: "active",
    emailVerified: true,
    createdAt: new Date("2026-01-12"),
  },
  {
    displayName: "David Mensah",
    email: "david.mensah@example.com",
    creditBalance: 26,
    role: "member",
    status: "active",
    emailVerified: true,
    createdAt: new Date("2026-02-03"),
  },
  {
    displayName: "Chioma Adeleke",
    email: "chioma.adeleke@example.com",
    creditBalance: 142,
    role: "member",
    status: "active",
    emailVerified: true,
    createdAt: new Date("2026-03-18"),
  },
  {
    displayName: "Samuel King",
    email: "samuel.king@example.com",
    creditBalance: 9,
    role: "member",
    status: "active",
    emailVerified: true,
    createdAt: new Date("2026-04-24"),
  },
];

async function seedMembers() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(dbName);
    const usersCol = db.collection("users");

    await usersCol.createIndex({ email: 1 }, { unique: true });

    const now = new Date();
    const commonPasswordHash = hashPassword("Choir123!");

    for (const m of membersToSeed) {
      const result = await usersCol.updateOne(
        { email: m.email },
        {
          $set: {
            displayName: m.displayName,
            email: m.email,
            passwordHash: commonPasswordHash,
            creditBalance: m.creditBalance,
            role: m.role,
            status: m.status,
            emailVerified: m.emailVerified,
            updatedAt: now,
          },
          $unset: { password: "" },
          $setOnInsert: { createdAt: m.createdAt },
        },
        { upsert: true }
      );

      console.log(
        `Member "${m.displayName}" (${m.email}):`,
        result.upsertedId ? `Inserted id ${result.upsertedId}` : "Updated existing"
      );
    }

    const allMembers = await usersCol.find({ role: "member" }).sort({ createdAt: -1 }).toArray();
    console.log(`\nTotal members in DB: ${allMembers.length}`);
    console.dir(
      allMembers.map((u) => ({
        id: u._id.toString(),
        name: u.displayName,
        email: u.email,
        creditBalance: u.creditBalance,
        joinedAt: u.createdAt.toISOString().slice(0, 10),
      })),
      { depth: null }
    );
  } catch (err) {
    console.error("Error seeding members:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed.");
  }
}

seedMembers();
