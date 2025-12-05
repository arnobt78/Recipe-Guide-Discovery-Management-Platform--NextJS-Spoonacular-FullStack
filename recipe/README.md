# Food Recipe Spoonacular Frontend - React, Express.js PostgreSQL FullStack Project

A modern React + TypeScript frontend for a full-stack recipe management application. This UI lets users search for recipes, view details, and manage favourites, with a beautiful, responsive design and seamless backend integration.

- **Frontend-Live-Demo:** [https://food-recipe-spoonacular.netlify.app/](https://food-recipe-spoonacular.netlify.app/)
- **Backend-Live-Demo:** [https://recipe-app-glt5.onrender.com](https://recipe-app-glt5.onrender.com)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Features & Functionality](#features--functionality)
- [Environment Variables (.env)](#environment-variables-env)
- [Setup & Usage](#setup--usage)
- [Code Walkthrough](#code-walkthrough)
  - [App.tsx](#apptsx)
  - [api.ts](#apits)
  - [RecipeCard.tsx](#recipecardtsx)
  - [RecipeModal.tsx](#recipemodaltsx)
  - [types.ts](#typests)
  - [App.css](#appcss)
- [Reusing Components & Extending](#reusing-components--extending)
- [Tech Stack & Keywords](#tech-stack--keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Overview

This frontend is the user interface for the Recipe App. It allows users to:

- Search for recipes using keywords
- View recipe summaries in a modal
- Add or remove favourite recipes
- Switch between search and favourites tabs
- Enjoy a responsive, modern UI

---

## Project Structure

```bash
recipe-app-frontend/
├── public/
│   ├── hero-image.webp
│   └── vite.svg
├── src/
│   ├── App.tsx           # Main app logic and UI
│   ├── App.css           # Styles
│   ├── api.ts            # API integration
│   ├── main.tsx          # Entry point
│   ├── types.ts          # TypeScript types
│   └── components/
│       ├── RecipeCard.tsx   # Recipe card component
│       └── RecipeModal.tsx  # Modal for recipe summary
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Features & Functionality

- **Recipe Search**: Search recipes by keyword, paginated results
- **Recipe Details**: View recipe summary in a modal with clickable links
- **Favourites**: Add/remove recipes to your favourites, view in a separate tab
- **Responsive UI**: Works on desktop and mobile
- **Modern UX**: Animated modal, hover effects, empty state messages
- **TypeScript**: Type safety throughout
- **API Integration**: Connects to backend REST API

---

## Environment Variables (.env)

Create a `.env` file in the frontend root with:

```env
# Backend API base URL (e.g., http://localhost:5005 or your deployed backend)
VITE_API_URL=http://localhost:5005
```

- **VITE_API_URL**: The base URL for your backend API. If running locally, use `http://localhost:5005`. For production, use your deployed backend URL.

---

## Setup & Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   - Create a `.env` file as shown above.

3. **Start the frontend app:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (default Vite port)

---

## Code Walkthrough

### App.tsx

- Main app logic: manages state, tabs, search, favourites, and modal.
- Uses hooks (`useState`, `useEffect`, `useRef`) for state and lifecycle.
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

---

### api.ts

- Handles all API requests to the backend.
- Uses `fetch` and the `VITE_API_URL` environment variable.

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

---

### RecipeCard.tsx

- Displays a recipe card with image, title, and favourite button.
- Handles click events for viewing details and toggling favourites.

#### Example: Using RecipeCard in App.tsx

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

### RecipeModal.tsx

- Shows a modal with the recipe summary and title.
- Fetches summary from backend on open.
- Ensures links open in a new tab.

#### Example: Usage in App.tsx

```tsx
{
  selectedRecipe ? (
    <RecipeModal
      recipeId={selectedRecipe.id.toString()}
      onClose={() => setSelectedRecipe(undefined)}
    />
  ) : null;
}
```

---

### types.ts

- TypeScript interfaces for recipe data.

**Example:**

```typescript
export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
}
```

---

### App.css

- Styles for layout, modal, cards, buttons, and responsive design.
- Uses CSS grid for recipe layout and media queries for responsiveness.

#### Example: Modal Styles

```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  max-height: 90vh;
  width: 90vw;
  max-width: 600px;
  overflow-y: auto;
  border-radius: 16px;
  background: #fff;
}
```

---

## Reusing Components & Extending

- **RecipeCard**: Use in any recipe grid/list. Pass `recipe`, `onClick`, `onFavouriteButtonClick`, and `isFavourite` props.
- **RecipeModal**: Use for any modal summary/details. Pass `recipeId` and `onClose`.
- **api.ts**: Import and use API functions in any React component.
- **Types**: Import from `types.ts` for type safety in new components.
- **Easy Extension**: Add new tabs, features, or endpoints by following the modular structure.

### Example: Add a New API Call

```typescript
export const getRecipeInstructions = async (recipeId: string) => {
  const url = new URL(`/api/recipes/${recipeId}/instructions`, API_URL);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch instructions");
  return response.json();
};
```

---

## Tech Stack & Keywords

- **React**
- **TypeScript**
- **Vite**
- **REST API**
- **Modular Components**
- **Hooks**
- **Responsive Design**
- **CSS Grid**
- **Frontend for Backend**
- **API Integration**
- **Reusable UI**

---

## Conclusion

This frontend is a modern, extensible, and user-friendly interface for recipe discovery and management. It demonstrates best practices in React, TypeScript, API integration, and UI/UX design. Use it as a learning resource, a starter for your own projects, or as a frontend for your backend APIs.

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
