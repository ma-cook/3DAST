const { AST3DGenerator } = require('./dist/index.js');

// Test the parser to see what's happening
const generator = new AST3DGenerator();

const syntax = `
A[Function: func]
B{Component: comp}  
C((Module: mod))
D<Datapath: data>
E[[Class: cls]]
`;

console.log('Testing parser...');
const parsed = generator.parseOnly(syntax);
console.log('Parsed nodes:', parsed.nodes.length);
parsed.nodes.forEach((node) => {
  console.log(
    `Node ${node.id}: ${node.type} - ${node.name} (${node.geometry})`
  );
});

const graph = generator.generate(syntax);
console.log('Generated graph nodes:', graph.nodes.size);
for (const [id, node] of graph.nodes) {
  console.log(
    `Graph Node ${id}: ${node.type} - ${node.name} (${node.geometry})`
  );
}
