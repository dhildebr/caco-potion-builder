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
