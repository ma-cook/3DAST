const { MarkdownProcessor, AST3DGenerator } = require('./dist/src/index.js');
const fs = require('fs');

console.log(
  '🔍 COMPREHENSIVE DEBUG: Why only planes render and connections come from [0,0,0]'
);
console.log('='.repeat(80));

// Read your original app architecture file
const markdownContent = fs.readFileSync(
  './examples/app-architecture-fixed.md',
  'utf-8'
);

console.log('\n1️⃣ TESTING WRONG CONFIG (what you might be using)');
console.log('-'.repeat(50));

const wrongGenerator = new AST3DGenerator({
  layout: {
    algorithm: 'hierarchical',
    spacing: 80, // ❌ WRONG: should be 'nodeSpacing'
  },
});

const processor = new MarkdownProcessor();
const blocks = processor.extractAST3DBlocks(markdownContent);

if (blocks.length > 0) {
  try {
    const wrongResult = wrongGenerator.generate(blocks[0].content);
    const wrongData = wrongResult.toJSON();

    console.log(`❌ WRONG CONFIG RESULTS:`);
    console.log(`Total nodes: ${wrongData.nodes.length}`);

    const sampleNode = wrongData.nodes[0];
    console.log(
      `Sample node positions: [${sampleNode.transform.position.x}, ${sampleNode.transform.position.y}, ${sampleNode.transform.position.z}]`
    );
    console.log(`Sample node type: "${sampleNode.type}"`);
    console.log(`Sample node geometry: "${sampleNode.geometry}"`);

    const sampleConn = wrongData.connections[0];
    console.log(`Sample connection anchors:`);
    console.log(
      `  Source: [${sampleConn.source.anchor.x}, ${sampleConn.source.anchor.y}, ${sampleConn.source.anchor.z}]`
    );
    console.log(
      `  Target: [${sampleConn.target.anchor.x}, ${sampleConn.target.anchor.y}, ${sampleConn.target.anchor.z}]`
    );

    // Show what ObjectRenderer would do
    let renderAs = 'NULL (not rendered)';
    if (sampleNode.type === 'cube') renderAs = 'CUBE';
    else if (sampleNode.type === 'tetrahedron') renderAs = 'TETRAHEDRON';
    else if (sampleNode.type === 'sphere') renderAs = 'SPHERE';
    else if (sampleNode.type === 'plane') renderAs = 'PLANE';
    else if (sampleNode.type === 'text') renderAs = 'TEXT';
    else if (sampleNode.type === 'model') renderAs = 'MODEL';

    console.log(`ObjectRenderer would render as: ${renderAs}`);
  } catch (error) {
    console.log(`❌ ERROR with wrong config: ${error.message}`);
  }
}

console.log('\n2️⃣ TESTING CORRECT CONFIG');
console.log('-'.repeat(50));

const correctGenerator = new AST3DGenerator({
  layout: {
    algorithm: 'grid', // Better for visualization
    nodeSpacing: 100, // ✅ CORRECT: 'nodeSpacing' not 'spacing'
  },
});

if (blocks.length > 0) {
  try {
    const correctResult = correctGenerator.generate(blocks[0].content);
    const correctData = correctResult.toJSON();

    console.log(`✅ CORRECT CONFIG RESULTS:`);
    console.log(`Total nodes: ${correctData.nodes.length}`);

    const sampleNode = correctData.nodes[0];
    console.log(
      `Sample node positions: [${sampleNode.transform.position.x}, ${sampleNode.transform.position.y}, ${sampleNode.transform.position.z}]`
    );
    console.log(`Sample node type: "${sampleNode.type}"`);
    console.log(`Sample node geometry: "${sampleNode.geometry}"`);

    const sampleConn = correctData.connections[0];
    console.log(`Sample connection anchors:`);
    console.log(
      `  Source: [${sampleConn.source.anchor.x}, ${sampleConn.source.anchor.y}, ${sampleConn.source.anchor.z}]`
    );
    console.log(
      `  Target: [${sampleConn.target.anchor.x}, ${sampleConn.target.anchor.y}, ${sampleConn.target.anchor.z}]`
    );

    console.log('\n3️⃣ WHAT YOUR APPLICATION NEEDS TO DO');
    console.log('-'.repeat(50));

    console.log('Your application processes AST nodes like this:');
    console.log('');
    console.log('// ❌ CURRENT (BROKEN):');
    console.log('objects.map(obj => <ObjectRenderer obj={obj} ... />)');
    console.log('// where obj.type = "component" (doesn\'t match any case)');
    console.log('');
    console.log('// ✅ FIXED:');
    console.log('const processedObjects = astNodes.map(node => ({');
    console.log('  ...node,');
    console.log(
      `  type: node.geometry,  // "${sampleNode.geometry}" instead of "${sampleNode.type}"`
    );
    console.log('  position: [');
    console.log('    node.transform.position.x,');
    console.log('    node.transform.position.y,');
    console.log('    node.transform.position.z');
    console.log('  ],');
    console.log('  scale: [');
    console.log('    node.transform.scale.x,');
    console.log('    node.transform.scale.y,');
    console.log('    node.transform.scale.z');
    console.log('  ]');
    console.log('}));');
    console.log('');
    console.log(
      'objects = processedObjects.map(obj => <ObjectRenderer obj={obj} ... />)'
    );

    console.log('\n4️⃣ WHAT THIS WILL FIX');
    console.log('-'.repeat(50));

    // Show what would render with the fix
    const geometryToTypeMap = {
      cube: 'CUBE',
      tetrahedron: 'TETRAHEDRON',
      sphere: 'SPHERE',
      dodecahedron: 'SPHERE (Dodecahedron)',
      plane: 'PLANE',
      text: 'TEXT',
    };

    const geometryCounts = {};
    correctData.nodes.forEach((node) => {
      geometryCounts[node.geometry] = (geometryCounts[node.geometry] || 0) + 1;
    });

    console.log("With the fix, you'll render:");
    Object.entries(geometryCounts).forEach(([geometry, count]) => {
      const renderType = geometryToTypeMap[geometry] || 'UNKNOWN';
      console.log(`  ${count} ${renderType} objects (geometry: ${geometry})`);
    });

    console.log('\n5️⃣ CONNECTION POSITIONING FIX');
    console.log('-'.repeat(50));

    const validConnections = correctData.connections.filter(
      (conn) => conn.source.anchor.x !== null && conn.target.anchor.x !== null
    ).length;

    console.log(
      `✅ ${validConnections}/${correctData.connections.length} connections have valid anchors`
    );
    console.log(
      'Connections will go FROM object TO object instead of from [0,0,0]'
    );

    // Calculate sample distances
    const conn1 = correctData.connections[0];
    const dx = conn1.target.anchor.x - conn1.source.anchor.x;
    const dy = conn1.target.anchor.y - conn1.source.anchor.y;
    const dz = conn1.target.anchor.z - conn1.source.anchor.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    console.log(
      `Sample connection distance: ${distance.toFixed(1)} units (not 0)`
    );
  } catch (error) {
    console.log(`❌ ERROR with correct config: ${error.message}`);
  }
}

console.log('\n🎯 SUMMARY');
console.log('='.repeat(80));
console.log('To fix both issues:');
console.log(
  '1. Use correct AST generator config: { layout: { algorithm: "grid", nodeSpacing: 100 } }'
);
console.log('2. Map node.geometry to obj.type in your application');
console.log('3. Use node.transform.position for object positions');
console.log(
  '4. Use connection.source.anchor and connection.target.anchor for line endpoints'
);
console.log('='.repeat(80));
