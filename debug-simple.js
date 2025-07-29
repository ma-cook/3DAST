const { AST3DGenerator } = require('./dist/src/index.js');

console.log('Creating AST3DGenerator...');
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'hierarchical',
    spacing: 80,
  },
});

// Test with a simple merfolk block directly
const testMerfolk = `graph3d "Simple Test"
    A[Component: App Component]
    B[Hook: useAuthState]
    C[Hook: useSpaceManager]
    
    A --> B
    A --> C
    B --> C`;

console.log('Processing simple merfolk block...');
console.log('Input:', testMerfolk);

try {
  const result = generator.generate(testMerfolk);
  const jsonData = result.toJSON();

  console.log(`\nTotal nodes: ${jsonData.nodes.length}`);
  console.log(`Total connections: ${jsonData.connections.length}`);

  // Show all node positions
  console.log('\n=== NODE POSITIONS ===');
  jsonData.nodes.forEach((node) => {
    console.log(
      `Node ${node.id} (${node.name}): ${JSON.stringify(
        node.transform.position
      )}`
    );
  });

  // Show connection anchor details
  console.log('\n=== CONNECTION ANCHOR DETAILS ===');
  jsonData.connections.forEach((conn, i) => {
    console.log(`\nConnection ${i + 1}:`);
    console.log(`  ID: ${conn.id}`);
    console.log(`  Source Node: ${conn.source.nodeId}`);
    console.log(`  Source Anchor: ${JSON.stringify(conn.source.anchor)}`);
    console.log(`  Target Node: ${conn.target.nodeId}`);
    console.log(`  Target Anchor: ${JSON.stringify(conn.target.anchor)}`);

    // Check if anchors are at origin
    const sourceAtOrigin =
      conn.source.anchor &&
      conn.source.anchor.x === 0 &&
      conn.source.anchor.y === 0 &&
      conn.source.anchor.z === 0;
    const targetAtOrigin =
      conn.target.anchor &&
      conn.target.anchor.x === 0 &&
      conn.target.anchor.y === 0 &&
      conn.target.anchor.z === 0;

    if (sourceAtOrigin) {
      console.log(`  ⚠️  Source anchor is at origin!`);
    }
    if (targetAtOrigin) {
      console.log(`  ⚠️  Target anchor is at origin!`);
    }
  });
} catch (error) {
  console.error('Error processing merfolk:', error);
}
