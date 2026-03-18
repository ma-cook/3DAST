const { AST3DGenerator } = require('./dist/src/index.js');

const generator = new AST3DGenerator();

const testCases = [
  'A{Component: My Component}',
  'B[Function: My Function]',
  'C[[Store: My Store]]',
  'D((Service: My Service))',
  'E<Library: My Library>',
  'F[Hook: useCustomHook]',
];

console.log('Testing Node Type Detection:\n');

testCases.forEach((syntax) => {
  try {
    const graph = generator.generate(syntax);
    const node = Array.from(graph.nodes.values())[0];
    
    console.log(`Input:    ${syntax}`);
    console.log(`Type:     ${node.type}`);
    console.log(`Geometry: ${node.geometry}`);
    console.log(`Name:     ${node.name}`);
    console.log('---');
  } catch (error) {
    console.error(`Error with: ${syntax}`);
    console.error(error.message);
    console.log('---');
  }
});
