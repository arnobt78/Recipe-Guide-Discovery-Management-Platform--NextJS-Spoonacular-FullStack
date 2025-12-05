# Food Recipe Spoonacular Backend - React, Express.js PostgreSQL FullStack Project

---

A robust Node.js backend for a full-stack recipe management application. This backend provides RESTful API endpoints for searching recipes, viewing summaries, and managing user favourites, powered by Express, Prisma, PostgreSQL, and the Spoonacular API.

- **Frontend-Live-Demo:** [https://food-recipe-spoonacular.netlify.app/](https://food-recipe-spoonacular.netlify.app/)
- **Backend-Live-Demo:** [https://recipe-app-glt5.onrender.com](https://recipe-app-glt5.onrender.com)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Features & Functionality](#features--functionality)
- [API Endpoints](#api-endpoints)
- [Environment Variables (.env)](#environment-variables-env)
- [Setup & Usage](#setup--usage)
- [Code Walkthrough](#code-walkthrough)
- [Reusing Components & Extending](#reusing-components--extending)
- [Tech Stack & Keywords](#tech-stack--keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Overview

This backend serves as the API and data layer for a recipe app. It allows users to:

- Search for recipes using the Spoonacular API.
- View detailed recipe summaries.
- Save and manage favourite recipes in a PostgreSQL database.
- Integrate seamlessly with a React frontend.

---

## Project Structure

```bash
recipe-app-backend/
├── .env
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts         # Main Express server and API routes
│   └── recipe-api.ts    # Spoonacular API integration
└── ...
```

---

## Features & Functionality

- **Express REST API**: Clean, modular endpoints for all recipe and favourite actions.
- **Prisma ORM**: Type-safe database access and migrations.
- **Spoonacular API Integration**: Fetches real recipe data and summaries.
- **Favourites Management**: Add, list, and remove favourite recipes per user.
- **Environment-based Configuration**: Secure API keys and DB credentials.
- **CORS Support**: Ready for frontend integration.

---

## API Endpoints

### Search Recipes

`GET /api/recipes/search?searchTerm=<term>&page=<page>`

- **Description**: Search for recipes by keyword.
- **Query Params**:
  - `searchTerm` (string): The search keyword.
  - `page` (number): Page number for pagination.
- **Returns**: `{ results: [ ...recipes ] }`

### Get Recipe Summary

`GET /api/recipes/:recipeId/summary`

- **Description**: Get a summary for a specific recipe.
- **Params**:
  - `recipeId` (string): The Spoonacular recipe ID.
- **Returns**: `{ id, title, summary }`

### Add Favourite

`POST /api/recipes/favourite`

- **Description**: Add a recipe to favourites.
- **Body**:

  ```json
  { "recipeId": 12345 }
  ```

- **Returns**: The created favourite record.

### List Favourites

`GET /api/recipes/favourite`

- **Description**: List all favourite recipes.
- **Returns**: `{ results: [ ...recipes ] }`

### Remove Favourite

`DELETE /api/recipes/favourite`

- **Description**: Remove a recipe from favourites.
- **Body**:

  ```json
  { "recipeId": 12345 }
  ```

- **Returns**: `204 No Content` on success.

---

## Environment Variables (.env)

Create a `.env` file in the backend root with:

```env
# Spoonacular API key (get from https://spoonacular.com/food-api)
API_KEY=your_spoonacular_api_key

# PostgreSQL connection string (Render, Supabase, etc.)
DATABASE_URL=your_postgresql_connection_string
```

- **API_KEY**: Sign up at [Spoonacular](https://spoonacular.com/food-api) and get your free API key.
- **DATABASE_URL**: Use a PostgreSQL provider (Render, Supabase, Neon, Railway, ElephantSQL, etc.) and copy the connection string.

---

## Setup & Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   - Copy `.env.example` to `.env` and fill in your keys.

3. **Run database migrations:**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the backend server:**

   ```bash
   npm start
   ```

5. **API will be available at:**  
   `http://localhost:5005/api/recipes/...`

---

## Code Walkthrough

### Main Server (`src/index.ts`)

- Sets up Express, CORS, and JSON parsing.
- Defines all API routes for search, summary, and favourites.
- Uses Prisma for DB actions and `recipe-api.ts` for Spoonacular calls.

### Spoonacular Integration (`src/recipe-api.ts`)

- Handles all external API requests.
- Functions: `searchRecipes`, `getRecipeSummary`, `getFavouriteRecipesByIDs`.
- Uses the API key from `.env`.

### Prisma Schema (`prisma/schema.prisma`)

```prisma
model FavouriteRecipes {
  id       Int @id @default(autoincrement())
  recipeId Int @unique
}
```

- Stores user favourite recipes by their Spoonacular ID.

---

## Reusing Components & Extending

- **API Endpoints**: Modular and RESTful—easy to add new endpoints (e.g., user auth, comments).
- **Prisma Models**: Add new models in `schema.prisma` and run `npx prisma migrate dev`.
- **Spoonacular Integration**: Add more endpoints in `recipe-api.ts` for nutrition, instructions, etc.
- **Frontend Integration**: Connect any frontend (React, Vue, etc.) via the documented API.

### Example: Add a new endpoint

```ts
app.get("/api/recipes/:id/instructions", async (req, res) => {
  // Call Spoonacular for instructions
});
```

---

## Tech Stack & Keywords

- **Node.js**
- **Express**
- **Prisma**
- **PostgreSQL**
- **Spoonacular API**
- **REST API**
- **TypeScript**
- **CORS**
- **Environment Variables**
- **Modular Code**
- **API Integration**
- **Backend for Frontend**

---

## Conclusion

This backend is a modern, extensible foundation for any recipe or food-related app. It demonstrates best practices in API design, database management, and third-party integration. Use it as a learning resource, a starter for your own projects, or as a backend for your frontend apps.

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
