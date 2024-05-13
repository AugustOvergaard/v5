const API_BASE_URL = "https://nutrimonapi.azurewebsites.net/api/";
const ENDPOINT_FOODSEARCH = "FoodItems/BySearch"
const ENDPOINT_FOODCOMPSPEC = "FoodCompSpecs/ByItem/{foodId}/BySortKey/{sortKey}"

//fetch data fra endpoint
async function fetchData(endpoint, id = null) {
    try {
        const url = id == null
            ? `${API_BASE_URL}/${endpoint}`
            : `${API_BASE_URL}/${endpoint}/${id}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "170894",

            },
        });
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        return await response.json();

    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}


async function getFoodCompSpec(foodId, sortKey) {
    let endpoint = ENDPOINT_FOODCOMPSPEC.replace("{foodId}", foodId);
    endpoint = endpoint.replace("{sortKey}", sortKey);

    let jsonResult = await fetchData(endpoint, null)

    return jsonResult;
}

async function getFood(foodId) {

    // hent al næring for fødevaren. alle kald er async og eksekveres parralet
    const energyKjJsonPromise = getFoodCompSpec(foodId, 1010);
    const energyCalJsonPromise = getFoodCompSpec(foodId, 1030);
    const proteinJsonPromise = getFoodCompSpec(foodId, 1110);
    const fiberJsonPromise = getFoodCompSpec(foodId, 1240);
    const fatJsonPromise = getFoodCompSpec(foodId, 1310);
    const carbJsonPromise = getFoodCompSpec(foodId, 1220);
    const waterJsonPromise = getFoodCompSpec(foodId, 1620);
    const dryMatterJsonPromise = getFoodCompSpec(foodId, 1610);

    //  vent til al næring er fetchet 
    const values = await Promise.all([energyKjJsonPromise, energyCalJsonPromise, proteinJsonPromise, fiberJsonPromise,fatJsonPromise,carbJsonPromise, waterJsonPromise,dryMatterJsonPromise])

    const food = new Food(foodId,0,
        parseFloat(values[0][0]?.resVal.replace(",",".") ?? 0),
        parseFloat(values[1][0]?.resVal.replace(",",".") ?? 0),
        parseFloat(values[2][0]?.resVal.replace(",",".") ?? 0),
        parseFloat(values[3][0]?.resVal.replace(",",".") ?? 0),
        parseFloat(values[4][0]?.resVal.replace(",",".") ?? 0),
        parseFloat(values[5][0]?.resVal.replace(",",".") ?? 0),
        "")

    return food
}
