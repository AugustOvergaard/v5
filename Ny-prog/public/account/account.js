// gør input felterne redigerbare
function toggleEdit() {
    let inputs = document.querySelectorAll("input[type='text']");
    inputs.forEach(function (input) {
        input.readOnly = !input.readOnly;
    });
}
// gør input felter til readonly
function makeInputFieldsReadOnly() {

    const editableInputs = document.querySelectorAll("input[type='text']");


    editableInputs.forEach(input => {
        input.readOnly = true;
    });
}


document.getElementById("editInfo").addEventListener("click", function () {
    toggleEdit();
});


// loader information fra databasen og viser det på html siden
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const token = sessionStorage.getItem("token")

        // Fetch account information fra api endpoint
        const response = await fetch('/api/account/information', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        // Check response
        if (response.ok) {
            // Parse JSON response
            const accountInfo = await response.json();

            // Updater html
            document.getElementById('name').value = accountInfo.Name;
            document.getElementById('age').value = accountInfo.Age;
            document.getElementById('weight').value = accountInfo.Weight;
            document.getElementById('gender').value = accountInfo.Gender;
        } else {
            console.error('Failed to fetch account information');
        }
    } catch (error) {
        console.error('Error fetching account information:', error);
    }
});



async function saveChanges() {

    const token = sessionStorage.getItem('token');

    // bruger input
    const name = document.getElementById('name').value
    const ageString = document.getElementById('age').value
    const weightString = document.getElementById('weight').value
    const gender = document.getElementById('gender').value

    // gør weight og height strengene integers
    const age = parseInt(ageString);
    const weight = parseInt(weightString);

    // userData objekt
    const userData = {
        name: name,
        age: age,
        weight: weight,
        gender: gender,
        token: token
    }

    try {
        const response = await fetch('/api/account/update', {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(userData) // send userData objektet
        })

        if (response.ok) {
            alert('Account information updated succesfully')
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to update account information');
        }

    } catch (error) {
        console.log('Error updating account information:', error)
        alert('Failed to update account information. Please try again.');
    }
    makeInputFieldsReadOnly()

}

document.getElementById('saveChanges').addEventListener("click", function () {
    saveChanges();
})


// funktion der fjerner brugeren fra sessionstorage og bliver dermed logget ud
async function signOut() {
    // fjerner token fra sessionStorage, når brugeren logger ud
    sessionStorage.removeItem("token");
    alert('You have been signed out')
}

document.getElementById("signOut").addEventListener("click", function () {
    signOut();
})

// funktion der sletter bruger
async function deleteAccount() {
    const token = sessionStorage.getItem('token');
    
    try {
        const response = await fetch('/api/account/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token }) // sender token med ind
        });

        if (response.ok) {
            // hvis response lykkes fjernes token fra sessionStorage
            alert('Account deleted successfully');
            sessionStorage.removeItem("token")
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to delete account');
        }
    } catch (error) {
        console.log('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
    }
    
}

document.getElementById('deleteAccountButton').addEventListener("click", function () {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone!')
    if (confirmed) {
        deleteAccount();
    }
});