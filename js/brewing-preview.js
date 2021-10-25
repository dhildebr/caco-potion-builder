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
  
  // Set up the instructions, content to be determined later
  let brewingInstructionsElem = document.createElement("div");
  brewingInstructionsElem.id = "brewing-preview-instructions";
  brewingPreviewElems.appendChild(brewingInstructionsElem);
  
  // Display help text if too few/many ingredients are chosen
  if(ingredients.length < 2 || ingredients.length > 3) {
    brewingInstructionsElem.textContent = "Select 2\u{2013}3 ingredients to preview the result";
  }
  
  // If 2-3 ingredients are chosen, display their common effects
  else {
    let firstMagnitudes = new Map();
    let firstPercentiles = new Map();
    let bestCommonMagnitudes = new Map();
    let bestCommonPercentiles = new Map();
    
    // Build a map of names and magnitudes, writing also into bestCommonMagnitudes on the second and subsequent encounters
    ingredients.forEach(function(ingr) {
      ingr.effects.forEach(function(eff) {
        if(!firstMagnitudes.has(eff.name)) {
          firstMagnitudes.set(eff.name, eff.magnitude);
          firstPercentiles.set(eff.name, eff.percentile);
        }
        else if(!bestCommonMagnitudes.has(ingr.name)) {
          if(eff.magnitude > firstMagnitudes.get(eff.name)) {
            bestCommonMagnitudes.set(eff.name, eff.magnitude);
            bestCommonPercentiles.set(eff.name, eff.percentile);
          }
          else {
            bestCommonMagnitudes.set(eff.name, firstMagnitudes.get(eff.name));
            bestCommonPercentiles.set(eff.name, firstPercentiles.get(eff.name));
          }
        }
        else if(eff.magnitude > bestCommonMagnitudes.get(eff.name).magnitude) {
          bestCommonMagnitudes.get(eff.name).magnitude = eff.magnitude;
          bestCommonPercentiles.get(eff.name).percentile = eff.percentile;
        }
      });
    });
    
    // Determine instructions depending on whether matching effects were found
    brewingInstructionsElem.textContent = (bestCommonMagnitudes.size > 0) ?
      "Potion effects:" : "No matching effects" ;
    
    // Build the list of matching effects
    if(bestCommonMagnitudes.size > 0) {
      let brewingEffectsList = document.createElement("ul");
      brewingEffectsList.id = "brewing-preview-potion-effects";
      
      // Convert bestCommonMagnitudes into an array of key-value objects for sorting
      let matchingEffects = [];
      bestCommonMagnitudes.forEach(function(effMag, effName) {
        matchingEffects.push({
          name: effName,
          magnitude: effMag,
          percentile: bestCommonPercentiles.get(effName)
        });
      });
      matchingEffects.sort(compareIngredientEffects);
      
      matchingEffects.forEach(function(eff) {
        let matchingEffect = document.createElement("li");
        matchingEffect.classList.add("brewing-preview-effect-name");
        matchingEffect.textContent = eff.name;
        matchingEffect.setAttribute("data-name", eff.name);
        matchingEffect.setAttribute("data-magnitude", eff.magnitude);
        matchingEffect.setAttribute("data-percentile", eff.percentile);
        brewingEffectsList.appendChild(matchingEffect);
      });
      
      brewingPreviewElems.appendChild(brewingEffectsList);
    }
  }
  
  // Add tags showing which ingredients have been added
  let brewingTagsWrapper = document.createElement("ul");
  brewingTagsWrapper.id = "brewing-preview-ingredient-tags";
  ingredients.forEach(function(ingr) {
    let ingrTag = document.createElement("li");
    ingrTag.classList.add("brewing-preview-tag");
    ingrTag.textContent = ingr.name;
    ingrTag.setAttribute("data-name", ingr.name);
    ingrTag.setAttribute("data-effects", JSON.stringify(ingr.effects));
    ingrTag.setAttribute("data-percentile", ingr.percentile);
    brewingTagsWrapper.appendChild(ingrTag);
  });
  
  brewingPreviewElems.appendChild(brewingTagsWrapper);
  
  // Finalize all additions to the brewing preview
  brewingPreviewParent.appendChild(brewingPreviewElems);
}

/*
 * Adds the specified ingredient to the brewing preview, given a search results
 * tile element indicating it.
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
        effects: JSON.parse(tag.dataset.effects),
        percentile: tag.dataset.percentile
      });
    });
  }
  
  // Check to see if the new ingredient is already present
  let isIngrDuplicate = false;
  brewingTagsWrapper.querySelectorAll("li.brewing-preview-tag").forEach(function(tag) {
    if(ingrTile.querySelector("div.result-name").textContent == tag.dataset.name)
      isIngrDuplicate = true;
  });
  
  // If the new ingredient is not a duplicate, then add it to the list
  if(!isIngrDuplicate) {
    ingrTags.push({
      name: ingrTile.querySelector("div.result-name").textContent,
      effects: []
    });
    
    // Fill out the effects on the new entry
    ingrTile.querySelectorAll("div.result-effect").forEach(function(eff) {
      ingrTags[ingrTags.length - 1].effects.push({
        name: eff.dataset.name,
        magnitude: eff.dataset.magnitude,
        percentile: eff.dataset.percentile
      });
    });
  }
  
  // Draw the brewing preview with the new data
  generateBrewingPreview(ingrTags);
  
  // Rebuild the event listeners for clicking to remove tags
  brewingTagsWrapper = document.getElementById("brewing-preview-ingredient-tags");
  brewingTagsWrapper.querySelectorAll("li.brewing-preview-tag").forEach(function(tag) {
    tag.addEventListener("click", function(evt) {
      removeIngredientFromPreview(tag.dataset.name);
    });
  });
}

/*
 * Removes the specified ingredient from the brewing preview., given its name.
 * The first ingredient tag with a matching name, if any, will be removed - and
 * as duplicates cannot be inserted, this will be the only one.
 * 
 * PARAM ingrName: the name of the ingredient being removed
 */
function removeIngredientFromPreview(ingrName)
{
  let brewingTagsWrapper = document.getElementById("brewing-preview-ingredient-tags");
  let ingrTags = [];
  
  // Push on existing ingredient tags, minus any with the removed item's name
  if(brewingTagsWrapper != null) {
    brewingTagsWrapper.querySelectorAll("li.brewing-preview-tag").forEach(function(tag) {
      if(tag.dataset.name != ingrName) {
        ingrTags.push({
          name: tag.dataset.name,
          effects: JSON.parse(tag.dataset.effects)
        });
      }
    });
    
    // Re-generate the brewing preview
    generateBrewingPreview(ingrTags);
    
    // Rebuild the event listeners for clicking to remove tags
    brewingTagsWrapper = document.getElementById("brewing-preview-ingredient-tags");
    if(brewingTagsWrapper != null) {
      brewingTagsWrapper.querySelectorAll("li.brewing-preview-tag").forEach(function(tag) {
        tag.addEventListener("click", function(evt) {
          removeIngredientFromPreview(tag.dataset.name);
        });
      });
    }
  }
}
