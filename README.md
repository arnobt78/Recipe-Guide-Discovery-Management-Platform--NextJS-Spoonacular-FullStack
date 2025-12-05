# Food Recipe Spoonacular Website - React, Node.js, PostgreSQL FullStack Project

![Screenshot 2025-08-29 at 21 29 48](https://github.com/user-attachments/assets/07100269-526c-49d7-9045-36dd3008a1ce)
![Screenshot 2025-08-29 at 21 30 18](https://github.com/user-attachments/assets/4eeeaa08-13cb-4d5a-9759-1097d80bf290)
![Screenshot 2025-08-29 at 21 30 35](https://github.com/user-attachments/assets/958fe32b-4201-4bbf-957d-f577b8ae10f1)

---

A modern, full-stack recipe management application. Search for recipes, view details, and manage favourites with a beautiful React frontend and a robust Node.js/Express backend powered by PostgreSQL and the Spoonacular API.

- **Frontend-Live-Demo:** [https://food-recipe-spoonacular.netlify.app/](https://food-recipe-spoonacular.netlify.app/)
- **Backend-Live-Demo:** [https://recipe-app-glt5.onrender.com](https://recipe-app-glt5.onrender.com)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Features & Functionality](#features--functionality)
- [Environment Variables (.env)](#environment-variables-env)
- [Setup & Usage](#setup--usage)
- [API Endpoints](#api-endpoints-backend)
- [Frontend Walkthrough](#frontend-walkthrough)
- [Backend Walkthrough](#backend-walkthrough)
- [Reusing & Extending](#reusing--extending)
- [Tech Stack & Keywords](#tech-stack--keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Overview

This project is a full-stack web app for discovering and saving recipes. It consists of:

- **Frontend**: React + TypeScript (Vite), modern UI, responsive, easy to extend.
- **Backend**: Node.js + Express + TypeScript, REST API, PostgreSQL (via Prisma), integrates with Spoonacular API.

Users can search for recipes, view summaries, and manage their favourites. The app is modular, well-documented, and ready for learning or extension.

---

## Project Structure

```bash
recipe-app/
├── recipe-app-backend/    # Backend (Node.js, Express, Prisma, PostgreSQL)
│   ├── .env
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts
│       └── recipe-api.ts
├── recipe-app-frontend/   # Frontend (React, Vite, TypeScript)
│   ├── .env
│   ├── package.json
│   ├── public/
│   │   ├── hero-image.webp
│   │   └── vite.svg
│   └── src/
│       ├── App.tsx
│       ├── App.css
│       ├── api.ts
│       ├── main.tsx
│       ├── types.ts
│       └── components/
│           ├── RecipeCard.tsx
│           └── RecipeModal.tsx
└── README.md              # (You are here)
```

---

## Features & Functionality

- **Recipe Search**: Search recipes by keyword (Spoonacular API)
- **Recipe Details**: View recipe summary in a modal
- **Favourites**: Add/remove recipes to your favourites, view in a separate tab
- **Responsive UI**: Works on desktop and mobile
- **TypeScript**: Type safety throughout
- **API Integration**: Connects frontend and backend seamlessly
- **Modular Code**: Easy to extend and reuse

---

## Environment Variables (.env)

### Backend (`recipe-app-backend/.env`)

```env
API_KEY=your_spoonacular_api_key
DATABASE_URL=your_postgresql_connection_string
```

- **API_KEY**: Get from [Spoonacular](https://spoonacular.com/food-api)
- **DATABASE_URL**: Get from your PostgreSQL provider (Render, Supabase, Neon, Railway, etc.)

### Frontend (`recipe-app-frontend/.env`)

```env
VITE_API_URL=http://localhost:5005
```

- **VITE_API_URL**: The base URL for your backend API. Use your deployed backend URL in production.

---

## Setup & Usage

### 1. Backend

```bash
cd recipe-app-backend
npm install
# Configure .env as above
npx prisma migrate dev --name init
npm start
```

API will be available at: `http://localhost:5005/api/recipes/...`

### 2. Frontend

```bash
cd recipe-app-frontend
npm install
# Configure .env as above
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints (Backend)

- `GET /api/recipes/search?searchTerm=<term>&page=<page>` — Search recipes
- `GET /api/recipes/:recipeId/summary` — Get recipe summary
- `POST /api/recipes/favourite` — Add favourite `{ "recipeId": 12345 }`
- `GET /api/recipes/favourite` — List favourites
- `DELETE /api/recipes/favourite` — Remove favourite `{ "recipeId": 12345 }`

---

## Frontend Walkthrough

### Main App (`App.tsx`)

- Manages state, tabs, search, favourites, and modal.
- Handles API calls via `api.ts`.

#### Example: Search Recipes

```tsx
const handleSearchSubmit = async (event: FormEvent) => {
  event.preventDefault();
  setApiError("");
  try {
    const response = await api.searchRecipes(searchTerm, 1);
    if (response.status === "failure" || response.code === 402) {
      setApiError(response.message || "API quota reached.");
      setRecipes([]);
    } else {
      setRecipes(Array.isArray(response.results) ? response.results : []);
      pageNumber.current = 1;
    }
  } catch (e) {
    setRecipes([]);
  }
};
```

### API Integration (`api.ts`)

- Handles all API requests to the backend.

#### Example: Add Favourite Recipe

```typescript
export const addFavouriteRecipe = async (recipe: Recipe) => {
  const url = new URL("/api/recipes/favourite", API_URL);
  const body = { recipeId: recipe.id };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
};
```

### Components

- **RecipeCard**: Displays a recipe card with image, title, and favourite button.
- **RecipeModal**: Shows a modal with the recipe summary and title.

#### Example: Using RecipeCard

```tsx
<RecipeCard
  key={recipe.id}
  recipe={recipe}
  onClick={() => setSelectedRecipe(recipe)}
  onFavouriteButtonClick={
    isFavourite ? removeFavouriteRecipe : addFavouriteRecipe
  }
  isFavourite={isFavourite}
/>
```

---

## Backend Walkthrough

### Main Server (`src/index.ts`)

- Sets up Express, CORS, and JSON parsing.
- Defines all API routes for search, summary, and favourites.

### Spoonacular Integration (`src/recipe-api.ts`)

- Handles all external API requests.
- Functions: `searchRecipes`, `getRecipeSummary`, `getFavouriteRecipesByIDs`.

### Prisma Schema (`prisma/schema.prisma`)

```prisma
model FavouriteRecipes {
  id       Int @id @default(autoincrement())
  recipeId Int @unique
}
```

---

## Reusing & Extending

- **Frontend**: Components and API functions are modular and reusable. Add new features by following the existing structure.
- **Backend**: Add new endpoints or models in a RESTful, modular way. Use Prisma for DB migrations.

### Example: Add a New API Call (Frontend)

```typescript
export const getRecipeInstructions = async (recipeId: string) => {
  const url = new URL(`/api/recipes/${recipeId}/instructions`, API_URL);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch instructions");
  return response.json();
};
```

### Example: Add a New Endpoint (Backend)

```ts
app.get("/api/recipes/:id/instructions", async (req, res) => {
  // Call Spoonacular for instructions
});
```

---

## Tech Stack & Keywords

- **React**
- **TypeScript**
- **Vite**
- **Node.js**
- **Express**
- **Prisma**
- **PostgreSQL**
- **Spoonacular API**
- **REST API**
- **Modular Components**
- **Hooks**
- **Responsive Design**
- **API Integration**
- **Reusable UI**

---

## Conclusion

This project is a modern, extensible, and user-friendly full-stack recipe app. It demonstrates best practices in React, TypeScript, API integration, backend design, and UI/UX. Use it as a learning resource, a starter for your own projects, or as a foundation for your next app.

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
