import { Graph } from '../models/graph';
import { Node } from '../models/node';
import { Connection } from '../models/connection';
import { ParsedGraph, ParsedNode, ParsedConnection } from './mermaid-parser';
import { Config, DEFAULT_CONFIG } from '../types/config';

/**
 * Builds 3D AST Graph from parsed Merfolk syntax
 */
export class ASTBuilder {
  private config: Config;

  constructor(config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build 3D AST Graph from parsed data
   */
  build(parsedGraph: ParsedGraph): Graph {
    const graphId = this.generateId();
    const graph = new Graph(
      graphId,
      parsedGraph.title || 'Untitled Graph',
      parsedGraph.description
    );

    // Add metadata
    if (parsedGraph.metadata) {
      graph.metadata = { ...parsedGraph.metadata };
    }

    // Create nodes
    const nodeMap = new Map<string, Node>();
    for (const parsedNode of parsedGraph.nodes) {
      const node = this.createNode(parsedNode);
      nodeMap.set(parsedNode.id, node);
      graph.addNode(node);
    }

    // Create connections
    for (const parsedConnection of parsedGraph.connections) {
      const connection = this.createConnection(parsedConnection, nodeMap);
      if (connection) {
        graph.addConnection(connection);
      }
    }

    // Apply layout
    this.applyLayout(graph);

    return graph;
  }

  /**
   * Create a Node from parsed node data
   */
  private createNode(parsedNode: ParsedNode): Node {
    const node = new Node(
      parsedNode.id,
      parsedNode.type,
      parsedNode.name,
      parsedNode.geometry
    );

    // Set description
    if (parsedNode.description) {
      node.description = parsedNode.description;
    }

    // Apply custom properties
    if (parsedNode.properties) {
      node.metadata = { ...parsedNode.properties };

      // Apply visual properties if specified
      if (parsedNode.properties.color) {
        node.visual.color = parsedNode.properties.color;
      }
      if (parsedNode.properties.opacity) {
        node.visual.opacity = parseFloat(parsedNode.properties.opacity);
      }
      if (parsedNode.properties.scale) {
        const scale = this.parseScale(parsedNode.properties.scale);
        node.setScale(scale);
      }
    }

    // Apply theme colors
    if (!node.visual.color) {
      node.visual.color =
        this.config.visual.colors[parsedNode.type] || '#808080';
    }

    return node;
  }

  /**
   * Create a Connection from parsed connection data
   */
  private createConnection(
    parsedConnection: ParsedConnection,
    nodeMap: Map<string, Node>
  ): Connection | null {
    const sourceNode = nodeMap.get(parsedConnection.source.nodeId);
    const targetNode = nodeMap.get(parsedConnection.target.nodeId);
    if (!sourceNode || !targetNode) {
      // Skip invalid connections
      return null;
    }

    const connection = new Connection(
      parsedConnection.id,
      parsedConnection.type,
      {
        nodeId: parsedConnection.source.nodeId,
        faceId: parsedConnection.source.faceId,
      },
      {
        nodeId: parsedConnection.target.nodeId,
        faceId: parsedConnection.target.faceId,
      }
    );

    // Set label if provided
    if (parsedConnection.label) {
      connection.visual.label = {
        text: parsedConnection.label,
        size: 12,
        color: '#FFFFFF',
        position: { x: 0, y: 0, z: 0 },
      };
    }

    // Apply custom properties
    if (parsedConnection.properties) {
      connection.metadata = { ...parsedConnection.properties };
    }

    return connection;
  }

  /**
   * Apply layout algorithm to position nodes
   */
  private applyLayout(graph: Graph): void {
    switch (this.config.layout.algorithm) {
      case 'hierarchical':
        this.applyHierarchicalLayout(graph);
        break;
      case 'force-directed':
        this.applyForceDirectedLayout(graph);
        break;
      case 'circular':
        this.applyCircularLayout(graph);
        break;
      case 'grid':
        this.applyGridLayout(graph);
        break;
      default:
        this.applyHierarchicalLayout(graph);
    }
  }

  /**
   * Apply hierarchical layout
   */
  private applyHierarchicalLayout(graph: Graph): void {
    const rootNodes = graph.getRootNodes();
    const spacing = this.config.layout.nodeSpacing;
    const layers = new Map<number, Node[]>();

    // Assign nodes to layers
    for (const root of rootNodes) {
      this.assignToLayers(graph, root, 0, layers, new Set());
    }

    // Position nodes by layer
    let maxY = 0;
    for (const [layer, nodes] of layers) {
      const y = layer * spacing * 2;
      maxY = Math.max(maxY, y);

      const totalWidth = (nodes.length - 1) * spacing;
      const startX = -totalWidth / 2;

      nodes.forEach((node, index) => {
        const x = startX + index * spacing;
        const z = 0;
        node.setPosition({ x, y, z });
      });
    }
  }

  /**
   * Apply force-directed layout (simplified)
   */
  private applyForceDirectedLayout(graph: Graph): void {
    const nodes = Array.from(graph.nodes.values());
    const spacing = this.config.layout.nodeSpacing;

    // Initial random positioning
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = (spacing * nodes.length) / (Math.PI * 2);

      node.setPosition({
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius,
      });
    });

