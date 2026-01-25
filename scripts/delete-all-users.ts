/**
 * Script to delete all users from the database
 * 
 * WARNING: This will permanently delete ALL users and their associated data
 * (collections, notes, favourites, meal plans, shopping lists, etc.)
 * 
 * Usage:
 *   npx tsx scripts/delete-all-users.ts
 * 
 * Or with ts-node:
 *   ts-node scripts/delete-all-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log("🔄 Starting deletion of all users...");

    // Count users before deletion
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in the database`);

    if (userCount === 0) {
      console.log("✅ No users to delete. Database is already empty.");
      return;
    }

    // Delete all users (cascade will delete related data)
    // Prisma will automatically handle cascading deletes based on schema relations
    const result = await prisma.user.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} user(s) and all associated data`);
    console.log("📝 Associated data deleted (cascade):");
    console.log("   - Recipe Collections");
    console.log("   - Recipe Notes");
    console.log("   - Favourite Recipes");
    console.log("   - Meal Plans");
    console.log("   - Shopping Lists");
    console.log("   - Recipe Images");
    console.log("   - Filter Presets");
    console.log("   - Recipe Videos");

    // Verify deletion
    const remainingUsers = await prisma.user.count();
    if (remainingUsers === 0) {
      console.log("✅ Verification: All users have been deleted successfully");
    } else {
      console.warn(`⚠️  Warning: ${remainingUsers} user(s) still remain in the database`);
    }
  } catch (error) {
    console.error("❌ Error deleting users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllUsers()
  .then(() => {
    console.log("✨ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
