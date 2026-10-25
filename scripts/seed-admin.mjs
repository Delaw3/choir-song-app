import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "crypto";

const uri = process.env.MONGODB_URI || "mongodb+srv://lauphix1_db_user:Ebussco5567@choir.i97r9sf.mongodb.net/";
const dbName = process.env.MONGODB_DB_NAME || "choir-song";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seedAdmin() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(dbName);
    const usersCol = db.collection("users");

    // Ensure unique index on email
    await usersCol.createIndex({ email: 1 }, { unique: true });

    const now = new Date();

    const adminDoc = {
      displayName: "Choir Admin",
      email: "admin@choir.app",
      passwordHash: hashPassword("Choir123!"),
      role: "admin",
      creditBalance: 1000,
      status: "active",
      emailVerified: true,
      updatedAt: now,
    };

    const memberDoc = {
      displayName: "Amara Okafor",
      email: "member@choir.app",
      passwordHash: hashPassword("Choir123!"),
      role: "member",
      creditBalance: 84,
      status: "active",
      emailVerified: true,
      updatedAt: now,
    };

    // Upsert admin - strictly remove any plain-text password field
    const adminResult = await usersCol.updateOne(
      { email: adminDoc.email },
      {
        $set: adminDoc,
        $unset: { password: "" },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log(
      "Admin user upserted:",
      adminResult.upsertedId ? `Inserted id ${adminResult.upsertedId}` : "Updated existing record (plain-text password removed)"
    );

    // Upsert member - strictly remove any plain-text password field
    const memberResult = await usersCol.updateOne(
      { email: memberDoc.email },
      {
        $set: memberDoc,
        $unset: { password: "" },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log(
      "Member user upserted:",
      memberResult.upsertedId ? `Inserted id ${memberResult.upsertedId}` : "Updated existing record (plain-text password removed)"
    );

    // Also sanitize any other user records in the DB if plain text password exists
    const sanitizeResult = await usersCol.updateMany(
      { password: { $exists: true } },
      { $unset: { password: "" } }
    );
    if (sanitizeResult.modifiedCount > 0) {
      console.log(`Sanitized ${sanitizeResult.modifiedCount} additional user records to remove plain-text passwords.`);
    }

    // Print current users in DB
    const allUsers = await usersCol.find({}).toArray();
    console.log("\nVerified users in database (passwords are strictly hashed):");
    console.dir(
      allUsers.map((u) => ({
        id: u._id.toString(),
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        hasPasswordHash: Boolean(u.passwordHash),
        hasPlainTextPassword: Boolean(u.password),
        status: u.status,
      })),
      { depth: null }
    );
  } catch (err) {
    console.error("Error seeding users:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed.");
  }
}

seedAdmin();
