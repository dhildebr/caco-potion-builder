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
 * RETURN -1 if the left ingredient comes before the second, 1 if the reverse is
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

/*
 * Populates the results field with ingredients matching the name and effect
 * filters entered. If no filters of any kind are entered, all ingredients will
 * be returned indiscriminately.
 * 
 * PARAM jsonData: a reference back to the ingredient JSON object
 * PARAM resultsParent: the HTML element into which result tiles are inserted
 * PARAM searchbar: the name search text input, used in filtering results
 * PARAM effectFilters: an array of <select> elements for filtering by effect
 * PARAM modsrcToggles: an array of checkbox elements for filtering by mod source
 */
function populateSearchResults(jsonData, resultsParent, searchbar, effectFilters, modsrcToggles)
{
  resultsParent.innerHTML = "";
  let matchingIngredients = [];
  
  let acceptedModSources = ["vanilla", "caco"];
  modsrcToggles.forEach(function(srcCheckbox) {
    if(srcCheckbox.checked)
      acceptedModSources.push(srcCheckbox.dataset.modsrc);
  });
  
  // Build a list of all matching ingredients
  jsonData.ingredients.forEach(function(ingr) {
    let ingrMatches = true;
    
    // Only include results whose name contains the searchbar string
    if(searchbar.value.trim().length > 0 && !ingr.name.toLowerCase().includes(searchbar.value.toLowerCase()))
      ingrMatches = false;
    
    // Filter for effects, if any are selected
    for(let i = 0, n = Math.min(ingr.effects.length, effectFilters.length); i < n; ++i) {
      // Skip effect filter if nothing is selected
      if(effectFilters[i].value == "null")
        continue;
      
      // Otherwise, find any match for the effect filter
      let ingrHasEffect = false;
      ingr.effects.forEach(function(ingrEffect) {
        if(ingrEffect.name == effectFilters[i].value)
          ingrHasEffect = true;
      });
      
      // Discard the match if no effects match the filter
      ingrMatches = ingrMatches && ingrHasEffect;
    }
    
    // Filter based on mod source
    let isSourceIncluded = false;
    ingr.modsrc.split(",").forEach(function(src) {
      if(acceptedModSources.includes(src)) {
        isSourceIncluded = true;
      }
    });
    
    ingrMatches = ingrMatches && isSourceIncluded;
    
    if(ingrMatches)
      matchingIngredients.push(ingr);
  });
  
  // Add a new tile to the results area for each match
  if(matchingIngredients.length > 0) {
    let results = new DocumentFragment();
    matchingIngredients.forEach(function(ingr) {
      let resultContainer = document.createElement("div");
      resultContainer.classList.add("ingredient-search-result");
      results.appendChild(resultContainer);
      
      let resultName = document.createElement("div");
      resultName.classList.add("result-name");
      resultName.textContent = ingr.name;
      resultContainer.appendChild(resultName);
      
      let resultEffects = [
        document.createElement("div"), document.createElement("div"),
        document.createElement("div"), document.createElement("div")];
      resultEffects.forEach(function(rslt, index) {
        rslt.classList.add("result-effect");
        rslt.textContent = ingr.effects[index].name;
        rslt.setAttribute("data-name", ingr.effects[index].name);
        rslt.setAttribute("data-magnitude", ingr.effects[index].magnitude);
        resultContainer.appendChild(rslt);
      });
      
      resultContainer.addEventListener("click", function(evt) {
        addIngredientToPreview(resultContainer);
      });
      
      resultsParent.style.justifyContent = "flex-start";
      results.appendChild(resultContainer);
    });
    
    resultsParent.appendChild(results);
  }
  
  // If no matches are found, print a message with a sad little emoticon
  else {
    const emoticons = [
      ":(", ":c", ":'c", "XD", "-.-",
      "\u{AF}\\_(\u{30C4})_/\u{AF}", "\u{0CA0}_\u{0CA0}",
      "(\u{256F}\u{00B0}\u{25A1}\u{00B0})\u{256F} \u{FE35} \u{253B}\u{2501}\u{253B}"];
    const randomEmote = emoticons[Math.floor(Math.random() * emoticons.length)];
    
    resultsParent.style.justifyContent = "center";
    resultsParent.textContent = `No results found ${randomEmote}`;
  }
}

