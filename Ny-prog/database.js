
import sql from 'mssql';

export default class Database {
    constructor(config) {
        this.config = config;
    }

    // --------------- FUNKTIONER DER IDENTIFICERER BRUGER OG BRUGER ID --------------------------------

    // tjekker om mailen allerede eksisterer i databasen
    async doesEmailExist(email) {
        try {
            // connect til database
            const pool = await sql.connect(this.config);

            // SQL til at tjekke om email allerede eksisterer i databasen
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .query(`
                    SELECT * FROM NutriTracker.Bruger WHERE Email = @Email
                `);

            // hvis der retuneres noget eksisterer mail allerede i databasen
            return result['recordset'].length > 0

        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    // finder en bruger-email på baggrund af mail og hash
    async findUserByEmailAndHash(token) {
        try {
            // token er en string der indeholder mail og hash password. Her bliver token splittet til et array ved '&', hvor index 0 indeholder mail og index 1 hash password.
            const tokens = token.split('&')
            // hiver mail udfra tokens array
            const email = tokens[0];
            // hiver hash ud fra tokens array
            const hashedPassword = tokens[1]

            // connect til database
            const pool = await sql.connect(this.config);

            // SQL til at tjekke om email allerede eksisterer i databasen samt hash password
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .input('PasswordHash', sql.NVarChar, hashedPassword)
                .query(`
                    SELECT * FROM NutriTracker.Bruger WHERE Email = @Email AND PasswordHash=@PasswordHash
                `);
            // recordset er et array. hvis dette har en længde på nul, vil der ikke findes en bruger
            if (result['recordset'].length == 0) {
                throw new Error('Bruger findes ikke');
            }

            // her returnerer vi UserID og mail hvis brugeren eksisterer i databasen
            return {
                id: result['recordset'][0].UserID,
                email: result['recordset'][0].Email,
            }

        } catch (error) {
            throw error;
        }
    }

    // finder userId for en bruger ud fra email og hash
    async getUserIdByMailAndHash(token) {
        try {
            // token er en string der indeholder mail og hash password. Her bliver token splittet til et array ved '&', hvor index 0 indeholder mail og index 1 hash password.
            const tokens = token.split('&')
            // hiver email udfra tokens array
            const email = tokens[0];
            // hiver hash ud fra tokens array
            const hashedPassword = tokens[1]

            // connect til database
            const pool = await sql.connect(this.config);

            // sql til at finde userId
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .input('PasswordHash', sql.NVarChar, hashedPassword)
                .query(`
                    SELECT UserID FROM NutriTracker.Bruger 
                    WHERE Email = @Email AND PasswordHash = @PasswordHash
                `);

            // hvis brugeren eksisterer returneres userId
            if (result.recordset.length > 0) {
                const userId = result.recordset[0].UserID;
                return userId

            } else {
                return null; // brugeren findes ikke
            }
        } catch (error) {
            throw error;
        }
    }

    // -------------------- FUNKTIONER DER BESKÆFTIGER SIG MED BRUGERREGISTRERING, LOGIN, OPDATERING OG SLETNING --------------------

    // funktion der opretter en bruger
    async createUser(userData) {
        try {
            // Check om emailen eksisterer i databasen
            const emailExists = await this.doesEmailExist(userData.email);
            // hvis mailen allerede eksisterer kastes fejlen
            if (emailExists) {
                throw new Error('Email already exists');
            }

            // connect til database
            const pool = await sql.connect(this.config);


            // SQL til at indsætte data i databasen, kører kun hvis email ikke eksisterer i databasen
            const result = await pool.request()
                .input('Name', sql.NVarChar, userData.name)
                .input('Email', sql.NVarChar, userData.email)
                .input('PasswordHash', sql.NVarChar, userData.passwordHash)
                .input('Age', sql.Int, userData.age)
                .input('Height', sql.Decimal(5, 2), userData.height)
                .input('Weight', sql.Decimal(5, 2), userData.weight)
                .input('Gender', sql.NVarChar, userData.gender)
                .input('Registration', sql.DateTime, new Date().toISOString())
                .query(`
                    INSERT INTO NutriTracker.Bruger (Name, Email, PasswordHash, Age, Height, Weight, Gender, Registration)
                    VALUES (@Name, @Email, @PasswordHash, @Age, @Height, @Weight, @Gender, @Registration)
                `);

            return result;
        } catch (error) {
            throw error;
        }
    }

    // function til at tjekke om mail og password i databasen stemmer overens med bruger-inputtet
    async loginUser(userData) {
        try {
            //connect til databasen
            const pool = await sql.connect(this.config);

            // SQL til at tjekke om inputtet stemmer
            const result = await pool.request()
                .input('Email', sql.NVarChar, userData.email)
                .input('PasswordHash', sql.NVarChar, userData.passwordHash)
                .query('SELECT * FROM NutriTracker.Bruger WHERE Email = @Email AND PasswordHash = @PasswordHash');

            // recordset er et array. Hvis længden af dette array er længere en 0 eksisterer brugeren. Da der kun eksisterer en bruger med denne email, ved vi også at dett 0'de index er brugeren.
            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                return null;
            }

        } catch (error) {
            throw error;
        }
    }

    // funktion til at opdatere brugerinformation
    async updateUserAccount(token, userData) {
        try {
            const tokens = token.split('&');
            const email = tokens[0];
            const hashedPassword = tokens[1];

            // connect til database
            const pool = await sql.connect(this.config);

            // sql til at opdatere brugerinformation
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .input('PasswordHash', sql.NVarChar, hashedPassword)
                .input('Name', sql.NVarChar, userData.name)
                .input('Age', sql.Int, userData.age)
                .input('Weight', sql.Decimal, userData.weight)
                .input('Gender', sql.NVarChar, userData.gender)
                .query(`
                    UPDATE NutriTracker.Bruger
                    SET Name = @Name, Age = @Age, Weight = @Weight, Gender = @Gender
                    WHERE Email = @Email AND PasswordHash = @PasswordHash`);

            return result;
        } catch (error) {
            throw error;
        }
    }

    // funktion til at slette bruger fra databasen
    async deleteAccount(token) {
        try {
            // alle data for den specifikke bruger skal hentes, da ALT skal slettes fra databasen
            const userId = await this.getUserIdByMailAndHash(token)
            const deleteActivities = await this.deleteActivities(userId)
            const deleteBmr = await this.deleteBmr(userId)
            const deleteWater = await this.deleteWaterByUserId(userId)

            // Connect til database
            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('UserID', sql.Int, userId)
                .query(`SELECT MealID FROM NutriTracker.Meal WHERE UserID = @UserID`)
            // alle meal ID'er for en bruger
            const mealIds = result.recordset
            console.log(mealIds)
            // Alle id'er løbes igennem og slettes
            for (let i = 0; i < mealIds.length; i++) {
                await this.deleteMeal(mealIds[i].MealID)
            }
            
            // sql til at slette bruger 
            const result2 = await pool.request()
                .input('UserID', sql.Int, userId )
                .query(`DELETE FROM NutriTracker.Bruger WHERE UserID = @UserID`);

            
            return result2.rowsAffected[0];

        } catch (error) {
            throw error;
        }
    }

    // sletter vand for en bruger
    async deleteWaterByUserId(userId){
        try{
            const pool = await sql.connect(this.config);

            const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`DELETE FROM NutriTracker.Water WHERE UserID = @UserID`)
            return result.rowsAffected[0]
        } catch(error){
            throw error
        }
    }

