
let allMeals = {};

// holder nuværende trackede måltid
let currentTrackedMeal = null;

// Top level functions cannot call async functions directly
(async () => {
    // hent alle meals fra MealCreator
    allMeals = await getMeals();
    console.log(allMeals)
    await renderTrackedMeals();
    generateTrackedMealOptions();
    generateMealTypeOptions()
})();



////// lav nyt tracked meal
async function createOrEditTrackedMeal() {
    // Find måltidet fra database
    const mealId = document.getElementById("trackedMealSelect").value;
    const meal = allMeals.find(item => item.MealID === parseInt(mealId));
    
    // hent den valgte type
    const mealType = document.getElementById("trackedMealType").value;

    // konsumeret vægt
    const consumedWeight = parseFloat(document.getElementById("trackedMealWeightInGrams").value ?? "0");

    const currentDate = new Date();

    // lav nyt tracked meal
    const trackedMeal = new TrackedMeal(meal.MealID, meal.Name, mealType, currentDate.toISOString(), "location", consumedWeight)

    // skab ikke et nyt tracked meal hvis der redigeres på et eksisterende
    if(currentTrackedMeal != null){
        trackedMeal.TrackMealID = currentTrackedMeal.TrackMealID
    }

    // udregn
    calculateTotalsForTrackedMeal(trackedMeal, meal)
    
    document.getElementById("createTrackedMeal").disabled = true;

    getGeoLocation( async (position, success)=> {
        if(!success) {
            document.getElementById("createTrackedMeal").disabled = false
            alert("Getting geo location is not allowed. Your tracked meal cannot be saved.")
            return;
        }
        trackedMeal.Location = new Location(position.coords.latitude, position.coords.longitude)
      
        // We redigere et tracked meal
        if(currentTrackedMeal != null){
            // opdater
            await updateTrackedMeal(trackedMeal);

        }
        else {
            // gem
            await saveTrackedMeal(trackedMeal);
        }
        
        // sæt currentTrackedMeal til null
        currentTrackedMeal = null;
        generateTrackedMealOptions()
        generateMealTypeOptions()
        document.getElementById("trackedMealWeightInGrams").value = ""

        // hent alle trackede meals
        await renderTrackedMeals()

        document.getElementById("createTrackedMeal").disabled = false
    });
}

////// rediger tracked meal
async function editTrackedMeal(trackedMealId) {
    console.log(trackedMealId)
    currentTrackedMeal = await getSingleTrackedMeal(trackedMealId)
    
    //console.log(trackedMeal)
    //console.log(trackedMeal.singleTrackedMeal[0].Weight)
    //currentTrackedMeal = allTrackedMeals[trackedMealId]
    //console.log(currentTrackedMeal)

    generateTrackedMealOptions()
    generateMealTypeOptions();
    //console.log('*****')
    console.log(currentTrackedMeal)
    document.getElementById("trackedMealWeightInGrams").value = currentTrackedMeal.Weight
    showAddTrackedMealForm()
}

////// Generer valgmuligheder
function generateTrackedMealOptions() {
    const select = document.getElementById("trackedMealSelect");
    let result = '<option value="-">-- Select --</option>';
    for (let i = 0; i < allMeals.length; i++) {
        let selected = ''
        if( currentTrackedMeal != null && currentTrackedMeal.MealID === allMeals[i].MealID){
            selected = 'selected'
            console.log("hej")
        }
        //console.log(i)
        //console.log(currentTrackedMeal)
        //console.log(allMeals[i])
        result += `<option ${selected}  value="${allMeals[i].MealID}">${allMeals[i].Name} - ${allMeals[i].TotalWeight} gr.</option>`
        
    }
    /*
    Object.keys(allMeals).forEach(key => {
        console.log(key)
        let selected = ''
        if( currentTrackedMeal != null && currentTrackedMeal.mealId === allMeals[key].id){
            selected = 'selected'
        }
        result += `<option ${selected}  value="${key}">${allMeals[key].name} - ${allMeals[key].totalWeight} gr.</option>`
    });
    */
    select.innerHTML = result;
}

////// Generer type
function generateMealTypeOptions() {
    const select = document.getElementById("trackedMealType");
    let result = '<option value="-">-- Select --</option>';

    if( currentTrackedMeal != null && currentTrackedMeal.MealType === "Breakfast"){
        result += `<option value="Breakfast" selected>Breakfast</option>`
    }
    else {
        result += `<option value="Breakfast">Breakfast</option>`
    }

    if( currentTrackedMeal != null && currentTrackedMeal.MealType === "Lunch"){
        result += `<option value="Lunch" selected>Lunch</option>`
    }
    else {
        result += `<option value="Lunch">Lunch</option>`
    }

    if( currentTrackedMeal != null && currentTrackedMeal.MealType === "Dinner"){
        result += `<option value="Dinner" selected>Dinner</option>`
    }
    else {
        result += `<option value="Dinner">Dinner</option>`
    }

    if( currentTrackedMeal != null && currentTrackedMeal.MealType === "Snack"){
        result += `<option value="Snack" selected>Snack</option>`
    }
    else {
        result += `<option value="Snack">Snack</option>`
    }

    select.innerHTML = result;
}


