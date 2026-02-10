const fs = require('fs');

try {
    const raw = fs.readFileSync('scan_results.json', 'utf8');
    const data = JSON.parse(raw);
    const nodes = data.nodes || [];
    const links = data.edges || data.links || [];

    const stats = {};

    // Initialize stats
    nodes.forEach(n => {
        stats[n.id] = { in: 0, out: 0, orphan: true };
    });

    // Calculate Degrees
    links.forEach(l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;

        if (stats[src]) { stats[src].out++; stats[src].orphan = false; }
        if (stats[tgt]) { stats[tgt].in++; stats[tgt].orphan = false; }
    });

    // FIND ORPHANS (Dead Code)
    const orphans = Object.entries(stats)
        .filter(([id, s]) => s.in === 0 && s.out === 0)
        .map(([id]) => id);

    // SPECIFIC CHECK: CatalogPage
    const catalogStats = Object.entries(stats).find(([id]) => id.includes('CatalogPage'));

    console.log("--- SCAN ANALYSIS REPORT ---");
    console.log(`Total Nodes: ${nodes.length}`);
    console.log(`Total Links: ${links.length}`);
    console.log(`Orphans (Dead Files): ${orphans.length}`);
    
    if (orphans.length > 0) {
        console.log("\n[TOP 10 ORPHANS - 0 IN/0 OUT]");
        orphans.slice(0, 10).forEach(o => console.log(`- ${o}`));
    }

    const targetFile = 'src/presentation/components/HomeHero.tsx';
    const fileNode = nodes.find(n => n.id === targetFile);

    if (fileNode) {
        console.log(`\n[CODE CONTENT: ${targetFile}]`);
        // Print first 500 chars to prove access without flooding terminal
        console.log(fileNode.content.substring(0, 500) + "\n...[TRUNCATED]");
    } else {
        console.log(`\n[ERROR] File not found in scan: ${targetFile}`);
    }

} catch (e) {
    console.error("Analysis Failed:", e.message);
}
