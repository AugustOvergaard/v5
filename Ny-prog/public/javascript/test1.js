function testNutritionCalculations(){
    const meal = new Meal ('1', 'Lågsusret');
    const strawberryIngredient = new Ingredient(500, 250,20,30, 30,2,'Kage')
    addIngredient(meal, strawberryIngredient);
    const nutrition = calculateNutrition(meal);
    console.log(nutrition);
    console.log(strawberryIngredient);
}
