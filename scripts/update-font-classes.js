const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Font class mappings
const FONT_REPLACEMENTS = [
  // Replace font-sans with font-primary (body text)
  { from: /className={\s*["']([^"']*?)font-sans([^"']*?)["']/g, to: 'className={"$1font-primary$2"}' },
  { from: /className=["']([^"']*?)font-sans([^"']*?)["']/g, to: 'className="$1font-primary$2"' },

  // Replace font-serif with font-heading for headings
  { from: /className={\s*["']([^"']*?)font-serif([^"']*?)["']/g, to: 'className={"$1font-heading$2"}' },
  { from: /className=["']([^"']*?)font-serif([^"']*?)["']/g, to: 'className="$1font-heading$2"' },

  // Replace font-mono with font-secondary for code
  { from: /className={\s*["']([^"']*?)font-mono([^"']*?)["']/g, to: 'className={"$1font-secondary$2"}' },
  { from: /className=["']([^"']*?)font-mono([^"']*?)["']/g, to: 'className="$1font-secondary$2"' },

  // Add font-heading to heading elements that don't have font classes
  { from: /(<h[1-6][^>]*className={"?)([^"}]*?)("?[^}]*}>)/g, to: '$1$2 font-heading$3' },
  { from: /(<h[1-6][^>]*className=")([^"]*?)("[^>]*>)/g, to: '$1$2 font-heading$3' },
];

// Specific text size replacements for better typography
const TEXT_SIZE_IMPROVEMENTS = [
  // Large headings should be more prominent
  { from: /text-2xl/g, to: 'text-3xl font-heading' },
  { from: /text-3xl/g, to: 'text-4xl font-heading' },
  { from: /text-4xl/g, to: 'text-5xl font-heading' },

  // Ensure body text uses primary font
  { from: /text-lg(?!\w)/g, to: 'text-lg font-primary' },
  { from: /text-xl(?!\w)/g, to: 'text-xl font-primary' },
];

function updateFileWithFontClasses(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply font replacements
    FONT_REPLACEMENTS.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    // Apply text size improvements (commented out to be conservative)
    // TEXT_SIZE_IMPROVEMENTS.forEach(({ from, to }) => {
    //   if (from.test(content)) {
    //     content = content.replace(from, to);
    //     modified = true;
    //   }
    // });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

function findAndUpdateComponents() {
  const componentPaths = [
    'components/**/*.{tsx,ts,jsx,js}',
    'app/**/*.{tsx,ts,jsx,js}',
    '!node_modules/**',
    '!.next/**',
    '!scripts/**',
  ];

  let totalUpdated = 0;

  componentPaths.forEach(pattern => {
    if (pattern.startsWith('!')) return; // Skip exclusion patterns

    const files = glob.sync(pattern, { cwd: process.cwd() });
    console.log(`Found ${files.length} files matching ${pattern}`);

    files.forEach(file => {
      if (updateFileWithFontClasses(file)) {
        totalUpdated++;
      }
    });
  });

  console.log(`\n✅ Updated ${totalUpdated} files with dynamic font classes`);
}

// Run the update
console.log('🔄 Updating font classes across components...\n');
findAndUpdateComponents();