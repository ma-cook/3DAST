import { AST3DGenerator } from '../src';

// Basic usage example
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'hierarchical',
    nodeSpacing: 3.0,
    layers: 4,
  },
  visual: {
    theme: 'dark',
    colors: {
      function: '#4CAF50',
      component: '#2196F3',
      datapath: '#FF9800',
    },
    material: {
      metalness: 0.2,
      roughness: 0.6,
      opacity: 0.9,
    },
  },
});

// Simple application architecture
const simpleApp = `
graph3d "Simple App"

A[Function: main]
B{Component: UI}
C((Module: Database))

A --> B : "render"
B -.-> A : "events"
A --> C : "queries"
`;

// Generate the 3D graph
const graph = generator.generate(simpleApp);

console.log(
  `Generated graph with ${graph.nodes.size} nodes and ${graph.connections.size} connections`
);
console.log('Graph bounds:', graph.getBounds());

// Access individual nodes
for (const [nodeId, node] of graph.nodes) {
  console.log(
    `Node ${nodeId}: ${node.name} at position`,
    node.transform.position
  );
}

// Access connections
for (const [connId, connection] of graph.connections) {
  console.log(
    `Connection ${connId}: ${connection.source.nodeId} -> ${connection.target.nodeId}`
  );
}

// Export to JSON for your 3D application
const jsonData = generator.generateJSON(simpleApp);
console.log('JSON export:', JSON.stringify(jsonData, null, 2));

// Validate syntax
const validation = generator.validate(simpleApp);
if (validation.valid) {
  console.log('✅ Syntax is valid');
} else {
  console.log('❌ Syntax errors:', validation.errors);
}

export { generator, graph, jsonData };