    // sletter aktiviteter for en bruger
    async deleteActivities(userId) {
        try {

            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('UserID', sql.Int, userId)
                .query(`DELETE FROM NutriTracker.Activity WHERE UserID = @UserID`)

            return result.rowsAffected[0]
        } catch (error) {
            throw error
        }
    }

    // sletter bmr for en bruger
    async deleteBmr(userId) {
        try {
            const pool = await sql.connect(this.config)
            const result = await pool.request()
                .input('UserID', sql.Int, userId)
                .query(`DELETE FROM NutriTracker.BMR WHERE UserID = @UserID`)
            return result.rowsAffected[0]
        } catch (error) {
            throw error
        }

    }

    // henter brugerinfo
    async getAccountInfo(token) {
        try {
            // Split the token into email and hashed password
            const tokens = token.split('&');
            const email = tokens[0];
            const hashedPassword = tokens[1];

            // Connect til database
            const pool = await sql.connect(this.config);

            // sql til at hente bruger information
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .input('PasswordHash', sql.NVarChar, hashedPassword)
                .query(`
                    SELECT Name, Age, Weight, Gender 
                    FROM NutriTracker.Bruger 
                    WHERE Email = @Email AND PasswordHash = @PasswordHash
                `);

            return result.recordset[0]; //returnerer match
        } catch (error) {
            throw error;
        }
    }



