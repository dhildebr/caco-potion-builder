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

/*
 * A comparison function for sorting ingredient entires. Returns -1 if the first
 * ingredient comes earlier, 1 if the second comes earlier, or 0 if the two
 * ingredients are the same.
 * 
 * Ingredients are sorted by the indices: name, effects, then mod source.
 * Effects in turn are sorted first by their name, then their magnitude.
 * 
 * PARAM leftIngr: the first compared ingredient
 * PARAM rightIngr: the second compared ingredient
 * RETURN -1 if the left ingredient comes before the second, 1 if the reverse if
 * true, or 0 if they're equal
 */
function compareIngredients(leftIngr, rightIngr)
{
  function strcmp(str1, str2)
  {
    let i, n;
    for(i = 0, n = Math.min(str1.length, str2.length);
        i < n && str1.charAt(i) == str2.charAt(i);
        ++i);
    
    if(i != n)
      return (str1.charAt(i) < str2.charAt(i)) ? -1 : 1;
    else if(i == n && str1.length != str2.length)
      return (str1.length < str2.length) ? -1 : 1;
    return 0;
  }
  
  let comp = strcmp(leftIngr.name, rightIngr.name);
  if(comp != 0) return comp;
  
  for(let i = 0; i < 4; ++i) {
    comp = strcmp(leftIngr.effects[i].name, rightIngr.effects[i].name);
    if(comp != 0) return comp;
    
    comp = leftIngr.effects[i].magnitude - rightIngr.effects[i].magnitude;
    if(comp != 0) return (comp < 0) ? -1 : 1;
  }
  
  comp = strcmp(leftIngr.modsrc, rightIngr.modsrc);
  return comp;
}

/*
 * Sorts the effects and ingredients lists, and if debugging is enabled, prints
 * info on malformed ingredient data to the console.
 * 
 * PARAM jsonData: the JSON object containing all the ingredient data
 * PARAM debug: whether to print debugging info
 */
function runIngredientDataBookkeeping(jsonData, debug = false)
{
  jsonData.effects.sort();
  jsonData.ingredients.sort(compareIngredients);
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
    emptyItem.textContent = "--";
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