async function renderTrackedMeals() {

    // Load alle meals fra database
    const allTrackedMeals = await getTrackedMeals();

    // variabel til at holde result
    let result = "";

    // clear tbody existingMealsBody
    clearInnerHTML("trackedMealsBody")

    // Loop over alle trackede måltider
    for (let i = 0; i < allTrackedMeals.length; i++) {
        let mealResult = existingTrackedMealTemplate.replaceAll("#id#", allTrackedMeals[i].TrackMealID)
        mealResult = mealResult.replaceAll("#name#", allTrackedMeals[i].Name)
        mealResult = mealResult.replaceAll("#type#", allTrackedMeals[i].MealType)
        mealResult = mealResult.replaceAll("#addedOn#", allTrackedMeals[i].Registration)
        mealResult = mealResult.replaceAll("#weight#", allTrackedMeals[i].Weight)
        mealResult = mealResult.replaceAll("#energy#", allTrackedMeals[i].Energy)
        mealResult = mealResult.replaceAll("#totalFat#", Math.round(allTrackedMeals[i].TotalFat))
        mealResult = mealResult.replaceAll("#totalProtein#", Math.round(allTrackedMeals[i].TotalProtein))
        mealResult = mealResult.replaceAll("#totalFiber#", Math.round(allTrackedMeals[i].TotalFiber))
        mealResult = mealResult.replaceAll("#location#", JSON.stringify(allTrackedMeals[i].Location))


        result += mealResult
        
    }
    /*
    let i = 0;
    Object.keys(allTrackedMeals).forEach(key => {
        i++;
        let mealResult = existingTrackedMealTemplate.replaceAll("#id#", allTrackedMeals[key].id)
        mealResult = mealResult.replaceAll("#name#", allTrackedMeals[key].name)
        mealResult = mealResult.replaceAll("#type#", allTrackedMeals[key].type)
        mealResult = mealResult.replaceAll("#addedOn#", allTrackedMeals[key].date)
        mealResult = mealResult.replaceAll("#weight#", allTrackedMeals[key].totalWeight)
        mealResult = mealResult.replaceAll("#energy#", allTrackedMeals[key].totalCaloriesKcal)
        mealResult = mealResult.replaceAll("#totalFat#", Math.round(allTrackedMeals[key].totalFat))
        mealResult = mealResult.replaceAll("#totalProtein#", Math.round(allTrackedMeals[key].totalProtein))
        mealResult = mealResult.replaceAll("#totalFiber#", Math.round(allTrackedMeals[key].totalFiber))
        mealResult = mealResult.replaceAll("#location#", JSON.stringify(allTrackedMeals[key].location))

        result += mealResult
    });
    */

    // Insert into DOM
    insertAfter("trackedMealsBody", result);
}

function showAddTrackedMealForm() {
    var form = document.getElementById("addTrackedMealId");
    form.style.display = "block";
}

function showTrackWaterForm(){
    var form = document.getElementById("waterTracker");
    form.style.display = "block";
}


async function trackWater(){
    
    try{
        const water = document.getElementById("water").value
        console.log(water)
        const token = sessionStorage.getItem("token")
        console.log(token)
        const waterObject = {
            water: water,
            token: token
        }
        const response = await fetch('/api/water/add', {
            method : "POST",
            headers: { "Content-Type": "application/json",},
            body : JSON.stringify(waterObject)
        })
        if(response.ok){
            alert('Water was succesfully tracked')
        } else{
            alert('Failed to track water')
        }

    } catch(error){
        console.log('Error when tracking water')
    }
}
document.getElementById('waterButton').addEventListener("click", function () {
    trackWater();
})


//////////  HTML STRING TEMPLATES  //////////
const existingTrackedMealTemplate=
    `<tr>
        <td></td>
        <td>#name#</td>
        <td>#type#</td>
        <td>#weight#</td>
        <td>#energy#</td>
        <td class="flex">
            <div id = "blue" class = "grid">#totalProtein# g</div>
            <div id = "orange" class = "grid">#totalFat# g</div>
            <div id = "babyBlue" class = "grid">#totalFiber# g</div>
        </td>
        <td>#location#</td>
        <td>#addedOn#</td>
        <td></td>
        <td><a><img class="img pointer" src="../images/lav.png" alt="" onclick="(async() => {await editTrackedMeal(#id#)})()"></a></td>
        <td><a><img class="img pointer" src="../images/slet.png" alt="" onclick="(async() => {await removeTrackedMeal(#id#); await renderTrackedMeals()})()"></a></td>
    </tr>`
