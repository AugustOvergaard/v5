import express from 'express'
import Database from './database.js';
import config from './config.js';
import crypto from 'crypto';
import { error } from 'console';
import moment from 'moment'; 


const app = express();
// static fil server middleware (hvis filerne ikke er static kan der ikke tages og gemmes bruger input fra html-siden)
app.use(express.static('public'))
const PORT = process.env.PORT || 3001;
// Middleware til at parse JSON body
app.use(express.json());

const database = new Database(config);

// --------------- ALLE API RUTER DER BESKÆFTIGER SIG MED BRUGERREGISTREING, LOGIN, OPDATERING OG SLETNING --------------------

// Route til brugerregistrering 
app.post('/api/account/signup', async (req, res) => {
    try {

        // Userdata der er sendt med fra body i signUp() i login.js
        const userData = req.body;

        // skaber et hash på baggrund af brugerens password (dette gøres så vi ikke lagrer passwords i databasen, hvilket øger sikkerheden)
        // md5 er algoritmen
        const hash = crypto.createHash('md5');
        // hexadecimal format
        const hashedPwd = hash.update(userData.password)
            .digest('hex');

        userData.passwordHash = hashedPwd
        userData.oprettelsesDato = new Date()

        // gem user data i databasen
        const result = await database.createUser(userData);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// route til at tjekke om brugeren er registreret med mail og password
app.post('/api/account/signin', async (req, res) => {
    try {
        // userdata der er sendt fra body i signIn() i login.js
        const userData = req.body;
        console.log(userData);

        // hasher passwordet fra brugerinputtet
        const hash = crypto.createHash('md5');
        const hashedPwd = hash.update(userData.password)
            .digest('hex');
        console.log(hashedPwd);

        userData.passwordHash = hashedPwd

        console.log(userData.passwordHash)

        // logger brugeren ind hvis brugerinputtet stemmer overens med databasen
        const user = await database.loginUser(userData);

        if (user) {
            // response
            const response = {
                message: 'User authenticated succesfully',
                // token skabes
                token: userData.email + '&' + userData.passwordHash
            }
            res.status(200).json(response);

        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

// route til at opdatere brugerinformation
app.post('/api/account/update', async (req, res) => {
    try {
        // userdata fra request body
        const userData = req.body
        const token = userData.token

        const result = await database.updateUserAccount(token, userData);

        res.status(200).json({ message: 'Account information updated successfully' });
    } catch (error) {
        // Håndter fejl
        res.status(500).json({ error: error.message });
    }
})

// route til at slette bruger
app.delete('/api/account/delete', async (req, res) => {
    try {
        // token fra request body
        const token = req.body.token;

        const result = await database.deleteAccount(token);


        // Check om brugeren blev slettet
        if (result> 0) {
            res.status(200).json({ message: 'Account deleted successfully' });
        } else {
            res.status(500).json({ error: 'An error happend while trying to delete the account' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/account/information', async (req,res)=>{
    try{
        // token fra request body
        const token = req.body.token
        if (!token) {
            return res.status(401).json({ error: 'Authorization token is required' });
        }

        // kalder getAccountInfo til at hente account information fra databasen
        const accountInfo = await database.getAccountInfo(token);

        // hvis accountInfo er null, findes brugeren ikke
        if (!accountInfo) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Returner account information
        res.status(200).json(accountInfo);
    } catch (error) {
        console.error('Error fetching account information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


// ------------------------ API RUTER DER BESKÆFTIGER SIG MED TRACKING AF AKTIVITET OG BMR -----------------------


app.post('/api/activity/add', async (req, res) => {
    try {
        const token = req.body.token;
        const activityObject = req.body.activityObject;

        console.log(token)
        console.log(activityObject)

        const userId = await database.getUserIdByMailAndHash(token)
        console.log(userId)
        if (userId) {
            // UserID fundet, indsæt aktivitet
            const result = await database.trackActivity(userId, activityObject);
            res.status(200).json({ message: 'Activity tracked successfully' });
        } else {
            // brugeren blev ikke fundet
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        // fejlhåndtering, når der et element ikke kan findes anvendes statuskode 404
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            // ved andre fejl retuner fejl 500
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/bmr/add', async (req, res) => {
    try {
        // fra request bodyen
        const token = req.body.token;
        const bmr = req.body.bmr;

        const userId = await database.getUserIdByMailAndHash(token);
        if (userId) {
            // hvis userId findes køres trackes bmr
            const result = await database.trackBmr(userId, bmr);
            if (result) {
                res.status(200).json({ message: 'BMR tracked successfully' });
            } else {
                res.status(500).json({ error: 'Failed to track BMR' });
            }
        } else {
            // brugeren blev ikke fundet
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        // Håndter fejl hvor bruger ikke eksisterer
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            // server fejl
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// ------------------------ API RUTER TIL MEAL CREATOR ---------------------------------

// find alle måltider
app.post('/api/meal/all', async (req, res) => {
    try {
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        const allMeals = await database.findAllMealsByUserId(user.id)

        res.status(200).json(allMeals)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// slet måltid
app.post('/api/meal/delete', async (req, res) => {
    try {
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        // træk mealID ud fra request
        const mealId = req.body.mealId

        // kald funktion på database som sletter meal
        const deleteMeal = await database.deleteMeal(mealId)
        const allMeals = await database.findAllMealsByUserId(user.id)

        res.status(200).json({ message: "Your meal was deleted succesfully" })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// find specifikt måltid
app.post('/api/meal/single', async (req, res) => {
    try{
    // token fra request body
    const token = req.body.token
    const user = await database.findUserByEmailAndHash(token)
    const userId = user.id
    // console.log(userId)

    // mealId fra request body
    const mealId = req.body.mealId

    const meal = await database.getSingleMeal(mealId, userId)
   
    res.status(200).json({message : "Your meal was retrieved succesfully", meal})
    } catch (error){
        res.status(500).json({error: error.message})
    }
})

// opdater måltid
app.post('/api/meal/update', async (req, res) => {
    try{
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)
        const userId = user.id
        // console.log(userId)

        // opdateret måltidsdata fra request body
        const updatedMeal = req.body.meal
        console.log(updatedMeal)

        await database.updateMeal(userId, updatedMeal)

        res.status(200).json({message : "Your meal was updated succesfully"})
    } catch(error){
        res.status(500).json({ error: error.message });
    }
})

// route til at tilføje et måltid
app.post('/api/meal/add', async (req, res) => {
    try {

        const user = await database.findUserByEmailAndHash(req.body.token);

        const meal = req.body.meal;
        console.log(meal);

        const x = await database.saveMeal(user.id, meal)
        res.status(200).json({ message: 'Your meal is saved' })
    }
    catch (error) {
        res.status(401).json({ message: error.message })

    }

})

// -------------------------- RUTER TIL MEAL TRACKER ----------------------------

// find alle trackede måltider
app.post('/api/trackedmeal/all', async (req, res) => {
    try {
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        const allTrackedMeals = await database.findAllTrackedMealsByUserId(user.id)
        //console.log(allTrackedMeals)

        res.status(200).json(allTrackedMeals)
        //console.log(allTrackedMeals)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// registrer måltid
app.post('/api/trackedmeal/add', async (req, res) => {
    try{
        
        const user = await database.findUserByEmailAndHash(req.body.token);
        // mealId fra request body
        const mealId = req.body.mealId
        // tracked meal data fra request body
        const trackedMealData = req.body.trackedMeal
        const trackedMeal = await database.saveTrackedMeal(trackedMealData, user.id, mealId)

        res.status(200).json(trackedMeal)
    } catch (error){
        res.status(500).json({error: error.message})
    }
})

// opdater registrering
app.post('/api/trackedmeal/update', async (req, res)=>{
    try{
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)
        // det trackede måltid hentes
        const trackedMeal = req.body.trackedMeal
        // nye værdier indsættes
        const updatedMeal = await database.updateTrackedMeal(trackedMeal, user.id)
        res.status(200).json(updatedMeal)
    } catch(error){
        res.status(500).json({error:error.message})
    }
})


// tilføj vand
app.post('/api/water/add', async (req, res)=>{
    try{
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)
        // vandmængde
        const water = req.body.water
        const trackWater = await database.trackWater(water, user.id)
        res.status(200).json({message: "Water intake was tracked successfully"})
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

// specifik registrering
app.post('/api/trackedmeal/single', async (req,res)=>{
    try{
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        // id fra request body
        const trackedMealId = req.body.trackedMealId
        const rows = await database.findSpecificTrackedMeal(trackedMealId)
        if(rows.length === 1) {
            res.status(200).json(rows[0])
        }
        else {
            res.status(500).json({error : new Error("Ingen fundet")})

        }
    } catch(error){
        res.status(500).json({error : error.message})
    }
})

// slet registrering
app.post('/api/trackedmeal/delete', async (req,res)=>{
    try{
        // token fra request body
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)
        // id fra request body
        const trackedMealId = req.body.trackedMealId
        const deleteTrackedMeal = await database.deleteTrackedMeal(trackedMealId)
        const newTrackedMealsList = await database.findAllTrackedMealsByUserId(user.id)

        res.status(200).json({message : "The tracked meal was deleted succesfully"})
        
    } catch(error){
        res.status(500).json({error : error.message})
    }
})

// -------------------- RUTER til DAILY NUTRI ---------------------------
app.post('/api/dailynutri/24hours', async (req,res)=>{
    try{
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        // now sættes til det nuværence tidspunkt med moment()
        const now = moment()
        // regn bagud for at få for de sidste 24 timer
        const startDate = now.add(-23, 'hour');
        // start time
        const startHour = startDate.hour();
        // retunerer et array med alle de registreringer der er større end startDate
        const waterRows = await database.getWaterGreaterThan(user.id, startDate)
        const energyRows = await database.getEnergyGreaterThan(user.id, startDate)
        const activityRows = await database.getActivityGreaterThan(user.id, startDate)
        const bmrRows = await database.getLastBMR(user.id, startDate)

        // opret dictionary
        const waterDict = {}
        const energyDict = {}
        const activityDict = {}
        const burnedEnergyDict = {}
        const caloriSurplusDeficitDict = {}

        // Water
        for (let i=0; i<waterRows.length; i++) {
            // finder registreringstidspunkt for indtaget
            const registration = moment(waterRows[i].Registration);
            // finder timen
            const hour = registration.hour()

            // hvis der ikke er nogen registrering på den pågældene time, bliver værdien sat til 0
            if(waterDict[hour] === undefined) {
                waterDict[hour] = 0
            }

            waterDict[hour] = waterDict[hour] + waterRows[i].WaterAmount

        }

        // Energy
        for (let i=0; i<energyRows.length; i++) {
            // finder registreringstidspunkt for indtaget
            const registration = moment(energyRows[i].Registration);
            // finder timen
            const hour = registration.hour()
            // hvis der ikke er nogen registrering på den pågældene time, bliver værdien sat til 0
            if(energyDict[hour] === undefined) {
                energyDict[hour] = 0
            }

            energyDict[hour] = energyDict[hour] +  energyRows[i].Energy
        }

        // Activity
        for (let i=0; i<activityRows.length; i++) {
             // finder registreringstidspunkt for indtaget
            const registration = moment(activityRows[i].Registration);
            // finder timen
            const hour = registration.hour()

            // hvis der ikke er nogen registrering på den pågældene time, bliver værdien sat til 0
            if(activityDict[hour] === undefined) {
                activityDict[hour] = 0
            }

            activityDict[hour] = activityDict[hour] + activityRows[i].TotalCaloriesBurned
        }

        // BurnedEnergy
        // henter keys array fra activityDict. 
        const keys = Object.keys(activityDict);
        // løber igennem keys array og udregner ud fra værdierne forbrændingen for den pågældene time
        for(let i = 0; i<keys.length; i++) {
            burnedEnergyDict[keys[i]] = bmrRows[0].Bmr / 24 + activityDict[keys[i]]
        }

        // Calorie suplus/deficit
        const hoursArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']

        // Det henter værdierne for forbrændt energi (be) og energiindtag (energy) for hver time baseret på keys i burnedEnergyDict og energyDict.
        for(let i=0;i<hoursArray.length; i++) {
            const be = burnedEnergyDict[hoursArray[i]] ?? 0;
            const energy = energyDict[hoursArray[i]] ?? 0

            //Hvis hverken forbrændt energi eller energiindtag er 0 for den pågældende time (dvs. der er data for enten forbrændt energi eller energiindtag), beregner det kalorieoverskud eller kaloriedeficit for den pågældende time ved at trække forbrændt energi fra energiindtag og tilføjer resultatet til caloriSurplusDeficitDict 
            if(be !== 0 || energy !== 0) {
                caloriSurplusDeficitDict[hoursArray[i]] = energy - be
            }
        }

        // lav final24hourRows
        const resultRows = []

        // løb over 24 timer
        for(let i=0;i<24; i++) {
            const currentHour = startHour + i

            // Den faktiske time som vi skal finde data for.
            let actualHour;

            // justerer actualHour  for at sikre, at det forbliver inden for intervallet 0-23.
            if (currentHour > 23) {
                actualHour = currentHour - 24;
            }
            else
            {
                actualHour = currentHour;
            }

            // Dette henter den streng, der repræsenterer den aktuelle time fra hoursArray baseret på actualHour
            const twoDigitHour = hoursArray[actualHour]
            const row = {
                "YesterdayOrToday": actualHour >= startHour && actualHour < 24 ? "Yesterday" : "Today",
                "Hour": twoDigitHour,
                "Energy" : energyDict[twoDigitHour] ?? 0,
                "Water" : waterDict[twoDigitHour] ?? 0,
                "CalorieSurplusDeficit" : caloriSurplusDeficitDict[twoDigitHour] ?? 0,
                "BasalMetabolicRate": burnedEnergyDict[twoDigitHour] ?? 0
            }
            

            resultRows.push(row)
        }
        res.status(200).json(resultRows)
        
    } catch(error){
        res.status(500).json({error : error.message})
    }
})

app.post('/api/dailynutri/month', async (req,res)=>{
    try{
        const token = req.body.token
        const user = await database.findUserByEmailAndHash(token)

        const startDate = moment().add(-1, 'months');
        const startDay = startDate.date();

        const waterRows = await database.getWaterGreaterThan(user.id, startDate)
        const energyRows = await database.getEnergyGreaterThan(user.id, startDate)
        const activityRows = await database.getActivityGreaterThan(user.id, startDate)
        const bmrRows = await database.getLastBMR(user.id, startDate)

        const waterDict = {}
        const energyDict = {}
        const activityDict = {}
        const burnedEnergyDict = {}
        const caloriSurplusDeficitDict = {}

        // Water
        for (let i=0; i<waterRows.length; i++) {
            const registration = moment(waterRows[i].Registration)
            const day = registration.date()

            if(waterDict[day] === undefined) {
                waterDict[day] = 0
            }

            waterDict[day] = waterDict[day] + waterRows[i].WaterAmount

        }

        // Energy
        for (let i=0; i<energyRows.length; i++) {
            const registration = moment(energyRows[i].Registration);
            const day = registration.date()


            if(energyDict[day] === undefined) {
                energyDict[day] = 0
            }

            energyDict[day] = energyDict[day] +  energyRows[i].Energy
        }

        // Activity
        for (let i=0; i<activityRows.length; i++) {
            const registration = moment(activityRows[i].Registration);
            const day = registration.date()

            if(activityDict[day] === undefined) {
                activityDict[day] = 0
            }

            activityDict[day] = activityDict[day] + activityRows[i].TotalCaloriesBurned
        }

        // BurnedEnergy
        const keys = Object.keys(activityDict);
        for(let i = 0; i<keys.length; i++) {
            burnedEnergyDict[keys[i]] = bmrRows[0].Bmr / 24 + activityDict[keys[i]]
        }

        // Calorie suplus/deficit
        const daysArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']

        for(let i=0;i<daysArray.length; i++) {
            const be = burnedEnergyDict[daysArray[i]] ?? 0;
            const energy = energyDict[daysArray[i]] ?? 0

            if(be !== 0 || energy !== 0) {
                caloriSurplusDeficitDict[daysArray[i]] = energy - be
            }
        }


        // Create final24hourRows
        const resultRows = []
        const daysInLastMonth = moment().add(-1, 'months').daysInMonth();

        // Loop over antal dage i måneden
        for(let i=0; i< daysInLastMonth; i++) {
            const currentDay = startDay + i

            // Den faktiske time som vi skal finde data for.
            let actualDay;

            if (currentDay >= daysInLastMonth) {
                actualDay = currentDay - daysInLastMonth;
            }
            else
            {
                actualDay = currentDay;
            }

            const twoDigitDay = daysArray[actualDay]
            const row = {
                "LastMonthOrCurrent": actualDay >= startDay && actualDay < daysInLastMonth ? "LastMonth" : "Current",
                "Day": twoDigitDay,
                "Energy" : energyDict[twoDigitDay] ?? 0,
                "Water" : waterDict[twoDigitDay] ?? 0,
                "CalorieSurplusDeficit" : caloriSurplusDeficitDict[twoDigitDay] ?? 0,
                "BasalMetabolicRate": burnedEnergyDict[twoDigitDay] ?? 0
            }

            resultRows.push(row)
        }



        res.status(200).json(resultRows)

    } catch(error){
        res.status(500).json({error : error.message})
    }
})





// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app
