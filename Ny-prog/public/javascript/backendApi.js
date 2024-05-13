

async function saveMeal(meal) {
    try {
        const token = sessionStorage.getItem("token")

        // ternary operator
        const apiEndpoint = (meal.MealID === undefined)
            ? "/api/meal/add"
            : "/api/meal/update"

        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({token, meal})
        });
        if (response.ok) {
            alert('Meal was succesfully saved');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to save meal');
        }
    } catch (error) {
        console.log('Error saving meal:', error);
        alert('Failed to save meal. Please try again.');
    }
}


async function getMeal(mealId){
    try{
        const token = sessionStorage.getItem("token")
        const response = await fetch("/api/meal/single", {
            method : "POST",

            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                mealId
            })

        })
        if(response.ok){
            const result = await response.json()
            console.log(JSON.stringify(result))
            return result.meal;
        } else{
            alert(response.error)
        }
    } catch (error){
        throw error
    }
}


async function getMeals() {
    try {
        const response = await fetch('/api/meal/all', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: sessionStorage.getItem("token")
            })
        })
        if (response.ok) {
            
            const allMeals = await response.json()
            //console.log(JSON.stringify(allMeals))
            return allMeals;
        } else {
            alert(response.error)
        }
    } catch (error) {
        console.log('Error loading meals:', error)
        alert('Failed to load meals from the database');
    }

}

async function removeMeal(mealId){
    try{
        const response = await fetch('/api/meal/delete', {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: sessionStorage.getItem("token"),
                mealId: mealId

            })
        })
        if(!response.ok){
            throw response.error
        }
    } catch (error){
        throw error
    }
}


// ------------------ MEALTRACKER ----------------------------------------

async function getTrackedMeals(){
    try{
        const response = await fetch('/api/trackedmeal/all',{
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({token : sessionStorage.getItem("token")})
        })
        
        if(response.ok){
            //console.log(response)
            const allTrackedMeals = await response.json()
            console.log(allTrackedMeals)
            return allTrackedMeals;
        } else{
            alert(response.error)
        } 
    } catch(error){
        console.log('Error loading tracked meals:', error)
        alert('Failed to load tracked meals from the database')
    }
}


async function saveTrackedMeal(trackedMeal){
    try{
        const response = await fetch('/api/trackedmeal/add', {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({
                token : sessionStorage.getItem("token"),
                trackedMeal : trackedMeal,
                mealId : trackedMeal.MealID
            })
        })
        if(response.ok){
            alert('Meal was tracked succesfully')
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to track meal');
        }
    } catch (error) {
        console.log('Error tracking meal:', error);
        alert('Failed to track meal. Please try again.');
    }
}



async function updateTrackedMeal(trackedMeal){
    try{
        const response = await fetch('/api/trackedmeal/update', {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({
                token : sessionStorage.getItem("token"),
                trackedMeal: trackedMeal
            })
        })
        if(response.ok){
            alert('TrackedMeal updated succesfully')
        } else{
            const errorData = await response.json();
            alert(errorData.error || 'Failed to update meal');
        }
    } catch(error){
        console.log('Error updating TrackedMeal:', error);
        alert('Failed to update TrackedMeal. Please try again.');
    }
}





async function getSingleTrackedMeal(trackedMealId){
    try{
        const response = await fetch('/api/trackedmeal/single',{
            method : "POST",
            headers: { "Content-Type": "application/json",},
            body : JSON.stringify({
                token : sessionStorage.getItem("token"),
                trackedMealId: trackedMealId
            })
        })
        if(response.ok){
            const trackedMeal = await response.json()
            console.log(trackedMeal)
            alert('Meal retrieved succesfully')
            return trackedMeal
        }else{
            alert('Failed to retrieve meal')
        } 
} catch(error){
    console.log('Failed to retrieve meal')
}

}



async function removeTrackedMeal(trackedMealId){
    try{
        const response = await fetch('/api/trackedmeal/delete', {
            method : "POST",
            headers: { "Content-Type": "application/json",},
            body : JSON.stringify({
                token : sessionStorage.getItem("token"),
                trackedMealId : trackedMealId
            })
        })
        if(response.ok){
            alert('The tracked meal was deleted succesfully')
        } else{
            alert('Failed to delete the tracked meal')
        }
    } catch(error){
        console.log('Error when deleting tracked meal')
    }
}


async function get24HourNutri(){
    try{
        const response = await fetch('/api/dailynutri/24hours', {
            method : "POST",
            headers: { "Content-Type": "application/json",},
            body : JSON.stringify({
                token : sessionStorage.getItem("token")
            })
        })
        if(response.ok){
            console.log(response)
            return response.json()
        } else{
            alert('Failed to get 24hours nutri')
        }
    } catch(error){
        console.log('Error when deleting tracked meal')
    }
}

async function getMonthlyNutri(){
    try{
        const response = await fetch('/api/dailynutri/month', {
            method : "POST",
            headers: { "Content-Type": "application/json",},
            body : JSON.stringify({
                token : sessionStorage.getItem("token")
            })
        })
        if(response.ok){
            return response.json()
        } else{
            alert('Failed to get 24hours nutri')
        }
    } catch(error){
        console.log('Error when deleting tracked meal')
    }
}
