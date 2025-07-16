import { AST3DGenerator } from '../index';

describe('AST3DGenerator', () => {
  let generator: AST3DGenerator;

  beforeEach(() => {
    generator = new AST3DGenerator();
  });

  test('should create generator instance', () => {
    expect(generator).toBeDefined();
  });

  test('should parse simple graph syntax', () => {
    const syntax = `
      graph3d "Test Graph"
      A[Function: test]
      B{Component: ui}
      A --> B
    `;

    const parsed = generator.parseOnly(syntax);
    expect(parsed.nodes).toHaveLength(2);
    expect(parsed.connections).toHaveLength(1);
    expect(parsed.title).toBe('Test Graph');
  });

  test('should generate 3D graph', () => {
    const syntax = `
      A[Function: processData]
      B{Component: UserInterface}
      A --> B : "data flow"
    `;

    const graph = generator.generate(syntax);
    expect(graph.nodes.size).toBe(2);
    expect(graph.connections.size).toBe(1);

    const nodeA = graph.getNode('A');
    const nodeB = graph.getNode('B');

    expect(nodeA?.name).toBe('processData');
    expect(nodeB?.name).toBe('UserInterface');
    expect(nodeA?.geometry).toBe('cube');
    expect(nodeB?.geometry).toBe('dodecahedron');
  });

  test('should validate syntax', () => {
    const validSyntax = `
      A[Function: test]
      B{Component: ui}
      A --> B
    `;

    const invalidSyntax = `
      A[Function: test]
      B{Component: ui}
      A --> C
    `;

    const validResult = generator.validate(validSyntax);
    const invalidResult = generator.validate(invalidSyntax);

    expect(validResult.valid).toBe(true);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toContain(
      'Connection references unknown target node: C'
    );
  });
  test('should handle different node types', () => {
    const syntax = `
      A[Function: func]
      B{Component: comp}  
      C((Module: mod))
      D<Datapath: data>
      E[[Class: cls]]
    `;

    const parsed = generator.parseOnly(syntax);
    expect(parsed.nodes).toHaveLength(5);

    const graph = generator.generate(syntax);
    expect(graph.nodes.size).toBe(5);

    expect(graph.getNode('A')?.type).toBe('function');
    expect(graph.getNode('B')?.type).toBe('component');
    expect(graph.getNode('C')?.type).toBe('module');
    expect(graph.getNode('D')?.type).toBe('datapath');
    expect(graph.getNode('E')?.type).toBe('class');
  });

  test('should handle face connections', () => {
    const syntax = `
      A[Function: source]
      B[Function: target]
      A@front --> B@back : "face connection"
    `;
    const graph = generator.generate(syntax);
    const connections = Array.from(graph.connections.values());
    const connection = connections[0];

    expect(connection.source.faceId).toBe('front');
    expect(connection.target.faceId).toBe('back');
  });

  test('should generate JSON export', () => {
    const syntax = `
      A[Function: test]
      B{Component: ui}
      A --> B
    `;

    const jsonData = generator.generateJSON(syntax);
    expect(jsonData.nodes.size).toBe(2);
    expect(jsonData.connections.size).toBe(1);
    expect(jsonData.bounds).toBeDefined();
  });
});
