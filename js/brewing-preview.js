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
    let allEffects = new Map();
    let bestEffects = new Map();
    
    // Build a map of names and magnitudes, writing also into bestEffects on the second and subsequent encounters
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
    
    // Deterine instructions depending on whether matching effects were found
    brewingInstructionsElem.textContent = (bestEffects.size > 0) ?
      "Potion effects:" : "No matching effects" ;
    
    // Build the list of matching effects
    if(bestEffects.size > 0) {
      let brewingEffectsList = document.createElement("ul");
      brewingEffectsList.id = "brewing-preview-potion-effects";
      
      // Convert bestEffects into an array of key-value objects for sorting
      let matchingEffects = [];
      bestEffects.forEach(function(effMag, effName) {
        matchingEffects.push({
          "name": effName,
          "magnitude": effMag
        });
      });
      matchingEffects.sort(compareIngredientEffects);
      
      matchingEffects.forEach(function(eff) {
        let matchingEffect = document.createElement("li");
        matchingEffect.classList.add("brewing-preview-effect-name");
        matchingEffect.textContent = eff.name;
        matchingEffect.setAttribute("data-name", eff.name);
        matchingEffect.setAttribute("data-magnitude", eff.magnitude);
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
    brewingTagsWrapper.appendChild(ingrTag);
  });
  
  brewingPreviewElems.appendChild(brewingTagsWrapper);
  
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
