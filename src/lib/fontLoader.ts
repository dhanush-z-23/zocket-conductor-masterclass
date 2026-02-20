const loadedFonts = new Set<string>();

const SYSTEM_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Palatino Linotype',
  'Garamond',
];

const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Raleway',
  'Oswald',
  'Source Sans 3',
  'Nunito',
  'PT Sans',
  'Work Sans',
  'Libre Baskerville',
  'DM Sans',
  'Space Grotesk',
  'Bebas Neue',
];

export const ALL_FONTS = [...SYSTEM_FONTS, ...GOOGLE_FONTS];

export function isSystemFont(fontFamily: string): boolean {
  return SYSTEM_FONTS.includes(fontFamily);
}

export async function loadFont(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily) || isSystemFont(fontFamily)) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  try {
    await document.fonts.load(`16px "${fontFamily}"`);
    loadedFonts.add(fontFamily);
  } catch {
    // Font loading failed silently
  }
}

export async function loadAllGoogleFonts(): Promise<void> {
  const families = GOOGLE_FONTS.map((f) => f.replace(/ /g, '+')).join('&family=');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  await Promise.allSettled(
    GOOGLE_FONTS.map((f) => document.fonts.load(`16px "${f}"`))
  );
  GOOGLE_FONTS.forEach((f) => loadedFonts.add(f));
}
