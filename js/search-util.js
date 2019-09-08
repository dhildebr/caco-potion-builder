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
function runIngredientDataBookkeeping(jsonData, debug)
{
  jsonData.effects.sort();
  jsonData.ingredients.sort(compareIngredients);
  
  if(debug) {
    // Check for effects not used on any ingredient
    let unusedEffects = [];
    jsonData.effects.forEach(function(eff) {
      let isEffectUsed = false;
      jsonData.ingredients.forEach(function(ingr) {
        ingr.effects.forEach(function(ingrEffect) {
          if(ingrEffect.name == eff) {
            isEffectUsed = true;
            return;
          }
        });
        
        if(isEffectUsed)
          return;
      });
      
      if(!isEffectUsed)
        unusedEffects.push(eff);
    });
    
    // Print out the unused effects
    unusedEffects.forEach(function(effectName) {
      console.log(`Listed effect "${effectName}" is unused in ingredients list.`);
    });
    
    // Check for ingredients using unlisted effects
    let unlistedEffects = new Set();
    jsonData.ingredients.forEach(function(ingr) {
      ingr.effects.forEach(function(ingrEffect) {
        if(jsonData.effects.indexOf(ingrEffect.name) < 0)
          unlistedEffects.add(ingrEffect.name);
      });
    });
    
    // Print out the unlisted effects
    unlistedEffects.forEach(function(effectName) {
    console.log(`Ingredient effect "${effectName}" is unlisted in effects pool.`);
    });
  }
}