/*
 * Fills out the brewing preview with a list of all effects common to two or
 * more of the ingredient ties provided. These will be divs with the class
 * ingredient-search-result, with the expected name and effects child elements.
 * 
 * PARAM ingredients: a list of ingredients to mix
 */
function generateBrewingPreview(ingredients)
{
  let brewingPreviewParent = document.getElementById("brewing-preview-info");
  let brewingPreviewElems = new DocumentFragment();
  brewingPreviewParent.innerHTML = "";
  
  // Display instructions if too few/many ingredients are chosen
  if(ingredients.length < 2 || ingredients.length > 3) {
    let brewingInstructionsElem = document.createElement("div");
    brewingInstructionsElem.id = "brewing-preview-instructions";
    brewingInstructionsElem.textContent = "Select 2\u{2013}3 ingredients to preview the result";
    brewingPreviewElems.appendChild(brewingInstructionsElem);
  }
  
  // If 2-3 ingredients are chosen, display their common effects
  else {
    let allEffects = new Map();
    let bestEffects = new Map();
    
    // Build a map of names and magnitudes, writing also into bestEffects on the second and subsequent encounter
    ingredients.forEach(function(ingr) {
      ingr.effects.forEach(function(eff) {
        if(!allEffects.has(eff.name))
          allEffects.set(eff.name, eff.magnitude);
        else if(!bestEffects.has(ingr.name)) {
          bestEffects.set(eff.name, eff.magnitude);
        }
        else if(eff.magnitude > bestEffects.get(eff.name).magnitude) {
          bestEffects.get(eff.name).magnitude = eff.magnitude;
        }
      });
    });
    
    console.log(bestEffects);
    
  }
  
  // Add tags showing which ingredients have been added
  let brewingTagsWrapper = document.createElement("ul");
  brewingTagsWrapper.id = "brewing-preview-ingredient-tags";
  brewingPreviewElems.appendChild(brewingTagsWrapper);
  ingredients.forEach(function(ingr) {
    let ingrTag = document.createElement("li");
    ingrTag.classList.add("brewing-preview-tag");
    ingrTag.textContent = ingr.name;
    ingrTag.setAttribute("data-name", ingr.name);
    ingrTag.setAttribute("data-effects", JSON.stringify(ingr.effects));
    brewingTagsWrapper.appendChild(ingrTag);
  });
  
  // Finalize all additions to the brewing preview
  brewingPreviewParent.appendChild(brewingPreviewElems);
}

/*
 * Adds the specified ingredient to the brewing preview.
 * 
 * PARAM ingredientTile: the tile element for the ingredient to be added
 */
function addIngredientToPreview(ingrTile)
{
  let brewingTagsWrapper = document.getElementById("brewing-preview-ingredient-tags");
  let ingrTags = [];
  
  // Push on any existing ingredient tags
  if(brewingTagsWrapper != null) {
    brewingTagsWrapper.querySelectorAll("li.brewing-preview-tag").forEach(function(tag) {
      ingrTags.push({
        name: tag.dataset.name,
        effects: JSON.parse(tag.dataset.effects)
      });
    });
  }
  
  // Add the new tag to the list
  ingrTags.push({
    name: ingrTile.querySelector("div.result-name").textContent,
    effects: []
  });
  
  // Fill out the effects on the new entry
  ingrTile.querySelectorAll("div.result-effect").forEach(function(eff) {
    ingrTags[ingrTags.length - 1].effects.push({
      name: eff.dataset.name,
      magnitude: eff.dataset.magnitude
    });
  });
  
  // Draw the brewing preview with the new data
  generateBrewingPreview(ingrTags);
}

/*
 * Removes the specified ingredient from the brewing preview.
 * 
 * PARAM ingrTag: the tag element for the removed ingredient
 */
function removeIngredientFromPreview(ingrTag)
{
  
}
