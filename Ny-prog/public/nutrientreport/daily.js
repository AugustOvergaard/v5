
function renderDailyView(hourEntries) {
    const tableName = "hourViewBody"

    clearInnerHTML(tableName)

    for (let i = 0; i < hourEntries.length; i++) {
        let result = hourTemplate.replaceAll("#hour#", hourEntries[i].Hour);
        result = result.replaceAll("#yesterDayOrToday#", hourEntries[i].YesterdayOrToday);
        result = result.replaceAll("#energyHour#", hourEntries[i].Energy);
        result = result.replaceAll("#waterHour#", hourEntries[i].Water);
        result = result.replaceAll("#caloriesMathHour#", hourEntries[i].CalorieSurplusDeficit);
        result = result.replaceAll("#burningHour#", hourEntries[i].BasalMetabolicRate);

        insertAfter(tableName, result)
    }
}

function renderMonthlyView(dayliEntries) {
    const tableName = "monthlyViewBody"

    clearInnerHTML(tableName)

    for (let i = 0; i < dayliEntries.length; i++) {
        let result = monthTemplate.replaceAll("#day#", dayliEntries[i].Day);
        result = result.replaceAll("#lastMonthOrCurrent#", dayliEntries[i].LastMonthOrCurrent);
        result = result.replaceAll("#energyDay#", dayliEntries[i].Energy);
        result = result.replaceAll("#waterDay#", dayliEntries[i].Water);
        result = result.replaceAll("#caloriesMathDay#", dayliEntries[i].CalorieSurplusDeficit);
        result = result.replaceAll("#burningDay#", dayliEntries[i].BasalMetabolicRate);

        insertAfter(tableName, result)
    }
}

async function showDailyView() {
    hideMonthlyView()
    var form = document.getElementById("hourView")
    form.style.display = "block";
    const hourEntries = await get24HourNutri();
    console.log(hourEntries)
    renderDailyView(hourEntries)
   
}

async function showMonthlyView(){
    hideDailyView()
    var form = document.getElementById("monthlyView")
    form.style.display = "block"

    const dayliEntries = await getMonthlyNutri();
    renderMonthlyView(dayliEntries)

}

function hideDailyView(){
var form = document.getElementById("hourView")
form.style.display = "none"
}

function hideMonthlyView(){
    var form = document.getElementById("monthlyView")
    form.style.display = "none"
}


//----------- HTML STRING TEMPLATES -------------------
const hourTemplate = `
<tr>
    <td>#yesterDayOrToday#</td>
    <td>#hour#</td>
    <td>#energyHour#</td>
    <td>#waterHour#</td>
    <td>#caloriesMathHour#</td>
    <td>#burningHour#</td>
</tr>`

const monthTemplate =`
<tr>
    <td>#lastMonthOrCurrent#</td>
    <td>#day#</td>
    <td>#energyDay#</td>
    <td>#waterDay#</td>
    <td>#caloriesMathDay#</td>
    <td>#burningDay#</td>
</tr>`
