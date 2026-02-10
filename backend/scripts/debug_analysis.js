
// I'll just copy the relevant part of getAnalysis to a test script
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const determineLayer = (filePath, content) => {
    const lowerContent = content.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    const ext = path.extname(filePath);
    if (lowerPath.includes('app.tsx') || lowerPath.includes('main.tsx')) return 'Application';
    if (ext === '.tsx' || ext === '.jsx' || lowerContent.includes('react')) return 'Presentation';
    if (lowerContent.includes('axios') || lowerContent.includes('repository') || lowerContent.includes('api')) return 'Infrastructure';
    if (lowerContent.includes('usecase') || lowerContent.includes('execute(') || lowerContent.includes('service')) return 'Application';
    if (lowerContent.includes('interface') || lowerContent.includes('entity')) {
        if (!lowerContent.includes('react') && !lowerContent.includes('axios')) return 'Domain';
    }
    return 'Other';
};

function getAnalysisTest() {
    const srcPath = path.join(projectRoot, 'src');
    const nodes = [];
    const edges = [];

    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir).forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
        if (fs.statSync(fullPath).isDirectory()) {
          if (item !== 'node_modules' && !item.startsWith('.')) scanDir(fullPath);
        } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                nodes.push({ id: relPath, label: item, category: determineLayer(relPath, content), content });
            } catch (e) { }
        }
      });
    };

    scanDir(srcPath);

    nodes.forEach(node => {
      const importRegex = /from\s+['"](\..*)['"]/g;
      let match;
      node.outDegree = 0;
      node.inDegree = 0;

      while ((match = importRegex.exec(node.content)) !== null) {
        node.outDegree++;
        const targetRel = path.join(path.dirname(node.id), match[1]).replace(/\\/g, '/');
        // Check if target exists with extensions
        const target = nodes.find(n => n.id.startsWith(targetRel));
        if (target) {
            edges.push({ source: node.id, target: target.id, value: 1 });
        }
      }
      // delete node.content; // Keep for now
    });

    edges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode) targetNode.inDegree++;
    });

    nodes.forEach(node => {
        node.criticality = (node.inDegree || 0) + (node.outDegree || 0);
    });

    return { nodes, edges };
}

const data = getAnalysisTest();
const targetNode = data.nodes.find(n => n.id.includes('App.tsx'));
console.log('App Node Details:', JSON.stringify({
    id: targetNode.id,
    inDegree: targetNode.inDegree,
    outDegree: targetNode.outDegree,
    criticality: targetNode.criticality
}, null, 2));

const importers = data.edges.filter(e => e.target === targetNode.id);
console.log(`Found ${importers.length} importers.`);
importers.slice(0, 5).forEach(e => console.log(' - ' + e.source));
