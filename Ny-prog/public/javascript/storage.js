const mealsKey = "meals"
const trackedMealsKey = "trackedMeals"

// -------------------------- ALT RELATERET TIL MEAL CREATOR --------------------------

/*
async function saveMeal(meal){
    // Load all saved meals from storage and append the new meal
    const allMealsDictionary = await getMeals();
    allMealsDictionary[meal.id] = meal;

    // Save the new list of meals to storage
    localStorage.setItem(mealsKey, JSON.stringify(allMealsDictionary))

}
*/

/*
async function removeMeal(mealId){
    // Load all saved meals from storage and append the new meal
    const allMealsDictionary = await getMeals();
    delete allMealsDictionary[mealId];

    // Save the new list of meals to storage
    localStorage.setItem(mealsKey, JSON.stringify(allMealsDictionary))

}
*/

/*
async function getMeal(mealId){
    const allMealsDictionary = await getMeals();
    return allMealsDictionary[mealId];
}
*/



// denne skal ændres til at hente fra database istedet for local storage
/*
async function getMeals(){
    const mealsAsString = localStorage.getItem(mealsKey);

    if(!mealsAsString)
    {
        return {};
    }

    return JSON.parse(mealsAsString);
}
*/

/// -------------------- ALT RELATERET TIL TRACKED MEALS (MEALTRACKER) --------------------------

// denne skal ændres til at hente fra databasen istedet for local storage
/*
async function getTrackedMeals(){
    const trackedMealsAsString = localStorage.getItem(trackedMealsKey)

    if(!trackedMealsAsString)
    {
        return {};
    }

    return JSON.parse(trackedMealsAsString);
}
*/

// denne skal ændres, så den ikke gemmer det trackede måltid i local storage, men i databasen istedet
/*
async function saveTrackedMeal(trackedMeal){
    // Load all saved meals from storage and append the new meal
    const allTrackedMealsDictionary = await getTrackedMeals();
    allTrackedMealsDictionary[trackedMeal.id] = trackedMeal;

    // Save the new list of meals to storage
    localStorage.setItem(trackedMealsKey, JSON.stringify(allTrackedMealsDictionary))

}
*/

// denne skal ændres, så den ikke gemmer listen af trackede måltider i local storage, men i databasen istedet
/*
async function removeTrackedMeal(trackedMealId){
    // Load all saved meals from storage and append the new meal
    const allTrackedMealsDictionary = await getTrackedMeals();
    delete allTrackedMealsDictionary[trackedMealId];

    // Save the new list of meals to storage
    localStorage.setItem(trackedMealsKey, JSON.stringify(allTrackedMealsDictionary))

}
*/
