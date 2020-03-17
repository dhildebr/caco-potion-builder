/*
 * A comparison function for common strings. Each pair of characters in either
 * string is successively compared, with the earlier differing character
 * determining ordering. If both strings are the same up through the end of the
 * shorter one, then the shorter string comes first.
 * 
 * PARAM str1: the first string to be compared
 * PARAM str2: the second string to be compared
 * RETURN -1 if str1 comes first; 1 if str2 comes first; otherwise, returns 0
 * when the strings are equal
 */
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
 * A comparison function for sorting individual ingredient effects. Effects are
 * sorted first based on their string property, "name", then by their numerical
 * "magnitude" property.
 * 
 * PARAM leftEffect: the first effect being compared
 * PARAM rightEffect: the second effect being compared
 * RETURN -1 if the left effect comes first, 1 if the reverse is true, or 0 if
 * they're equal
 */
function compareIngredientEffects(leftEffect, rightEffect)
{
  let comp = strcmp(leftEffect.name, rightEffect.name);
  if(comp != 0) return comp;
  
  comp = leftEffect.magnitude - rightEffect.magnitude;
  if(comp != 0) return (comp < 0) ? -1 : 1 ;
  return 0;
}
