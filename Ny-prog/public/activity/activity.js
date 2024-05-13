async function calculateBurnedCalories() {

    // hiver alt brugerinput fra siden ud
    // hiver forbrændingen pr time fra aktiviteten
    const caloriesPerHour = parseInt(document.getElementById("activities").value);
    // input i minutter
    const durationMinutes = document.getElementById("duration").value;
    // vælger den valgte aktivitet fra html-siden 
    const selectedOption = document.getElementById("activities").options[document.getElementById("activities").selectedIndex];
    // hiver teksten fra den valgte aktivitet ud. trim() sørger for at det KUN er teksten der hentes
    const activityName = selectedOption.textContent.trim();

    // input er i minuttter. Her omregnes minutter til timer
    const durationHours = durationMinutes / 60;

    // udregner den totale mængde af forbrændte kalorier
    const totalCaloriesBurned = caloriesPerHour * durationHours

    // div til resultatet
    const TotalBurnedCaloriesResultDiv = document.getElementById("resultBurnedCalories");

    // indsætter værdien på html siden. toFixed(0) sørger for at der IKKE kommer decimaler på tallet
    TotalBurnedCaloriesResultDiv.innerHTML = totalCaloriesBurned.toFixed(0);


    // object, som gemmer alle værdierne
    const activityObject = {
        ActivityName: activityName,
        CaloriesBurnedPerHour: caloriesPerHour,
        ActivityDuration: durationMinutes,
        TotalCaloriesBurned: totalCaloriesBurned
    }

    // token fra session storage
    const token = sessionStorage.getItem("token");


    try {

        // post request til endpoint
        const response = await fetch('/api/activity/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, activityObject }) // send token og aktivitetsobjekt
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Log success besked
        } else {
            throw new Error('Failed to track activity');
        }
    } catch (error) {
        console.error(error);
    }
}

// event listener til trackActivity button
document.getElementById("trackActivity").addEventListener("click", function(event){
    event.preventDefault();
    calculateBurnedCalories();
})


// funktion til at udregne bmr
async function calculateBmr() {
    try {
        // hiver bruger input ud
        const weight = document.getElementById("weight").value;
        const age = document.getElementById("age").value;
        const gender = document.getElementById("gender").value;

        // holder den udregnede bmr
        let bmr;

        // switch(gender )tjekker værdien af gender
        switch (gender) {
            case "female":
                switch (true) {
                    //tjekker age for at finde den passende formel
                    case age < 3:
                        bmr = 0.244 * weight - 0.13;
                        break;
                    case age >= 4 && age <= 10:
                        bmr = 0.085 * weight + 2.03;
                        break;
                    case age >= 11 && age <= 18:
                        bmr = 0.056 * weight + 2.9;
                        break;
                    case age >= 19 && age <= 30:
                        bmr = 0.0615 * weight + 2.08;
                        break;
                    case age >= 31 && age <= 60:
                        bmr = 0.0364 * weight + 3.47;
                        break;
                    case age >= 61 && age <= 75:
                        bmr = 0.0386 * weight + 2.88;
                        break;
                    default:
                        bmr = 0.041 * weight + 2.61;
                }
                break;

            
            case "male":
                switch (true) {
                    case age < 3:
                        bmr = 0.249 * weight - 0.13;
                        break;
                    case age >= 4 && age <= 10:
                        bmr = 0.095 * weight + 2.11;
                        break;
                    case age >= 11 && age <= 18:
                        bmr = 0.074 * weight + 2.75;
                        break;
                    case age >= 19 && age <= 30:
                        bmr = 0.064 * weight + 2.84;
                        break;
                    case age >= 31 && age <= 60:
                        bmr = 0.0485 * weight + 3.67;
                        break;
                    case age >= 61 && age <= 75:
                        bmr = 0.0499 * weight + 2.93;
                        break;
                    default:
                        bmr = 0.035 * weight + 3.43;
                }
                break;
            default:
                console.error("Invalid gender");
                return;
        }

        // Viser bmr i på html-siden
        document.getElementById("calculatedBMRResultat").innerHTML = bmr.toFixed(2)

        // token
        const token = sessionStorage.getItem("token");
        const response = await fetch('/api/bmr/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, bmr })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Log success message
        } else {
            throw new Error('Failed to track BMR');
        }
    } catch (error) {
        console.error(error);
        // Handle error appropriately, e.g., display error message to the user
    }
}

document.getElementById("bmrCalculateButton").addEventListener("click", function(event){
    event.preventDefault();
    calculateBmr();
})
