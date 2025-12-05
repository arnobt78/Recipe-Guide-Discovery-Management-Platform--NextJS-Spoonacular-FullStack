import { useEffect, useState } from "react";
import { RecipeSummary } from "../types";
import * as RecipeAPI from "../api";

interface Props {
  recipeId: string;
  onClose: () => void;
}

const RecipeModal = ({ recipeId, onClose }: Props) => {
  const [recipeSummary, setRecipeSummary] = useState<RecipeSummary>();

  useEffect(() => {
    const fetchRecipeSummary = async () => {
      try {
        const summaryRecipe = await RecipeAPI.getRecipeSummary(recipeId);
        setRecipeSummary(summaryRecipe);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRecipeSummary();
  }, [recipeId]);
  if (!recipeSummary) {
    return <></>;
  }

  // Capitalize each word in the title
  const capitalizeTitle = (title: string | undefined) =>
    title ? title.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

  // Ensure all links open in a new tab and do not close the modal
  const summaryWithTargetBlank = recipeSummary.summary
    ? recipeSummary.summary.replace(
        /<a /g,
        '<a target="_blank" rel="noopener noreferrer" '
      )
    : "";

  return (
    <>
      <div className="overlay"></div>
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">
              {capitalizeTitle(recipeSummary.title)}
            </h2>
            <span className="close-btn" onClick={onClose}>
              &times;
            </span>
          </div>
          <div
            className="modal-summary"
            dangerouslySetInnerHTML={{ __html: summaryWithTargetBlank }}
          ></div>
          <div
            style={{
              marginTop: "2em",
              textAlign: "center",
              color: "#888",
              fontSize: "1em",
            }}
          >
            <span role="img" aria-label="info">
              ℹ️
            </span>{" "}
            Click links to view full recipes. Scroll for more info.
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeModal;
