const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine repo URL
const repoUrl =
  process.env.REPO_URL ||
  (process.env.GITHUB_REPOSITORY
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
    : 'https://github.com/Learn-with-Sumit/rnext-5-assignments');

// Path to README.md
const readmePath = path.resolve(__dirname, '../../README.md');

// Fetch remote branches if git is available
try {
  execSync('git fetch --all --prune', { stdio: 'ignore' });
} catch (e) {
  // If offline or git fetch fails, continue with available branches
}

// Get list of remote branches
let branchOutput = '';
try {
  branchOutput = execSync('git branch -r', { encoding: 'utf-8' });
} catch (e) {
  console.warn('Warning: Could not run "git branch -r":', e.message);
}

const branches = new Set();

branchOutput
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .forEach((line) => {
    // Ignore HEAD reference
    if (line.includes('HEAD ->')) return;

    // Clean prefix like origin/ or remotes/origin/
    const cleanBranch = line
      .replace(/^remotes\/origin\//, '')
      .replace(/^origin\//, '')
      .trim();

    if (
      cleanBranch &&
      cleanBranch !== 'main' &&
      cleanBranch !== 'master' &&
      cleanBranch !== 'gh-pages'
    ) {
      branches.add(cleanBranch);
    }
  });

// Also include NEW_BRANCH from environment if provided (e.g. from GitHub Actions create event)
const newBranch = (process.env.NEW_BRANCH || '').trim();
if (
  newBranch &&
  newBranch !== 'main' &&
  newBranch !== 'master' &&
  newBranch !== 'gh-pages'
) {
  branches.add(newBranch);
}

// Also support CLI argument: node update-readme.js <branch-name>
const argBranch = (process.argv[2] || '').trim();
if (
  argBranch &&
  argBranch !== 'main' &&
  argBranch !== 'master' &&
  argBranch !== 'gh-pages'
) {
  branches.add(argBranch);
}

// Natural numeric sort so assignment-10 comes after assignment-9, not after assignment-1
const sortedBranches = Array.from(branches).sort((a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
});

console.log('Detected assignment branches:', sortedBranches);

// Generate Markdown Table
let tableContent = '| BRANCH | INSTRUCTIONS |\n| :--- | :--- |\n';
if (sortedBranches.length === 0) {
  tableContent += '| *No assignment branches found* | - |\n';
} else {
  for (const branch of sortedBranches) {
    const cloneCmd = `git clone --branch ${branch} --single-branch ${repoUrl}`;
    tableContent += `| \`${branch}\` | \`${cloneCmd}\` |\n`;
  }
}

// Read README.md
if (!fs.existsSync(readmePath)) {
  console.error(`Error: README.md not found at ${readmePath}`);
  process.exit(1);
}

const readme = fs.readFileSync(readmePath, 'utf-8');

const startMarker = '<!-- BRANCHES_TABLE_START -->';
const endMarker = '<!-- BRANCHES_TABLE_END -->';

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error(`Error: Markers ${startMarker} and/or ${endMarker} not found in README.md`);
  process.exit(1);
}

const before = readme.substring(0, startIndex + startMarker.length);
const after = readme.substring(endIndex);

const updatedReadme = `${before}\n${tableContent}${after}`;

if (readme === updatedReadme) {
  console.log('README.md is already up to date.');
} else {
  fs.writeFileSync(readmePath, updatedReadme, 'utf-8');
  console.log('Successfully updated README.md with branch clone instructions!');
}
