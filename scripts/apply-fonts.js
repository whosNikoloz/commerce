const fs = require('fs');
const path = require('path');

/**
 * Automated script to apply font classes to all components
 * Applies font-heading to h1-h6, font-primary to all other text
 */

// Files/folders to exclude
const EXCLUDE_PATTERNS = [
  '/admin/',
  '/debug/',
  '.test.',
  '.spec.',
  'node_modules',
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function applyFonts(content) {
  let modified = content;

  // 1. Add font-heading to h1-h6 tags (if not already present)
  for (let i = 1; i <= 6; i++) {
    // Match <h1 className="..." but not if it already has font-heading
    const regex = new RegExp(
      `<h${i}\\s+className="([^"]*?)(?<!font-heading)([^"]*)"`,
      'g'
    );
    modified = modified.replace(regex, (match, before, after) => {
      if (match.includes('font-heading')) return match;
      return `<h${i} className="font-heading ${before}${after}"`;
    });
  }

  // 2. Add font-primary to <p> tags
  modified = modified.replace(
    /<p\s+className="([^"]*?)(?<!font-primary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-primary')) return match;
      return `<p className="font-primary ${before}${after}"`;
    }
  );

  // 3. Add font-primary to <span> tags
  modified = modified.replace(
    /<span\s+className="([^"]*?)(?<!font-primary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-primary')) return match;
      return `<span className="font-primary ${before}${after}"`;
    }
  );

  // 4. Add font-primary to <label> tags
  modified = modified.replace(
    /<label\s+className="([^"]*?)(?<!font-primary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-primary')) return match;
      return `<label className="font-primary ${before}${after}"`;
    }
  );

  // 5. Add font-primary to <a> tags
  modified = modified.replace(
    /<a\s+className="([^"]*?)(?<!font-primary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-primary')) return match;
      return `<a className="font-primary ${before}${after}"`;
    }
  );

  // 6. Add font-primary to <button> tags
  modified = modified.replace(
    /<button\s+className="([^"]*?)(?<!font-primary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-primary')) return match;
      return `<button className="font-primary ${before}${after}"`;
    }
  );

  // 7. Add font-secondary to <code> tags
  modified = modified.replace(
    /<code\s+className="([^"]*?)(?<!font-secondary)([^"]*?)"/g,
    (match, before, after) => {
      if (match.includes('font-secondary')) return match;
      return `<code className="font-secondary ${before}${after}"`;
    }
  );

  return modified;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const modified = applyFonts(content);

    if (content !== modified) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  let updatedCount = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        updatedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (!shouldExclude(filePath)) {
        if (processFile(filePath)) {
          updatedCount++;
        }
      }
    }
  }

  return updatedCount;
}

// Main execution
console.log('🎨 Starting font application...\n');

const componentsDir = path.join(__dirname, '..', 'components');
const appDir = path.join(__dirname, '..', 'app');

console.log('Processing components folder...');
const componentsUpdated = walkDirectory(componentsDir);

console.log('\nProcessing app folder (excluding admin)...');
const appUpdated = walkDirectory(appDir);

const total = componentsUpdated + appUpdated;

console.log(`\n✨ Done! Updated ${total} files.`);
console.log('\n⚠️  IMPORTANT:');
console.log('1. Review the changes with git diff');
console.log('2. Test your app thoroughly');
console.log('3. Revert any unwanted changes');
