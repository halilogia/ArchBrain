const fs = require('fs');
const path = require('path');

/**
 * ArchBrain Core Scanner Engine v1.0
 * Herhangi bir projeyi tarayıp 3D Nöral Ağ verisi üretir.
 */

class ArchBrainScanner {
    constructor(targetDir) {
        this.targetDir = targetDir;
        this.nodes = [];
        this.edges = [];
        this.fileMap = new Map();
    }

    // Dosyaları rekürsif olarak tarar
    async scan() {
        console.log(`🚀 Scanning project at: ${this.targetDir}`);
        const files = this.getAllFiles(this.targetDir);
        
        // İlk faz: Tüm dosyaları düğüm (node) olarak kaydet
        files.forEach(file => {
            const ext = path.extname(file);
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                const relativePath = path.relative(this.targetDir, file);
                const category = this.determineCategory(relativePath);
                
                const node = {
                    id: relativePath,
                    label: path.basename(file),
                    category: category,
                    size: fs.statSync(file).size
                };
                
                this.nodes.push(node);
                this.fileMap.set(relativePath, node);
            }
        });

        // İkinci faz: İlişkileri (edges) çıkar
        this.nodes.forEach(node => {
            const fullPath = path.join(this.targetDir, node.id);
            const content = fs.readFileSync(fullPath, 'utf8');
            this.extractImports(node.id, content);
        });

        const result = {
            metadata: {
                projectPath: this.targetDir,
                scanTime: new Date().toISOString(),
                totalNodes: this.nodes.length,
                totalEdges: this.edges.length
            },
            nodes: this.nodes,
            edges: this.edges
        };

        const outputPath = path.join(process.cwd(), 'public', 'brain-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`✅ Brain Data generated: ${outputPath}`);
    }

    getAllFiles(dirPath, arrayOfFiles = []) {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!file.includes('node_modules') && !file.startsWith('.')) {
                    arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    }

    determineCategory(filePath) {
        const p = filePath.toLowerCase().replace(/\\/g, '/');
        if (p.includes('/domain/') || p.includes('/entities/') || p.includes('/models/')) return 'Domain';
        if (p.includes('/infrastructure/') || p.includes('/infra/') || p.includes('/data/')) return 'Infra';
        if (p.includes('/application/') || p.includes('/usecases/')) return 'App';
        if (p.includes('/pages/')) return 'Page';
        if (p.includes('/components/')) return 'Component';
        if (p.includes('/hooks/')) return 'Hook';
        if (p.includes('/context/') || p.includes('/state/')) return 'State';
        return 'Other';
    }

    extractImports(sourceId, content) {
        const importRegex = /import\s+(?:.*\s+from\s+)?['"](.*)['"]/g;
        let match;
        const sourceDir = path.dirname(path.join(this.targetDir, sourceId));

        while ((match = importRegex.exec(content)) !== null) {
            let targetPath = match[1];

            if (targetPath.startsWith('.')) {
                const fullTargetPath = path.resolve(sourceDir, targetPath);
                const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
                let resolvedId = null;

                for (const ext of extensions) {
                    const checkPath = fullTargetPath + ext;
                    const relPath = path.relative(this.targetDir, checkPath);
                    if (this.fileMap.has(relPath)) {
                        resolvedId = relPath;
                        break;
                    }
                }

                if (resolvedId) {
                    this.edges.push({
                        source: sourceId,
                        target: resolvedId,
                        type: 'dependency'
                    });
                }
            }
        }
    }

    generateReport() {
        const gDataJSON = JSON.stringify({ 
            nodes: this.nodes, 
            links: this.edges.map(e => ({ source: e.source, target: e.target })) 
        });

        const reportTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>ArchBrain Neural Report</title>
    <style>
        body { margin: 0; background: #020617; color: white; font-family: sans-serif; overflow: hidden; }
        #info { position: absolute; top: 25px; left: 25px; z-index: 100; pointer-events: none; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .badge { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        h1 { margin: 10px 0 0 0; font-size: 28px; }
        #stats { opacity: 0.7; font-size: 14px; margin-top: 5px; }
    </style>
    <script src="https://unpkg.com/3d-force-graph"></script>
</head>
<body>
    <div id="3d-graph"></div>

    <script>
        const colorMap = {
            'Domain': '#ef4444',
            'Infra': '#10b981',
            'App': '#f59e0b',
            'Page': '#3b82f6',
            'Component': '#60a5fa',
            'Hook': '#a855f7',
            'State': '#ec4899',
            'Other': '#64748b'
        };

        const gData = ${gDataJSON};

        const Graph = ForceGraph3D()
            (document.getElementById('3d-graph'))
            .graphData(gData)
            .nodeLabel(node => {
                const color = colorMap[node.category] || '#fff';
                return '<div style="padding: 12px; background: rgba(0,0,0,0.9); border-radius: 8px; border-left: 4px solid ' + color + ';">' +
                    '<b style="font-size: 14px; display: block; margin-bottom: 4px;">' + node.label + '</b>' +
                    '<span style="color:' + color + '; font-weight: bold; font-size: 11px;">' + node.category + '</span>' +
                '</div>';
            })
            .nodeColor(node => colorMap[node.category] || '#ffffff')
            .nodeRelSize(7)
            .nodeVal(node => Math.sqrt(node.size) * 0.05 + 1)
            .linkWidth(1.5)
            .linkOpacity(0.5)
            .linkColor(() => '#ffffff')
            .linkDirectionalParticles(2)
            .linkDirectionalParticleSpeed(0.004)
            .backgroundColor('#020617');

        Graph.d3Force('charge').strength(-200);
        Graph.d3Force('link').distance(120);
    </script>
</body>
</html>`;

        const outputPath = path.join(process.cwd(), 'public', 'arch-brain-report.html');
        fs.writeFileSync(outputPath, reportTemplate);
        console.log('✨ Interaktif 3D Rapor Oluşturuldu: ' + outputPath);
    }
}

const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'src');
const scanner = new ArchBrainScanner(target);
scanner.scan().then(() => scanner.generateReport());

module.exports = { ArchBrainScanner };
