
const fs = require('fs');
const path = require('path');

const cyberpunkDir = '/Users/douglas/Code/Projects/ProjectFresh-Hub/static/3d-models/Cyberpunk Game Kit-glb';
const spaceDir = '/Users/douglas/Code/Projects/ProjectFresh-Hub/static/3d-models/Ultimate Space Kit-glb';

function getEntries(dir, category, urlPrefix) {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.glb'))
    .map(file => ({
      name: file.replace('.glb', ''),
      path: `${urlPrefix}/${file}`,
      category: category
    }));
}

const cyberpunkEntries = getEntries(cyberpunkDir, 'Space', '/3d-models/Cyberpunk Game Kit-glb');
const spaceEntries = getEntries(spaceDir, 'Space', '/3d-models/Ultimate Space Kit-glb');

const newEntries = [...cyberpunkEntries, ...spaceEntries];

console.log(JSON.stringify(newEntries, null, 2));
