/**
 * Changes the theme for the page based on the theme ID of the given element.
 * The element is expected to have an attribute "data-theme-id", and its value
 * must match with a set of theme color variables in _themes.scss. For example,
 * if a new theme has an ID of foobar, then there should be variables named
 * "--theme-foobar-background", "--theme-foobar-foreground", and so on.
 * 
 * PARAM themeButton: the theme bar button that has been clicked
 */
function changeTheme(themeButton)
{
  document.documentElement.style.setProperty("--color-background",
    `var(--theme-${themeButton.dataset.themeId}-background)`);
  document.documentElement.style.setProperty("--color-foreground",
    `var(--theme-${themeButton.dataset.themeId}-foreground)`);
  document.documentElement.style.setProperty("--color-form-background",
    `var(--theme-${themeButton.dataset.themeId}-form-background)`);
  document.documentElement.style.setProperty("--color-form-background-focus",
    `var(--theme-${themeButton.dataset.themeId}-form-background-focus)`);
  document.documentElement.style.setProperty("--color-border",
    `var(--theme-${themeButton.dataset.themeId}-border)`);
  document.documentElement.style.setProperty("--color-text",
    `var(--theme-${themeButton.dataset.themeId}-text)`);
}