    // Simple force simulation with fixed parameters
    const iterations = 50;
    const repulsionStrength = 1.0;
    const attractionStrength = 0.1;
    const dampingFactor = 0.9;

    for (let i = 0; i < iterations; i++) {
      // Apply forces between nodes
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          this.applyRepulsiveForce(nodes[j], nodes[k], repulsionStrength);
        }
      }

      // Apply attractive forces for connected nodes
      for (const connection of graph.connections.values()) {
        const sourceNode = graph.getNode(connection.source.nodeId);
        const targetNode = graph.getNode(connection.target.nodeId);
        if (sourceNode && targetNode) {
          this.applyAttractiveForce(sourceNode, targetNode, attractionStrength);
        }
      }

      // Apply damping
      nodes.forEach((node) => {
        const pos = node.transform.position;
        node.setPosition({
          x: pos.x * dampingFactor,
          y: pos.y * dampingFactor,
          z: pos.z * dampingFactor,
        });
      });
    }
  }

  /**
   * Apply circular layout
   */
  private applyCircularLayout(graph: Graph): void {
    const nodes = Array.from(graph.nodes.values());
    const spacing = this.config.layout.nodeSpacing;
    const radius = Math.max(
      (spacing * nodes.length) / (Math.PI * 2),
      spacing * 2
    );

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      node.setPosition({
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius,
      });
    });
  }

  /**
   * Apply grid layout
   */
  private applyGridLayout(graph: Graph): void {
    const nodes = Array.from(graph.nodes.values());
    const spacing = this.config.layout.nodeSpacing;
    const gridSize = Math.ceil(Math.sqrt(nodes.length));

    nodes.forEach((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      node.setPosition({
        x: (col - gridSize / 2) * spacing,
        y: 0,
        z: (row - gridSize / 2) * spacing,
      });
    });
  }

  /**
   * Recursively assign nodes to layers for hierarchical layout
   */
  private assignToLayers(
    graph: Graph,
    node: Node,
    layer: number,
    layers: Map<number, Node[]>,
    visited: Set<string>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    if (!layers.has(layer)) {
      layers.set(layer, []);
    }
    layers.get(layer)!.push(node);

    // Process children
    for (const childId of node.children) {
      const child = graph.getNode(childId);
      if (child) {
        this.assignToLayers(graph, child, layer + 1, layers, visited);
      }
    }
  }

  /**
   * Apply repulsive force between two nodes
   */
  private applyRepulsiveForce(
    node1: Node,
    node2: Node,
    strength: number
  ): void {
    const pos1 = node1.transform.position;
    const pos2 = node2.transform.position;

    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
    const force = strength / (distance * distance);

    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    const fz = (dz / distance) * force;

    node1.setPosition({
      x: pos1.x + fx,
      y: pos1.y + fy,
      z: pos1.z + fz,
    });

    node2.setPosition({
      x: pos2.x - fx,
      y: pos2.y - fy,
      z: pos2.z - fz,
    });
  }

  /**
   * Apply attractive force between two connected nodes
   */
  private applyAttractiveForce(
    node1: Node,
    node2: Node,
    strength: number
  ): void {
    const pos1 = node1.transform.position;
    const pos2 = node2.transform.position;

    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
    const force = strength * distance;

    const fx = (dx / distance) * force * 0.1;
    const fy = (dy / distance) * force * 0.1;
    const fz = (dz / distance) * force * 0.1;

    node1.setPosition({
      x: pos1.x + fx,
      y: pos1.y + fy,
      z: pos1.z + fz,
    });

    node2.setPosition({
      x: pos2.x - fx,
      y: pos2.y - fy,
      z: pos2.z - fz,
    });
  }

  /**
   * Parse scale string to Position3D
   */
  private parseScale(scaleStr: string): { x: number; y: number; z: number } {
    const parts = scaleStr.split(',').map((s) => parseFloat(s.trim()));

    if (parts.length === 1) {
      return { x: parts[0], y: parts[0], z: parts[0] };
    } else if (parts.length === 3) {
      return { x: parts[0], y: parts[1], z: parts[2] };
    }

    return { x: 1, y: 1, z: 1 };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
