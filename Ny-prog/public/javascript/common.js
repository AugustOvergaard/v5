function showElement(id) {
    document.getElementById(id).style.display = "block";
}

function hideElement(id) {
    document.getElementById(id).style.display = "none";
}

function insertAfter(htmlElementId, stringToInsert) {
    document.getElementById(htmlElementId).insertAdjacentHTML("beforeend", stringToInsert)
}

function  clearInnerHTML(htmlElementId) {
    document.getElementById(htmlElementId).innerHTML = '';
}
