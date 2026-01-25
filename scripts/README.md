# Scripts

This folder contains utility scripts for database management and maintenance.

## Available Scripts

### `delete-all-users.ts`

Deletes all users from the database and their associated data (cascade delete).

**⚠️ WARNING:** This script will permanently delete:

- All users
- All recipe collections
- All recipe notes
- All favourite recipes
- All meal plans
- All shopping lists
- All recipe images
- All filter presets
- All recipe videos

**Usage:**

```bash
# Using npm script (recommended)
npm run scripts:delete-users

# Or directly with tsx
npx tsx scripts/delete-all-users.ts
```

**What it does:**

1. Counts existing users in the database
2. Deletes all users (cascade deletes related data automatically)
3. Verifies deletion was successful
4. Displays summary of deleted data

**Example output:**

```bash
🔄 Starting deletion of all users...
📊 Found 5 users in the database
✅ Successfully deleted 5 user(s) and all associated data
📝 Associated data deleted (cascade):
   - Recipe Collections
   - Recipe Notes
   - Favourite Recipes
   - Meal Plans
   - Shopping Lists
   - Recipe Images
   - Filter Presets
   - Recipe Videos
✅ Verification: All users have been deleted successfully
✨ Script completed successfully
```

**Note:** Make sure your `.env.local` file has the correct `DATABASE_URL` configured before running this script.
