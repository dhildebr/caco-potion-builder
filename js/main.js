// The path to the all-important ingredient data JSON document
const ingredientDataPath = "https://dhildebr.github.io/caco-potion-builder/caco-ingredients.json";

// Whether to print debug info on mismatched effects, etc.
const debugJson = true;

//********************************************************************************************************************//

/*
 * Sends an HTTP request for the specified JSON document, and invokes the given
 * callback function on  the received data.
 * 
 * PARAM url: the URL where the JSON document is to be found
 * PARAM callback the callback function invoked on the received data
 */
function requestJsonData(url, callback)
{
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", url, true);
  
  xobj.onreadystatechange = function() {
    if(xobj.readyState == xobj.DONE && xobj.status == "200")
      callback(xobj.responseText);
  };
  
  xobj.send();
}

//********************************************************************************************************************//
//**                                      Main execution code commences below                                       **//
//********************************************************************************************************************//

requestJsonData(ingredientDataPath, function(response) {
  let ingredientData = JSON.parse(response);
  let searchbar = document.getElementById("ingredient-search-field");
  let searchbarSuggestions = document.getElementById("ingredient-search-suggestions");
  let effectFilters = [
    document.getElementById("ingredient-effects-dropdown-01"),
    document.getElementById("ingredient-effects-dropdown-02"),
    document.getElementById("ingredient-effects-dropdown-03"),
    document.getElementById("ingredient-effects-dropdown-04"),
  ];
  
  runIngredientDataBookkeeping(ingredientData, debugJson);
  
  // Populate the searchbar suggestions datalist all with ingredient names
  let searchDataList = new DocumentFragment();
  ingredientData.ingredients.forEach(function(ingr) {
    let item = document.createElement("option");
    item.setAttribute("value", ingr.name);
    searchDataList.appendChild(item);
  });
  
  searchbarSuggestions.appendChild(searchDataList);
  
  // Populate the dropdown menus with all ingredient effects
  effectFilters.forEach(function(dropdown) {
    let optionsList = new DocumentFragment();
    let emptyItem = document.createElement("option");
    emptyItem.setAttribute("value", "null");
    emptyItem.textContent = "Select an effect\u{2026}";
    optionsList.appendChild(emptyItem);
    
    ingredientData.effects.forEach(function(effect) {
      let item = document.createElement("option");
      item.setAttribute("value", effect);
      item.textContent = effect;
      optionsList.appendChild(item);
    });
    
    dropdown.appendChild(optionsList);
  });
});
