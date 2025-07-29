import { Position3D, BoundingBox } from '../types/geometry';
import { AST3DGraph } from '../types/ast';
import { Node } from './node';
import { Connection } from './connection';

/**
 * 3D AST Graph implementation
 */
export class Graph {
  public id: string;
  public name: string;
  public description?: string;
  public nodes: Map<string, Node>;
  public connections: Map<string, Connection>;
  public metadata: Record<string, any>;

  constructor(id: string, name: string, description?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.nodes = new Map();
    this.connections = new Map();
    this.metadata = {};
  }

  /**
   * Add a node to the graph
   */
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove all connections involving this node
    const connectionsToRemove: string[] = [];
    for (const [connectionId, connection] of this.connections) {
      if (
        connection.source.nodeId === nodeId ||
        connection.target.nodeId === nodeId
      ) {
        connectionsToRemove.push(connectionId);
      }
    }

    connectionsToRemove.forEach((id) => this.connections.delete(id));

    // Remove parent-child relationships
    node.parents.forEach((parentId) => {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.removeChild(nodeId);
      }
    });

    node.children.forEach((childId) => {
      const child = this.nodes.get(childId);
      if (child) {
        child.removeParent(nodeId);
      }
    });

    this.nodes.delete(nodeId);
  }

  /**
   * Add a connection to the graph
   */
  addConnection(connection: Connection): void {
    // Verify that both nodes exist
    const sourceNode = this.nodes.get(connection.source.nodeId);
    const targetNode = this.nodes.get(connection.target.nodeId);

    if (!sourceNode || !targetNode) {
      throw new Error(
        `Cannot create connection: source or target node not found`
      );
    }

    // Update node relationships
    sourceNode.addChild(connection.target.nodeId);
    targetNode.addParent(connection.source.nodeId);

    // Update connection anchors if faces are specified
    if (connection.source.faceId) {
      const sourceFace = sourceNode.getFace(connection.source.faceId);
      if (sourceFace) {
        connection.source.anchor = sourceFace.center;
      }
    } else if (!connection.source.anchor) {
      connection.source.anchor = sourceNode.transform.position;
    }

    if (connection.target.faceId) {
      const targetFace = targetNode.getFace(connection.target.faceId);
      if (targetFace) {
        connection.target.anchor = targetFace.center;
      }
    } else if (!connection.target.anchor) {
      connection.target.anchor = targetNode.transform.position;
    }

    this.connections.set(connection.id, connection);
  }

  /**
   * Remove a connection from the graph
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Update node relationships
    const sourceNode = this.nodes.get(connection.source.nodeId);
    const targetNode = this.nodes.get(connection.target.nodeId);

    if (sourceNode) {
      sourceNode.removeChild(connection.target.nodeId);
    }
    if (targetNode) {
      targetNode.removeParent(connection.source.nodeId);
    }

    this.connections.delete(connectionId);
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get a connection by ID
   */
  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type: string): Node[] {
    return Array.from(this.nodes.values()).filter((node) => node.type === type);
  }

  /**
   * Get all connections of a specific type
   */
  getConnectionsByType(type: string): Connection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.type === type
    );
  }

  /**
   * Get all connections for a specific node
   */
  getNodeConnections(nodeId: string): Connection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.source.nodeId === nodeId || conn.target.nodeId === nodeId
    );
  }

  /**
   * Get root nodes (nodes with no parents)
   */
  getRootNodes(): Node[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.parents.length === 0
    );
  }

  /**
   * Get leaf nodes (nodes with no children)
   */
  getLeafNodes(): Node[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.children.length === 0
    );
  }

  /**
   * Calculate the bounding box of the entire graph
   */
  getBounds(): BoundingBox {
    if (this.nodes.size === 0) {
      return {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
        center: { x: 0, y: 0, z: 0 },
        size: { x: 0, y: 0, z: 0 },
      };
    }

    const firstNode = Array.from(this.nodes.values())[0];
    let min = { ...firstNode.boundingBox.min };
    let max = { ...firstNode.boundingBox.max };

    for (const node of this.nodes.values()) {
      const bounds = node.boundingBox;
      min.x = Math.min(min.x, bounds.min.x);
      min.y = Math.min(min.y, bounds.min.y);
      min.z = Math.min(min.z, bounds.min.z);

      max.x = Math.max(max.x, bounds.max.x);
      max.y = Math.max(max.y, bounds.max.y);
      max.z = Math.max(max.z, bounds.max.z);
    }

    const center = {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    };

    const size = {
      x: max.x - min.x,
      y: max.y - min.y,
      z: max.z - min.z,
    };

    return { min, max, center, size };
  }

  /**
   * Check for cycles in the graph
   */
  hasCycles(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (this.hasCycleUtil(nodeId, visited, recursionStack)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get the depth of the graph (longest path from root to leaf)
   */
  getDepth(): number {
    const rootNodes = this.getRootNodes();
    let maxDepth = 0;

    for (const root of rootNodes) {
      const depth = this.getNodeDepth(root.id, new Set());
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  /**
   * Convert to serializable format
   */
  toJSON(): AST3DGraph {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      nodes: Array.from(this.nodes.values()),
      connections: Array.from(this.connections.values()),
      metadata: this.metadata,
      bounds: this.getBounds(),
    };
  }
  /**
   * Create graph from JSON
   */
  static fromJSON(data: AST3DGraph): Graph {
    const graph = new Graph(data.id, data.name, data.description);

    // Convert ASTNode data to Node instances
    for (const nodeData of data.nodes) {
      const node = new Node(
        nodeData.id,
        nodeData.type,
        nodeData.name,
        nodeData.geometry
      );
      node.description = nodeData.description;
      node.transform = nodeData.transform;
      node.visual = nodeData.visual;
      node.metadata = nodeData.metadata;
      node.children = [...nodeData.children];
      node.parents = [...nodeData.parents];
      graph.addNode(node);
    }

    // Convert ASTConnection data to Connection instances
    for (const connectionData of data.connections) {
      const connection = new Connection(
        connectionData.id,
        connectionData.type,
        connectionData.source,
        connectionData.target
      );
      connection.visual = connectionData.visual;
      connection.metadata = connectionData.metadata;
      if (connectionData.waypoints) {
        connection.setWaypoints(connectionData.waypoints);
      }
      graph.addConnection(connection);
    }

    graph.metadata = data.metadata;
    return graph;
  }

  /**
   * Utility function for cycle detection
   */
  private hasCycleUtil(
    nodeId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node) return false;

    for (const childId of node.children) {
      if (!visited.has(childId)) {
        if (this.hasCycleUtil(childId, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(childId)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  /**
   * Get the depth of a specific node
   */
  private getNodeDepth(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0;

    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (!node || node.children.length === 0) return 1;

    let maxChildDepth = 0;
    for (const childId of node.children) {
      const childDepth = this.getNodeDepth(childId, new Set(visited));
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    return 1 + maxChildDepth;
  }
}
