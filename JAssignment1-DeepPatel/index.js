//Loads the express module
const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 4000;
const DB_URL = "mongodb+srv://deep:deep@recipe.u2nfw4m.mongodb.net/";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serves static files (we need it to import a css file)
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// SET UP FOR EASIER FORM DATA PARSING
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// connect to the database url
const client = new MongoClient(DB_URL);

//Render the home page
app.get("/", (_, res) => {
  res.render("index");
});

app.get("/recipes", async (_, res) => {
  const recipes = await getAllRecipe();
  res.render("recipes", { recipeList: recipes });
});

app.get("/add-recipe", async (_, res) => {
  res.render("add-recipe");
});

app.post("/submit-recipe", async (req, res) => {
  const recipeName = req.body.name;
  const recipeDescription = req.body.description;
  const recipeTakesTime = req.body.takesTime;

  const recipeData = {
    name: recipeName,
    description: recipeDescription,
    takesTime: recipeTakesTime,
    isFavorite: false,
  }

  await addRecipe(recipeData);

  res.redirect("/recipes");
});

app.post("/delete-recipe", async (req, res) => {
  const recipe = await getRecipe(req.body.recipeId);
  res.render('delete-recipe', { recipeData: recipe })
})

app.post('/delete-recipe-submit', async (req, res) => {
  const _id = { _id: new ObjectId(req.body.recipeId) };
  await deleteRecipe(_id);
  res.redirect("/recipes");
})

app.post('/mark-favorite', async (req, res) => {
  const _id = { _id: new ObjectId(req.body.recipeId) };
  const updateRecipeData = {
    isFavorite: true,
  }
  await updateRecipe(_id, updateRecipeData);
  res.redirect("/recipes");
})

app.post('/remove-favorite', async (req, res) => {
  const _id = { _id: new ObjectId(req.body.recipeId) };
  const updateRecipeData = {
    isFavorite: false,
  }
  await updateRecipe(_id, updateRecipeData);
  res.redirect("/recipes");
})

app.listen(port, () =>
  console.log(`App listening to http://localhost:${port}`)
);

async function connection() {
  db = client.db("recipe_management");
  return db;
}

async function getAllRecipe() {
  db = await connection();
  let results = db.collection("recipe").find({});
  let res = await results.toArray();
  return res;
}

async function getRecipe(id) {
  db = await connection();
  const recipeId = { _id: new ObjectId(id) };
  const result = await db.collection("recipe").findOne(recipeId);
  return result;
}

async function addRecipe(recipeData) {
  db = await connection();
  await db.collection("recipe").insertOne(recipeData);
}

async function deleteRecipe(id) {
  db = await connection();
  await db.collection("recipe").deleteOne(id);
}

async function updateRecipe(id, data) {
  db = await connection();
  await db.collection("recipe").updateOne(id, { $set: data });
}
