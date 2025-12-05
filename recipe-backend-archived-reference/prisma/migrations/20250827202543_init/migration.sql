-- CreateTable
CREATE TABLE "FavouriteRecipes" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "FavouriteRecipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteRecipes_recipeId_key" ON "FavouriteRecipes"("recipeId");
