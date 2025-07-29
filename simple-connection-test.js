const { AST3DGenerator } = require('./dist/src/index.js');

console.log('🔍 TESTING CONNECTION LABEL SYNTAX');
console.log('='.repeat(50));

// Test different connection syntaxes
const tests = [
  {
    name: 'Simple connection',
    syntax: `
      A[Component: App]
      B[Component: Form]
      
      A --> B
    `,
  },
  {
    name: 'Labeled connection with pipes',
    syntax: `
      A[Component: App]
      B[Component: Form]
      
      A -->|"renders"| B
    `,
  },
  {
    name: 'Multiple connections',
    syntax: `
      A[Component: App]
      B[Component: Form]
      C[Component: Button]
      
      A --> B
      A -->|"includes"| C
      B --> C
    `,
  },
];

const generator = new AST3DGenerator({
  layout: {
    algorithm: 'grid',
    nodeSpacing: 100,
  },
});

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('-'.repeat(30));

  try {
    const result = generator.generate(test.syntax);
    const data = result.toJSON();

    console.log(`   Nodes: ${data.nodes.length}`);
    console.log(`   Connections: ${data.connections.length}`);

    if (data.connections.length > 0) {
      data.connections.forEach((conn) => {
        const label = conn.label ? ` ("${conn.label}")` : '';
        console.log(
          `     ${conn.source.nodeId} --> ${conn.target.nodeId}${label}`
        );
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});
