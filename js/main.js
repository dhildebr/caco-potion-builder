function loadIngredientJsonData(path, callback)
{
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", ingredientDataPath, true);
  
  xobj.onreadystatechange = function() {
    if(xobj.readyState == 4 && xobj.status == "200")
      callback(xobj.responseText);
  };
  
  xobj.send(null);
}

const ingredientDataPath = "https://dhildebr.github.io/caco-potion-builder/caco-ingredients.json";
let ingredientDataJson = null;

loadIngredientJsonData(function(response) {
  ingredientDataJson = JSON.parse(response);
});

console.log(ingredientDataJson);
