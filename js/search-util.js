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
  
  // Build a map of all magnitude values for each effect
  let effectMagnitudes = new Map();
  jsonData.effects.forEach(function(eff) {
    effectMagnitudes.set(eff, []);
  });
  
  jsonData.ingredients.forEach(function(ingr) {
    ingr.effects.forEach(function(eff) {
      if(effectMagnitudes.get(eff.name).indexOf(eff.magnitude) < 0)
        effectMagnitudes.get(eff.name).push(Number(eff.magnitude));
    });
  });
  
  // Sort the magnitude data
  effectMagnitudes.forEach(function(effMags, effName) {
    effMags.sort(function(leftNum, rightNum) {
      return leftNum - rightNum;
    });
  });
  
  // Calculate the percentile data for each ingredient's effects
  jsonData.ingredients.forEach(function(ingr) {
    ingr.effects.forEach(function(eff) {
      let indexFromOne = (effectMagnitudes.get(eff.name).indexOf(eff.magnitude) + 1);
      eff.percentile = Math.trunc((indexFromOne) / effectMagnitudes.get(eff.name).length * 100.0);
      switch(eff.percentile % 10) {
        case 1: eff.percentile += "st"; break;
        case 2: eff.percentile += "nd"; break;
        case 3: eff.percentile += "rd"; break;
        default: eff.percentile += "th";
      }
    });
  });
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
        rslt.setAttribute("data-percentile", ingr.effects[index].percentile);
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
