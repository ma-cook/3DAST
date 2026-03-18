import { AST3DGenerator } from '../index';
import { MermaidParser } from '../parser/mermaid-parser';
import { Connection } from '../models/connection';
import { ConnectionType } from '../types/ast';

describe('Flow Paths', () => {
  let generator: AST3DGenerator;
  let parser: MermaidParser;

  beforeEach(() => {
    generator = new AST3DGenerator();
    parser = new MermaidParser();
  });

  describe('Parser: flowpath directive', () => {
    test('should parse a basic flowpath definition', () => {
      const syntax = `
        A[Function: fetchData]
        B[Function: processData]
        C{Component: Display}
        flowpath "dataFlow" : A --> B --> C
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.flowPaths).toHaveLength(1);
      expect(parsed.flowPaths[0].name).toBe('dataFlow');
      expect(parsed.flowPaths[0].nodeSequence).toEqual(['A', 'B', 'C']);
      expect(parsed.flowPaths[0].connectionIds).toHaveLength(2);
    });

    test('should auto-create connections from flowpath', () => {
      const syntax = `
        A[Function: fetchData]
        B[Function: processData]
        C{Component: Display}
        flowpath "dataFlow" : A --> B --> C
      `;

      const parsed = parser.parse(syntax);

      // Should create 2 connections: A->B and B->C
      const flowConns = parsed.connections.filter(
        (c) => c.flowPaths && c.flowPaths.includes('dataFlow')
      );
      expect(flowConns).toHaveLength(2);
      expect(flowConns[0].source.nodeId).toBe('A');
      expect(flowConns[0].target.nodeId).toBe('B');
      expect(flowConns[1].source.nodeId).toBe('B');
      expect(flowConns[1].target.nodeId).toBe('C');
    });

    test('should handle flowpath with custom arrow type', () => {
      const syntax = `
        A[Function: start]
        B[Function: middle]
        C[Function: end]
        flowpath "controlPath" (-.->): A --> B --> C
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.flowPaths).toHaveLength(1);
      const flowConns = parsed.connections.filter(
        (c) => c.flowPaths && c.flowPaths.includes('controlPath')
      );
      expect(flowConns).toHaveLength(2);
      expect(flowConns[0].type).toBe('controlflow');
    });

    test('should handle flowpath with description', () => {
      const syntax = `
        A[Function: input]
        B[Function: transform]
        C[Function: output]
        flowpath "pipeline" : A --> B --> C : "main data pipeline"
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.flowPaths[0].metadata?.description).toBe(
        'main data pipeline'
      );
    });

    test('should tag existing connections when flowpath reuses them', () => {
      const syntax = `
        A[Function: start]
        B[Function: middle]
        C[Function: end]
        A --> B : "existing"
        flowpath "myFlow" : A --> B --> C
      `;

      const parsed = parser.parse(syntax);

      // The A-->B connection should exist once (reused) and be tagged
      const abConns = parsed.connections.filter(
        (c) => c.source.nodeId === 'A' && c.target.nodeId === 'B'
      );
      expect(abConns).toHaveLength(1);
      expect(abConns[0].flowPaths).toContain('myFlow');
      expect(abConns[0].label).toBe('existing');
    });

    test('should handle multiple flowpath definitions', () => {
      const syntax = `
        A[Function: api]
        B[Function: auth]
        C[Function: db]
        D{Component: ui}
        flowpath "readPath" : D --> A --> C
        flowpath "authPath" : D --> B --> A --> C
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.flowPaths).toHaveLength(2);
      expect(parsed.flowPaths[0].name).toBe('readPath');
      expect(parsed.flowPaths[1].name).toBe('authPath');
    });

    test('should support long multi-hop flow paths', () => {
      const syntax = `
        A[Function: input]
        B[Function: validate]
        C[Function: transform]
        D[Function: store]
        E[Function: notify]
        F{Component: render}
        flowpath "fullPipeline" : A --> B --> C --> D --> E --> F
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.flowPaths[0].nodeSequence).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
      ]);
      expect(parsed.flowPaths[0].connectionIds).toHaveLength(5);

      const flowConns = parsed.connections.filter(
        (c) => c.flowPaths && c.flowPaths.includes('fullPipeline')
      );
      expect(flowConns).toHaveLength(5);
    });
  });

  describe('Parser: #tag syntax on connections', () => {
    test('should parse a single flow path tag on a connection', () => {
      const syntax = `
        A[Function: start]
        B[Function: end]
        A --> B #myFlow
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.connections).toHaveLength(1);
      expect(parsed.connections[0].flowPaths).toEqual(['myFlow']);
    });

    test('should parse multiple flow path tags on a connection', () => {
      const syntax = `
        A[Function: start]
        B[Function: end]
        A --> B #flow1 #flow2 #flow3
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.connections[0].flowPaths).toEqual([
        'flow1',
        'flow2',
        'flow3',
      ]);
    });

    test('should parse flow path tags with labels', () => {
      const syntax = `
        A[Function: start]
        B[Function: end]
        A --> B : "some data" #dataFlow
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.connections[0].label).toBe('some data');
      expect(parsed.connections[0].flowPaths).toEqual(['dataFlow']);
    });

    test('should have no flowPaths when no tags are present', () => {
      const syntax = `
        A[Function: start]
        B[Function: end]
        A --> B : "no tags"
      `;

      const parsed = parser.parse(syntax);

      expect(parsed.connections[0].flowPaths).toBeUndefined();
    });
  });

  describe('Connection model: flowPaths', () => {
    test('should add and check flow path membership', () => {
      const conn = new Connection(
        'conn1',
        ConnectionType.DATA_FLOW,
        { nodeId: 'A' },
        { nodeId: 'B' }
      );

      conn.addFlowPath('myFlow');
      expect(conn.belongsToFlowPath('myFlow')).toBe(true);
      expect(conn.belongsToFlowPath('otherFlow')).toBe(false);
    });

    test('should not add duplicate flow paths', () => {
      const conn = new Connection(
        'conn1',
        ConnectionType.DATA_FLOW,
        { nodeId: 'A' },
        { nodeId: 'B' }
      );

      conn.addFlowPath('myFlow');
      conn.addFlowPath('myFlow');
      expect(conn.flowPaths).toHaveLength(1);
    });

    test('should remove a flow path', () => {
      const conn = new Connection(
        'conn1',
        ConnectionType.DATA_FLOW,
        { nodeId: 'A' },
        { nodeId: 'B' }
      );

      conn.addFlowPath('flow1');
      conn.addFlowPath('flow2');
      conn.removeFlowPath('flow1');
      expect(conn.flowPaths).toEqual(['flow2']);
    });
  });

  describe('Graph model: flow path queries', () => {
    test('should trace entire flow path through the graph', () => {
      const syntax = `
        A[Function: fetchData]
        B[Function: processData]
        C{Component: Display}
        D[Function: logResult]
        flowpath "dataFlow" : A --> B --> C --> D
      `;

      const graph = generator.generate(syntax);

      const trace = graph.traceFlowPath('dataFlow');
      expect(trace).not.toBeNull();
      expect(trace!.nodes).toHaveLength(4);
      expect(trace!.connections).toHaveLength(3);
      expect(trace!.nodes.map((n) => n.id)).toEqual(['A', 'B', 'C', 'D']);
    });

    test('should get all flow paths passing through a node', () => {
      const syntax = `
        A[Function: api]
        B[Function: auth]
        C[Function: db]
        D{Component: ui}
        flowpath "readPath" : D --> A --> C
        flowpath "writePath" : D --> B --> A --> C
      `;

      const graph = generator.generate(syntax);

      // Node A is in both paths
      const aFlowPaths = graph.getNodeFlowPaths('A');
      expect(aFlowPaths).toHaveLength(2);

      // Node B is only in writePath
      const bFlowPaths = graph.getNodeFlowPaths('B');
      expect(bFlowPaths).toHaveLength(1);
      expect(bFlowPaths[0].name).toBe('writePath');
    });

    test('should get flow path connections', () => {
      const syntax = `
        A[Function: start]
        B[Function: middle]
        C[Function: end]
        flowpath "myPath" : A --> B --> C
      `;

      const graph = generator.generate(syntax);

      const conns = graph.getFlowPathConnections('myPath');
      expect(conns).toHaveLength(2);
    });

    test('should find flow paths between two nodes', () => {
      const syntax = `
        A[Function: api]
        B[Function: auth]
        C[Function: db]
        D{Component: ui}
        flowpath "path1" : A --> B --> C
        flowpath "path2" : D --> B --> C
      `;

      const graph = generator.generate(syntax);

      const paths = graph.getFlowPathsBetween('B', 'C');
      expect(paths).toHaveLength(2);

      const pathsAD = graph.getFlowPathsBetween('A', 'D');
      expect(pathsAD).toHaveLength(0);
    });

    test('should get flow path by name', () => {
      const syntax = `
        A[Function: start]
        B[Function: end]
        flowpath "testPath" : A --> B
      `;

      const graph = generator.generate(syntax);

      const fp = graph.getFlowPathByName('testPath');
      expect(fp).toBeDefined();
      expect(fp!.name).toBe('testPath');
      expect(fp!.nodeSequence).toEqual(['A', 'B']);
    });

    test('should list all flow paths', () => {
      const syntax = `
        A[Function: a]
        B[Function: b]
        C[Function: c]
        flowpath "path1" : A --> B
        flowpath "path2" : B --> C
        flowpath "path3" : A --> B --> C
      `;

      const graph = generator.generate(syntax);

      const allPaths = graph.getAllFlowPaths();
      expect(allPaths).toHaveLength(3);
    });
  });

  describe('JSON serialization', () => {
    test('should include flowPaths in JSON output', () => {
      const syntax = `
        A[Function: start]
        B[Function: middle]
        C[Function: end]
        flowpath "testFlow" : A --> B --> C
      `;

      const json = generator.generateJSON(syntax);

      expect(json.flowPaths).toBeDefined();
      expect(json.flowPaths).toHaveLength(1);
      expect(json.flowPaths[0].name).toBe('testFlow');
      expect(json.flowPaths[0].nodeSequence).toEqual(['A', 'B', 'C']);
    });
  });
});
