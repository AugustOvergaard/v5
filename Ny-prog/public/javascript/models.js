/// Classses
class Food{
    constructor(foodId, weightInGrams, caloriesKj, caloriesKcal,  protein, fiber , fat, carbohydrates, name){
        this.Id = foodId
        this.WeightInGrams = weightInGrams
        this.CaloriesKj = caloriesKj
        this.CaloriesKcal = caloriesKcal
        this.Fiber = fiber
        this.Protein = protein
        this.Carbohydrates = carbohydrates
        this.Fat = fat
        this.Name = name

    }
}

class Meal {
    constructor(name){
        this.Id = Date.now()
        this.Name = name
        this.Foods = []
        this.TotalCaloriesKcal = 0
        this.TotalFiber = 0
        this.TotalProtein = 0
        this.TotalFat = 0
        this.TotalWeight = 0
    }
}



class TrackedMeal {
    constructor(mealId, name, mealType, registration, location, weight){
        this.TrackMealID = null
        this.MealID = mealId
        this.Name = name
        this.MealType = mealType
        this.Registration = registration
        this.Location = location
        this.Weight = weight
        this.Energy = 0
        this.TotalProtein = 0
        this.TotalFiber = 0
        this.TotalFat = 0

    }
}

class Location {
    constructor(latitude, longitude){
        this.Latitude = latitude
        this.Longitude = longitude
    }
}

/*
class Nutrition {
    constructor(){
        this.calories = 0
        this.fat = 0
        this.protein = 0
        this.carbohydrates = 0
        this.fiber = 0
    }
}

*/

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"]


// ------------- FUNKTIONER ---------------------------------
function addFoodToMeal(meal, food){
    // tilføjø kun fødevare hvis den ikke allerede eksiterer i måltidet
    if (meal.Foods.find( i => i.FoodId === food.Id) === undefined) {
        scaleNutritionbyWeight(food)
        meal.Foods.push(food)
    }
}

function removeFoodFromMeal(meal, foodId){
    const index = meal.Foods.findIndex( i => i.FoodID === foodId)

    // fjern fødevarer fra måltidet, hvis det eksisterer
    if (index !== -1) {
        meal.Foods.splice(index, 1)
    }
}

// total vægt OPS HER
/*
function getTotalWeightInGramsRecipe(meal){
    let totalWeight = 0
    for (let i = 0; i < meal.ingredients.length; i++) {
        totalWeight += meal.ingredients[i].weightInGrams    
    }
    return totalWeight;
}
*/

// udregner mængden af næring for en fødevarer udfra mængden af den
function scaleNutritionbyWeight(food){
    food.CaloriesKj = food.CaloriesKj*(food.WeightInGrams/100);
    food.CaloriesKcal = food.CaloriesKcal*(food.WeightInGrams/100);
    food.Fat = food.Fat*(food.WeightInGrams/100);
    food.Protein = food.Protein*(food.WeightInGrams/100);
    food.Carbohydrates = food.Carbohydrates*(food.WeightInGrams/100);
    food.Fiber = food.Fiber*(food.WeightInGrams/100);
}

// udregner den samlede ernnæring for et måltid
function calculateTotalsForMeal(meal) {
    meal.TotalCaloriesKcal = 0;
    meal.TotalFiber = 0;
    meal.TotalProtein = 0;
    meal.TotalFat = 0;
    meal.TotalWeight = 0;

    // løber i gennem fødevarerne og lægger værdierne sammen
    for(let i = 0; i < meal.Foods.length; i++){
        meal.TotalCaloriesKcal += meal.Foods[i].CaloriesKcal
        meal.TotalFiber += meal.Foods[i].Fiber
        meal.TotalProtein += meal.Foods[i].Protein
        meal.TotalFat += meal.Foods[i].Fat
        meal.TotalWeight += meal.Foods[i].WeightInGrams
    }
}

// udregner samlet ernæring for et registreret måltid
function calculateTotalsForTrackedMeal(trackedMeal, meal) {
    const consumptionRatio = trackedMeal.Weight / meal.TotalWeight;

    trackedMeal.Energy = meal.TotalCaloriesKcal * consumptionRatio
    trackedMeal.TotalProtein = meal.TotalProtein * consumptionRatio
    trackedMeal.TotalFiber = meal.TotalFiber * consumptionRatio
    trackedMeal.TotalFat = meal.TotalFat * consumptionRatio

}
