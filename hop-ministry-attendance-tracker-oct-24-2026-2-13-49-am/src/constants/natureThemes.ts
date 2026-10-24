/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Official Website Background & Imagery
 * 
 * Requirement: Use ONE consistent, high-quality photograph of a majestic lion
 * in its natural savanna habitat as the main background throughout the entire website.
 */

export const LION_BACKGROUND = {
  // Majestic African Lion with full mane on rocky savanna ridge at golden hour
  localUrl: '/backgrounds/lion-majestic.jpg',
  onlineUrl: '/backgrounds/lion-majestic.jpg',
  alt: 'Majestic African Lion in Natural Savanna Habitat - House of Power Ministry International Church, Mankessim',
};

// Aliased for backwards compatibility with any remaining eagle references
export const EAGLE_BACKGROUND = LION_BACKGROUND;

export const NATURE_ASSETS = {
  // Primary Lion Background throughout entire website
  lionMain: LION_BACKGROUND.localUrl,
  lionFallback: LION_BACKGROUND.onlineUrl,
  eagleMain: LION_BACKGROUND.localUrl,
  eagleFallback: LION_BACKGROUND.onlineUrl,

  // Kept for seamless component references
  splashNature: LION_BACKGROUND.localUrl,
  heroLandscape: LION_BACKGROUND.localUrl,
  loginNature: LION_BACKGROUND.localUrl,
  createAdminNature: LION_BACKGROUND.localUrl,

  // Wildlife & Nature accents
  savannaSunset: '/backgrounds/lion-majestic.jpg',
  sunriseMountains: '/backgrounds/lion-majestic.jpg',
  peacefulGarden: '/backgrounds/lion-majestic.jpg',
  peacefulSkies: '/backgrounds/lion-majestic.jpg',
};
