const { MarkdownProcessor, AST3DGenerator } = require('./dist/src/index.js');

console.log('🔍 DEBUGGING CONNECTION PARSING');
console.log('='.repeat(50));

const simpleTest = `
    A[Component: App]
    B[Component: Form]
    
    A -->|"renders"| B
    A --> B
`;

const generator = new AST3DGenerator({
  layout: {
    algorithm: 'grid',
    nodeSpacing: 100
  }
});

try {
  console.log('Testing simple connection syntax...');
  const result = generator.generate(simpleTest);
  const data = result.toJSON();
  
  console.log(`Nodes: ${data.nodes.length}`);
  console.log(`Connections: ${data.connections.length}`);
  
  if (data.connections.length > 0) {
    console.log('Connection details:');
    data.connections.forEach(conn => {
      console.log(`  ${conn.source.nodeId} --> ${conn.target.nodeId}`);
      if (conn.label) console.log(`    Label: "${conn.label}"`);
    });
  } else {
    console.log('❌ No connections parsed!');
    console.log('Raw content being parsed:');
    console.log(simpleTest);
  }
  
} catch (error) {
  console.log('❌ Error:', error.message);
}
    const result = generator.generate(blockContent);
    const jsonData = result.toJSON();

    console.log(`Total nodes: ${jsonData.nodes.length}`);
    console.log(`Total connections: ${jsonData.connections.length}`);

    // Show details for first 3 connections
    console.log('\n=== CONNECTION ANCHOR DETAILS ===');
    for (let i = 0; i < Math.min(3, jsonData.connections.length); i++) {
      const conn = jsonData.connections[i];
      console.log(`\nConnection ${i + 1}:`);
      console.log(`  ID: ${conn.id}`);
      console.log(`  Source Node: ${conn.source.nodeId}`);
      console.log(`  Source Anchor: ${JSON.stringify(conn.source.anchor)}`);
      console.log(`  Target Node: ${conn.target.nodeId}`);
      console.log(`  Target Anchor: ${JSON.stringify(conn.target.anchor)}`);

      // Find the actual node positions for comparison
      const sourceNode = jsonData.nodes.find(
        (n) => n.id === conn.source.nodeId
      );
      const targetNode = jsonData.nodes.find(
        (n) => n.id === conn.target.nodeId
      );

      if (sourceNode) {
        console.log(
          `  Source Node Position: ${JSON.stringify(
            sourceNode.transform.position
          )}`
        );
      }
      if (targetNode) {
        console.log(
          `  Target Node Position: ${JSON.stringify(
            targetNode.transform.position
          )}`
        );
      }
    }

    // Show all node positions to debug spacing
    console.log('\n=== NODE POSITIONS (first 10) ===');
    for (let i = 0; i < Math.min(10, jsonData.nodes.length); i++) {
      const node = jsonData.nodes[i];
      console.log(
        `Node ${node.id}: ${JSON.stringify(node.transform.position)}`
      );
    }
  } catch (error) {
    console.error('Error processing block:', error);
  }
}
