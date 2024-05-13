
// holder de søgte fødevarer
let foodDictionary = {}

// holder det måltid der bliver lavet eller redigeret
let currentMeal = null;

// Top level funktioner kan ikke kalde asynkrone funktioner direkte
(async () => {
    await renderExistingMeals();
})();

// nyt måltid udfra meal klassen i models.js
function createNewMeal(name) {
    currentMeal = new Meal(name);
    renderMeal(currentMeal);
}

// indsætter måltidet i DOM'en
function renderMeal(meal) {
    clearInnerHTML("currentMealBody")
    clearInnerHTML("currentMealName")

    if(meal === undefined) {
        return
    }

    let result = "";
    
    // Løber igennem alle fødevarerne der er med i måltidet
    for (let i = 0; i < meal.Foods.length; i++) {
        // indsætter de faktiske værdier i templaten
        let foodResult = mealFoodTemplate.replaceAll("#foodName#", meal.Foods[i].Name)
        foodResult = foodResult.replaceAll("#id#", meal.Foods[i].FoodID)
        foodResult = foodResult.replaceAll("#weight#", meal.Foods[i].WeightInGrams)
        foodResult = foodResult.replaceAll("#kj#", meal.Foods[i].CaloriesKj)
        foodResult = foodResult.replaceAll("#kcal#", meal.Foods[i].CaloriesKcal)
        foodResult = foodResult.replaceAll("#protein#", meal.Foods[i].Protein)
        foodResult = foodResult.replaceAll("#fiber#", meal.Foods[i].Fiber)
        foodResult = foodResult.replaceAll("#fat#", meal.Foods[i].Fat)
        foodResult = foodResult.replaceAll("#carb#", meal.Foods[i].Carbohydrates)

        result += foodResult
    }

    // Indsæt i DOM'en
    insertAfter("currentMealName", meal.Name);
    insertAfter("currentMealBody", result);
}

// henter eksisterende måltider
async function renderExistingMeals() {

    // henter alle måltider fra backenden
    const allMeals = await getMeals();

    // holder resultatet
    let result = "";

    // clear tbody
    clearInnerHTML("existingMealsBody")

    // Løb igennem alle måltider
    let i = 0;
    Object.keys(allMeals).forEach(key => {
        i++;
        // indsæt de faktiske værdier i templaten
        let mealResult = existingMealTemplate.replaceAll("#no#", i)
        mealResult = mealResult.replaceAll("#id#", allMeals[key].MealID)
        mealResult = mealResult.replaceAll("#name#", allMeals[key].Name)
        mealResult = mealResult.replaceAll("#totalKcal#", allMeals[key].TotalCaloriesKcal)
        mealResult = mealResult.replaceAll("#totalProtein#", allMeals[key].TotalProtein)
        mealResult = mealResult.replaceAll("#totalFiber#", allMeals[key].TotalFiber)
        mealResult = mealResult.replaceAll("#totalFat#", allMeals[key].TotalFat)

        result += mealResult
    });

    // Iindsæt i DOM'en
    insertAfter("existingMealsBody", result);
}



// vis formen
function showAddMealForm() {
    var form = document.getElementById("addMealId");
    form.style.display = "block";
}

// gem formen
function hideAddMealForm() {
    var form = document.getElementById("addMealId");
    form.style.display = "none";
}


// DENNE FUNKTION SKAL IKKE ÆNDRES IFT V2
async function foodItemSearch(searchString) {
    // vis spinner mens der loades
    const spinnerId = "spinner";

    showElement(spinnerId);

    // response er et array frs api'et
    const data = await fetchData(ENDPOINT_FOODSEARCH, searchString);
    const foodsTableId = "foodsTableId";

    // Clear forrige resultat
    removeChildrenFromTable(foodsTableId);

    // løb igennem alle fødevarerne og indsæt de faktiske værdier i templaten
    for (let i = 0; i < data.length; i++) {
        let result = searchFoodTemplate.replaceAll("#foodName#", data[i].foodName);
        result = result.replaceAll("#id#", data[i].foodID);

        // Waits for the nutrition data to be fetched
        const food = await getFood(data[i].foodID);
        food.Name = data[i].foodName;

        result = result.replaceAll("#kj#", food.CaloriesKj);
        result = result.replaceAll("#kcal#", food.CaloriesKcal);
        result = result.replaceAll("#protein#", food.Protein);
        result = result.replaceAll("#fiber#", food.Fiber);
        result = result.replaceAll("#fat#", food.Fat);
        result = result.replaceAll("#carb#", food.Carbohydrates);

        // tilføj til food dictionary
        foodDictionary[data[i].foodID] = food;

        // Indsæt i DOM'en
        insertAfter(foodsTableId, result);
    }

    hideElement(spinnerId);
}

// DENNE SKAL IKKE ÆNDRES IFT V2
function removeChildrenFromTable(tableId) {
    const target = document.getElementById(tableId);
    target.innerHTML = '';
}

// rediger måltid
async function editMeal(mealId) {
    // henter det specifikke måltid fra backend
    currentMeal = await getMeal(mealId);
    renderMeal(currentMeal);
    showAddMealForm()
}

// clear 
function clearMeal() {
    currentMeal = undefined;
    clearInnerHTML("foodsTableId")
    document.getElementById('searchBox').value = ''
    hideAddMealForm();
}

//////////  HTML STRING TEMPLATES  //////////
const searchFoodTemplate =
    `<tr>
        <td>#foodName#</td>
        <td>#kj#</td>
        <td>#kcal#</td>
        <td>#protein#</td>
        <td>#fiber#</td>
        <td>#fat#</td>
        <td>#carb#</td>
        <td><input id="weight#id#" type="number" placeholder="Enter weight in grams"></td>
        <td><input type="button" id="addFoodButton" onclick="addFoodToMeal(currentMeal,  Object.assign({}, foodDictionary[#id#], {WeightInGrams: parseInt(document.getElementById('weight#id#').value)})); renderMeal(currentMeal)" value="Add food"></td>
    </tr>`

const mealFoodTemplate =
    `<tr>
        <td>#foodName#</td>
        <td>#weight#</td>
        <td>#kj#</td>
        <td>#kcal#</td>
        <td>#protein#</td>
        <td>#fiber#</td>
        <td>#fat#</td>
        <td>#carb#</td>
        <td><img class="img pointer" src="../images/slet.png" onclick="removeFoodFromMeal(currentMeal, #id#);renderMeal(currentMeal)" alt=""></td>
    </tr>`

const existingMealTemplate=
    `<tr>
        <td>#no#</td>
        <td>#name#</td>
        <td>#totalKcal#</td>
        <td>#totalProtein#</td>
        <td>#totalFiber#</td>
        <td>#totalFat#</td>
        <td></td>
        <td><a><img class="img pointer" src="../images/lav.png" alt="" onclick="(async() => {await editMeal(#id#)})()"></a></td>
        <td><a><img class="img pointer" src="../images/slet.png" alt="" onclick="(async() => {await removeMeal(#id#); await renderExistingMeals()})()"></a></td>
    </tr>`
