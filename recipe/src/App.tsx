import "./App.css";
import { FormEvent, useEffect, useRef, useState } from "react";
import * as api from "./api";
import { Recipe } from "./types";
import RecipeCard from "./components/RecipeCard";
import RecipeModal from "./components/RecipeModal";
import { AiOutlineSearch } from "react-icons/ai";

type Tabs = "search" | "favourites";

const App = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [apiError, setApiError] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(
    undefined
  );
  const [selectedTab, setSelectedTab] = useState<Tabs>("search");
  const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
  const pageNumber = useRef(1);

  useEffect(() => {
    const fetchFavouriteRecipes = async () => {
      try {
        const favouriteRecipes = await api.getFavouriteRecipes();
        setFavouriteRecipes(
          Array.isArray(favouriteRecipes.results)
            ? favouriteRecipes.results
            : []
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchFavouriteRecipes();
  }, []);

  const handleSearchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError("");
    try {
      const response = await api.searchRecipes(searchTerm, 1);
      if (response.status === "failure" || response.code === 402) {
        setApiError(
          response.message ||
            "Your daily points limit of 50 has been reached. Please upgrade your plan to continue using the API. Otherwise, come back later and test this demo project."
        );
        setRecipes([]);
      } else {
        setRecipes(Array.isArray(response.results) ? response.results : []);
        pageNumber.current = 1;
      }
    } catch (e) {
      console.log(e);
      setRecipes([]); // fallback to empty array on error
    }
  };

  const handleViewMoreClick = async () => {
    setApiError("");
    const nextPage = pageNumber.current + 1;
    const term = searchTerm || getRandomKeyword();
    try {
      const response = await api.searchRecipes(term, nextPage);
      if (response.status === "failure" || response.code === 402) {
        setApiError(
          response.message ||
            "Your daily points limit of 50 has been reached. Please upgrade your plan to continue using the API. Otherwise, come back later and test this demo project."
        );
      } else if (Array.isArray(response.results)) {
        setRecipes([...recipes, ...response.results]);
        pageNumber.current = nextPage;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Helper for random keywords
  function getRandomKeyword() {
    const keywords = [
      "pizza",
      "pasta",
      "chicken",
      "salad",
      "soup",
      "beef",
      "fish",
      "rice",
      "cake",
      "burger",
      "egg",
    ];
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  const addFavouriteRecipe = async (recipe: Recipe) => {
    try {
      await api.addFavouriteRecipe(recipe);
      setFavouriteRecipes([...favouriteRecipes, recipe]);
    } catch (error) {
      console.log(error);
    }
  };

  const removeFavouriteRecipe = async (recipe: Recipe) => {
    try {
      await api.removeFavouriteRecipe(recipe);
      const updatedRecipes = favouriteRecipes.filter(
        (favRecipe) => recipe.id !== favRecipe.id
      );
      setFavouriteRecipes(updatedRecipes);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <img src="/hero-image.webp"></img>
        <div className="title">My Recipe App</div>
      </div>
      <div className="tabs">
        <h1
          className={selectedTab === "search" ? "tab-active" : ""}
          onClick={() => setSelectedTab("search")}
        >
          Recipe Search
        </h1>
        <h1
          className={selectedTab === "favourites" ? "tab-active" : ""}
          onClick={() => setSelectedTab("favourites")}
        >
          Favourites
        </h1>
      </div>

      {selectedTab === "search" && (
        <>
          <form onSubmit={(event) => handleSearchSubmit(event)}>
            <input
              type="text"
              required
              placeholder="Type any recipe name ..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            ></input>
            <button type="submit">
              <AiOutlineSearch size={40} />
            </button>
          </form>

          {apiError && (
            <div
              style={{
                color: "#e74c3c",
                fontWeight: 500,
                textAlign: "center",
                margin: "0 0",
              }}
            >
              {apiError}
            </div>
          )}
          <div className="recipe-grid">
            {recipes.map((recipe) => {
              const isFavourite = favouriteRecipes.some(
                (favRecipe) => recipe.id === favRecipe.id
              );

              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                  onFavouriteButtonClick={
                    isFavourite ? removeFavouriteRecipe : addFavouriteRecipe
                  }
                  isFavourite={isFavourite}
                />
              );
            })}
          </div>

          <button className="view-more-button" onClick={handleViewMoreClick}>
            View More
          </button>
        </>
      )}

      {selectedTab === "favourites" && (
        <div className="recipe-grid">
          {favouriteRecipes.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                fontSize: "1.3em",
                color: "#888",
                marginTop: "2em",
              }}
            >
              No favourite recipes yet. Add some from the search tab!
            </div>
          ) : (
            favouriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                onFavouriteButtonClick={removeFavouriteRecipe}
                isFavourite={true}
              />
            ))
          )}
        </div>
      )}

      {selectedRecipe ? (
        <RecipeModal
          recipeId={selectedRecipe.id.toString()}
          onClose={() => setSelectedRecipe(undefined)}
        />
      ) : null}
    </div>
  );
};

export default App;
