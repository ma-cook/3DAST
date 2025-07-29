const { MarkdownProcessor, AST3DGenerator } = require('./dist/src/index.js');
const fs = require('fs');

// Read the app-architecture-fixed.md file that contains your original diagrams
const markdownContent = fs.readFileSync(
  './examples/app-architecture-fixed.md',
  'utf-8'
);

console.log('Debugging node geometry types from your original diagrams...');
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'grid',
    nodeSpacing: 80,
  },
});

const processor = new MarkdownProcessor();
const blocks = processor.extractAST3DBlocks(markdownContent);

console.log(`Found ${blocks.length} merfolk blocks`);

// Check the first block to see what geometry types nodes are getting
if (blocks.length > 0) {
  console.log('\n=== ANALYZING FIRST BLOCK ===');
  const block = blocks[0];

  try {
    const result = generator.generate(block.content);
    const jsonData = result.toJSON();

    console.log(`Total nodes: ${jsonData.nodes.length}`);

    // Analyze geometry types
    const geometryTypes = {};
    const nodeTypes = {};

    console.log('\n=== NODE ANALYSIS (first 10 nodes) ===');
    jsonData.nodes.slice(0, 10).forEach((node) => {
      console.log(`Node ${node.id}:`);
      console.log(`  Name: ${node.name}`);
      console.log(`  Type: ${node.type}`);
      console.log(`  Geometry: ${node.geometry}`);
      console.log(
        `  Position: [${node.transform.position.x}, ${node.transform.position.y}, ${node.transform.position.z}]`
      );
      console.log('');

      // Count geometry types
      geometryTypes[node.geometry] = (geometryTypes[node.geometry] || 0) + 1;
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    console.log('\n=== GEOMETRY TYPE DISTRIBUTION ===');
    Object.entries(geometryTypes).forEach(([geometry, count]) => {
      console.log(`${geometry}: ${count} nodes`);
    });

    console.log('\n=== NODE TYPE DISTRIBUTION ===');
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count} nodes`);
    });

    // Check if your application logic would render these as planes
    console.log('\n=== APPLICATION RENDERING ANALYSIS ===');
    console.log('Based on your ObjectRenderer logic:');

    const sampleNode = jsonData.nodes[0];
    console.log(`Sample node geometry: "${sampleNode.geometry}"`);
    console.log(`Sample node type: "${sampleNode.type}"`);

    // This is the logic from your ObjectRenderer
    if (sampleNode.type === 'cube') {
      console.log('→ Would render as CUBE');
    } else if (sampleNode.type === 'tetrahedron') {
      console.log('→ Would render as TETRAHEDRON');
    } else if (sampleNode.type === 'sphere') {
      console.log('→ Would render as SPHERE (Dodecahedron)');
    } else if (sampleNode.type === 'plane') {
      console.log('→ Would render as PLANE');
    } else if (sampleNode.type === 'text') {
      console.log('→ Would render as TEXT');
    } else if (sampleNode.type === 'model') {
      console.log('→ Would render as MODEL');
    } else {
      console.log('→ Would render as NULL (not rendered)');
      console.log(
        "❌ THIS IS THE PROBLEM! Unknown type, so objects don't render."
      );
    }

    console.log('\n=== SOLUTION ===');
    console.log('To get different object types, you need to either:');
    console.log('1. Modify the Merfolk syntax to specify different node types');
    console.log('2. Map node.geometry to obj.type in your application');
    console.log(
      '3. Use the AST generator configuration to assign different geometries'
    );
  } catch (error) {
    console.error('Error processing block:', error);
  }
}