    // ------------------- FUNKTIONER DER BESKÆFTIGER SIG MED AKTIVITETER OG BMR ----------------------------

    // funktion til at indsætte aktivitet i databasen

    async trackActivity(userId, activityObject) {
        try {
            //connect til database
            const pool = await sql.connect(this.config);

            // sql til at indsætte aktivitetsinformation
            const result = await pool.request()
                .input('ActivityName', sql.NVarChar, activityObject.ActivityName)
                .input('TotalCaloriesBurned', sql.Int, activityObject.TotalCaloriesBurned)
                .input('CaloriesBurnedPerHour', sql.Int, activityObject.CaloriesBurnedPerHour)
                .input('ActivityDuration', sql.Int, activityObject.ActivityDuration)
                .input('UserID', sql.Int, userId)
                .input('Registration', sql.DateTime, new Date().toISOString())
                .query(`
                INSERT INTO NutriTracker.Activity (ActivityName, TotalCaloriesBurned, CaloriesBurnedPerHour, ActivityDuration, Registration, UserID)
                VALUES (@ActivityName, @CaloriesBurnedPerHour, @TotalCaloriesBurned, @ActivityDuration, @Registration, @UserID); select SCOPE_IDENTITY() as id
            `);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // funktion til at indsætte bmr i databasen
    async trackBmr(userId, bmr) {
        try {
            // connect til database
            const pool = await sql.connect(this.config);

            // sql til at indsætte bmr
            const result = await pool.request()
                .input('BMR', sql.Float, bmr)
                .input('UserID', sql.Int, userId)
                .input('Registration', sql.DateTime, new Date().toISOString())
                .query(`
            INSERT INTO NutriTracker.BMR (BMR, UserID, Registration)
            VALUES (@BMR, @UserID, @Registration)`);
            return result
        } catch (error) {
            throw error;
        }
    }


    // ------------------------------- MEALCREATOR -----------------------------------------

    // finder alle måltider for en bruger
    async findAllMealsByUserId(id) {
        try {
            //connect til database
            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                    SELECT * FROM NutriTracker.Meal WHERE UserID = @UserID
                `);

            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    // finder et bestemt måltid for en bruger
    async getSingleMeal(mealId, userId) {
        try {
            // connect til database
            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('MealID', sql.Int, mealId)
                .input('UserID', sql.Int, userId)
                .query(`SELECT * FROM NutriTracker.Meal WHERE MealID = @MealID AND UserID = @UserID`)

            // recordset er et array. hvis længden er 0, findes måltidet ikke
            if (result.recordset.length === 0) {
                throw new Error("Could not find meal")
            }
            // det 0'de index i arrayet er måltidet
            const meal = result.recordset[0]
            // foods indeholder alle fødevarer der er knyttet til det specifikke MealID
            const foods = await this.getFoodsForMeal(meal.MealID)
            meal.Foods = foods

            return meal

        } catch (error) {
            throw error;
        }
    }

    // hent alle fødevarer for et bestemt måltid
    async getFoodsForMeal(mealId) {
        try {
            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('MealID', sql.Int, mealId)
                .query(`SELECT * FROM NutriTracker.Food WHERE MealID = @MealID`)

            // Returnerer et array af fødevarer
            return result.recordset
        }
        catch (error) {
            throw error;
        }
    }

    // opdater et måltid
    async updateMeal(userId, meal) {
        try {
            const pool = await sql.connect(this.config);

            // sletter de fødevarer der indgår i måltidet
            const result2 = await pool.request()
                .input('MealID', sql.Int, meal.MealID)
                .query(`DELETE FROM NutriTracker.Food WHERE MealID = @MealID`)

            // løber igennem de nye fødevarer og indsætter dem
            for (let i = 0; i < meal.Foods.length; i++) {
                const food = meal.Foods[i]
                const foodResult = await pool.request()
                    .input('Name', sql.NVarChar, food.Name)
                    .input('CaloriesKcal', sql.Decimal, food.CaloriesKcal)
                    .input('CaloriesKj', sql.Decimal, food.CaloriesKj)
                    .input('Carbohydrates', sql.Decimal, food.Carbohydrates)
                    .input('Fat', sql.Decimal, food.Fat)
                    .input('MealID', sql.Int, meal.MealID)
                    .input('Fiber', sql.Decimal, food.Fiber)
                    .input('Protein', sql.Decimal, food.Protein)
                    .input('WeightInGrams', sql.Decimal, food.WeightInGrams)
                    .query(`INSERT INTO NutriTracker.Food (Name, CaloriesKcal, CaloriesKj, Carbohydrates, Fat, MealID, Fiber, Protein, WeightInGrams)
                            VALUES (@Name, @CaloriesKcal, @CaloriesKj, @Carbohydrates, @Fat, @MealID, @Fiber, @Protein, @WeightInGrams)`)
                if (!foodResult.rowsAffected || foodResult.rowsAffected[0] !== 1) {
                    throw new Error(`Failed to insert food item ${food.Name}`);
                }

            }

            // opdaterer det nye næringsindhold for måltidet
            const result = await pool.request()
                .input('Name', sql.NVarChar, meal.Name)
                .input('TotalCaloriesKcal', sql.Decimal, meal.TotalCaloriesKcal)
                .input('TotalFat', sql.Decimal, meal.TotalFat)
                .input('TotalFiber', sql.Decimal, meal.TotalFiber)
                .input('TotalProtein', sql.Decimal, meal.TotalProtein)
                .input('TotalWeight', sql.Decimal, meal.TotalWeight)
                .input('UserID', sql.Int, userId)
                .input('MealID', sql.Int, meal.MealID)
                .query(`UPDATE NutriTracker.Meal
                        SET Name = @Name, TotalCaloriesKcal = @TotalCaloriesKcal, TotalFat = @TotalFat, TotalFiber = @TotalFiber, TotalProtein = @TotalProtein, TotalWeight = @TotalWeight
                        WHERE UserID = @UserID AND MealID = @MealID`)
        } catch (error) {
            throw error
        }
    }


    // gem måltid
    async saveMeal(userId, meal) {
        try {
            // connect til database
            const pool = await sql.connect(this.config);


            const result = await pool.request()
                .input('Name', sql.NVarChar, meal.Name)
                .input('TotalCaloriesKcal', sql.Decimal, meal.TotalCaloriesKcal)
                .input('TotalFat', sql.Decimal, meal.TotalFat)
                .input('TotalFiber', sql.Decimal, meal.TotalFiber)
                .input('TotalProtein', sql.Decimal, meal.TotalProtein)
                .input('TotalWeight', sql.Decimal, meal.TotalWeight)
                .input('userId', sql.Int, userId)
                .query(`
        INSERT INTO NutriTracker.Meal (Name, TotalCaloriesKcal, TotalFat, TotalFiber, TotalProtein, TotalWeight, UserID)
        VALUES (@Name, @TotalCaloriesKcal, @TotalFat, @TotalFiber, @TotalProtein, @TotalWeight, @userId); select SCOPE_IDENTITY() as id`)

            // MealId indeholder database Id på det indsatte meal. 
            const mealId = result.recordset[0].id;

            // Slet alle eksisterende foods
            const resultFoods = await pool.request()
                .input('MealID', sql.Int, mealId)
                .query(`DELETE FROM NutriTracker.Food WHERE MealID = @MealID`)

            // Loop over alle foods og indsæt dem i databasen.
            // foreign key for meal skal anvende mealId


            // løber igennem fødevarerne
            for (let i = 0; i < meal.Foods.length; i++) {
                const food = meal.Foods[i];
                const foodResult = await pool.request()
                    .input('Name', sql.NVarChar, food.Name)
                    .input('CaloriesKcal', sql.Decimal, food.CaloriesKcal)
                    .input('CaloriesKj', sql.Decimal, food.CaloriesKj)
                    .input('Carbohydrates', sql.Decimal, food.Carbohydrates)
                    .input('Fat', sql.Decimal, food.Fat)
                    .input('MealID', sql.Int, mealId)
                    .input('Fiber', sql.Decimal, food.Fiber)
                    .input('Protein', sql.Decimal, food.Protein)
                    .input('WeightInGrams', sql.Decimal, food.WeightInGrams)
                    .query(`
        INSERT INTO NutriTracker.Food (Name, CaloriesKcal, CaloriesKj, Carbohydrates, Fat, MealID, Fiber, Protein, WeightInGrams)
        VALUES (@Name, @CaloriesKcal, @CaloriesKcal, @Carbohydrates, @Fat, @MealID, @Fiber, @Protein, @WeightInGrams)`)

            }

            return result

        } catch (error) {
            throw error;
        }
    }

    // slet måltid
    async deleteMeal(mealId) {
        try {
            // connect til database
            const pool = await sql.connect(this.config)

            // slet fødevarerne fra det specifikke måltid
            const resultFoods = await pool.request()
                .input('MealID', sql.Int, mealId)
                .query(`DELETE FROM NutriTracker.Food WHERE MealID = @MealID`)

            // hvis et måltid slettes, slettes de trackede måltider der anvender det måltid også
            const resultTrackedMeals = await pool.request()
                .input('MealID', sql.Int, mealId)
                .query(`DELETE FROM NutriTracker.TrackedMeals WHERE MealID = @MealID`)

            // sletter måltidet
            const result2 = await pool.request()
                .input('MealID', sql.Int, mealId)
                .query(`DELETE FROM NutriTracker.Meal WHERE MealID = @MealID`)
            return result2

        } catch (error) {
            throw error;
        }
    }

    // -------------------------------- MEALTRACKER ----------------------------------

    // find alle registrerede måltider for en bruger
    async findAllTrackedMealsByUserId(id) {
        try {
            // connect
            const pool = await sql.connect(this.config);

            const result = await pool.request()
                .input('UserID', sql.Int, id)
                .query(`
                SELECT * FROM NutriTracker.TrackedMeals WHERE UserID = @UserID
            `);

            // recordset er et array bestående af alle registrerede måltider for en bruger
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    async findSpecificTrackedMeal(trackedMealId) {
        try {
            // connect
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('TrackMealID', sql.Int, trackedMealId)
                .query(`SELECT * FROM NutriTracker.TrackedMeals WHERE TrackMealID = @TrackMealID`);
            //console.log(result.recordset)
            // recordset er et array KUN bestående af et registreret måltid
            return result.recordset

        } catch (error) {
            throw error
        }
    }

    // opdater måltid
    async updateTrackedMeal(trackedMeal, userId) {
        try {
            // connect
            const pool = await sql.connect(this.config);
            const result = await pool.request()
                .input('Name', sql.NVarChar, trackedMeal.Name)
                .input('MealType', sql.NVarChar, trackedMeal.MealType)
                .input('Weight', sql.Int, trackedMeal.Weight)
                .input('Energy', sql.Int, trackedMeal.Energy)
                .input('TotalProtein', sql.Int, trackedMeal.TotalProtein)
                .input('TotalFat', sql.Int, trackedMeal.TotalFat)
                .input('TotalFiber', sql.Int, trackedMeal.TotalFiber)
                .input('Location', sql.NVarChar, JSON.stringify(trackedMeal.Location))
                .input('Registration', sql.DateTime, trackedMeal.Registration)
                .input('UserID', sql.Int, userId)
                .input('MealID', sql.Int, trackedMeal.MealID)
                .input('TrackMealID', sql.Int, trackedMeal.TrackMealID)
                .query(`UPDATE NutriTracker.TrackedMeals
                    SET Name = @Name, MealType = @MealType, Weight = @Weight, Energy = @Energy, TotalProtein = @TotalProtein, TotalFat = @TotalFat, TotalFiber = @TotalFiber, Location = @Location, Registration = @Registration, MealID = @MealID
                    WHERE UserID = @UserID and TrackMealID = @TrackMealID`)


            return result

        } catch (error) {
            throw error
        }
    }


    // gem et tracking af måltid
    async saveTrackedMeal(trackedMeal, userId, mealId) {
        try {
            // connect
            const pool = await sql.connect(this.config)

            const result = await pool.request()
                .input('Name', sql.NVarChar, trackedMeal.Name)
                .input('MealType', sql.NVarChar, trackedMeal.MealType)
                .input('Weight', sql.Int, trackedMeal.Weight)
                .input('Energy', sql.Int, trackedMeal.Energy)
                .input('TotalProtein', sql.Int, trackedMeal.TotalProtein)
                .input('TotalFat', sql.Int, trackedMeal.TotalFat)
                .input('TotalFiber', sql.Int, trackedMeal.TotalFiber)
                .input('Location', sql.NVarChar, JSON.stringify(trackedMeal.Location))
                .input('Registration', sql.DateTime, trackedMeal.Registration)
                .input('UserID', sql.Int, userId)
                .input('MealID', sql.Int, mealId)
                .query(`INSERT INTO NutriTracker.TrackedMeals(Name, MealType, Weight, Energy, TotalProtein, TotalFat, TotalFiber, Location, Registration, UserID, MealID)
                VALUES (@Name, @MealType, @Weight, @Energy, @TotalProtein, @TotalFat, @TotalFiber, @Location, @Registration, @UserID, @MealID)`)
            return result
        } catch (error) {
            throw error
        }
    }

    // slet tracked måltid
    async deleteTrackedMeal(trackedMealId) {
        try {
            // connect
            const pool = await sql.connect(this.config)

            const result = await pool.request()
                .input('TrackMealID', sql.Int, trackedMealId)
                .query(`DELETE FROM NutriTracker.TrackedMeals WHERE TrackMealID = @TrackMealID`)
            return result
        } catch (error) {
            throw error
        }
    }

    // track vand 
    async trackWater(water, userId) {
        try {
            // connect
            const pool = await sql.connect(this.config)
            const result = await pool.request()
                .input('WaterAmount', sql.Float, water)
                .input('UserID', sql.Int, userId)
                .input('Registration', sql.DateTime, new Date().toISOString())
                .query(`INSERT INTO NutriTracker.Water (WaterAmount, UserID, Registration)
                VALUES (@WaterAmount, @UserID, @Registration)`)
            return result
        } catch (error) {
            throw error
        }
    }

    // -------------------- DAILY NUTRI ---------------------------------------------
    async getWaterGreaterThan(userId, startDate) {
        // connect
        const pool = await sql.connect(this.config)
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            // format formaterer datoen
            .input('StartDate', sql.DateTime, startDate.format('YYYY-MM-DD'))
            // vælg vand hvor registereringsdatoen er større end startdatoen
            .query(`SELECT WaterAmount, Registration from NutriTracker.Water WHERE UserID= @UserID AND Registration > @StartDate`)

        return result.recordset
    }

    async getEnergyGreaterThan(userId, startDate) {
        // connect
        const pool = await sql.connect(this.config)
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            // format formaterer datoen
            .input('StartDate', sql.DateTime, startDate.format('YYYY-MM-DD'))
            // vælg energy hvor registereringsdatoen er større end startdatoen
            .query(`SELECT Energy, Registration from NutriTracker.TrackedMeals WHERE UserID=@UserID AND Registration > @StartDate`)

        return result.recordset
    }

    async getLastBMR(userId, startDate) {
        // connect
        const pool = await sql.connect(this.config)
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            // format formaterer datoen
            .input('StartDate', sql.DateTime, startDate.format('YYYY-MM-DD'))
            // vælg den seneste registrerede bmr
            .query(`SELECT TOP 1 Bmr from NutriTracker.BMR WHERE UserID=@UserID Order by BmrID desc`)

        return result.recordset
    }

    async getActivityGreaterThan(userId, startDate) {
        // connect
        const pool = await sql.connect(this.config)
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            // format formaterer datoen
            .input('StartDate', sql.DateTime, startDate.format('YYYY-MM-DD'))
            //vælg den totale kalorieforbrænding hvor registereringsdatoen er større end startdatoen
            .query(`SELECT TotalCaloriesBurned, Registration from NutriTracker.Activity WHERE UserID=@UserID AND Registration > @StartDate`)

        return result.recordset
    }

}
