// sign up funktion
async function signUp() {
    // få bruger input fra HTML-siden
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const gender = document.getElementById('Gender').value;


    // bruger-data objekt
    const userData = {
        email: email,
        password: password,
        name: name,
        age: age,
        height: height,
        weight: weight,
        gender: gender
    };

    try {
        const response = await fetch("/api/account/signup", {
            // post metoden anvendes til endpointet
            method: "POST", // *GET, POST, PUT, DELETE, etc.
             //credentials: "same-origin", // include, *same-origin, omit
            headers: {
                // angiver indholdstypen
                "Content-Type": "application/json",
            },
             // referrerPolicy: "no-referrer",
            body: JSON.stringify(userData)
        })

        // hvis responset fra endpointet er succesfuldt retuneres alert beskeden
        if (response.ok) {
            alert('User registered successfully');
        } else {
            console.log(response);
            // gemmer json response 
            const errorData = await response.json();
            if (errorData.error === 'Email already exists') {
                alert('Email already exists. Please use a different email.');
            } else {
                alert('Failed to register user');
            }
            
            // throw new Error(errorData.error || 'Failed to register user');
        }
    } catch (error) {
        console.log('Error signing up:', error);
        alert('Failed to register user. Please try again.');
    }
}

// event listener til sign-up button, lytter efter den specifikke begivenhed
document.getElementById('signUpButton').addEventListener('click',function (event) {
    event.preventDefault();
    signUp()
});

// funktion til at logge en eksisterende bruger ind
async function signIn(){
    // hent bruger-input fra HTML-siden
    const email = document.getElementById('emailSignIn').value;
    const password = document.getElementById('passwordSignIn').value;

    
    // brugerdata objekt, skal sendes med i request body
    const userData = {
        email: email,
        password: password
    }

    try {
        // venter på svar fra endpointet 
        const response = await fetch("/api/account/signin",{
            method : "POST",

            headers : {
                "Content-Type": "application/json",
            },

            body : JSON.stringify(userData)
        });
        if(response.ok){
            const token = (await response.json()).token 
            // sætter det skabte token i sessionStorage, token
            sessionStorage.setItem('token', token);
            alert('User authenticated succesfully');
            // navigerer brugeren videre til meal creator siden, hvis loginforsøget lykkes
            window.location.href = "/mealcreator/mealcreator.html"; 
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to sign in');
        }
        
        } catch(error){
            console.log('Error signing in:', error)
            alert('Failed to sign in. Please try again.');
    }
};
   
document.getElementById('signInButton').addEventListener('click', function (event){
        event.preventDefault();
        signIn();
});
