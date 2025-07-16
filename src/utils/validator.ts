import { NodeType, ConnectionType } from '../types/ast';
import { GeometryType } from '../types/geometry';

/**
 * Validation utilities for 3D AST components
 */
export class Validator {
  /**
   * Validate node type
   */
  static isValidNodeType(type: string): type is NodeType {
    return Object.values(NodeType).includes(type as NodeType);
  }

  /**
   * Validate connection type
   */
  static isValidConnectionType(type: string): type is ConnectionType {
    return Object.values(ConnectionType).includes(type as ConnectionType);
  }

  /**
   * Validate geometry type
   */
  static isValidGeometryType(type: string): type is GeometryType {
    return Object.values(GeometryType).includes(type as GeometryType);
  }

  /**
   * Validate node ID format
   */
  static isValidNodeId(id: string): boolean {
    // Allow alphanumeric characters and underscores, must start with letter or underscore
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id);
  }

  /**
   * Validate that a string is a valid identifier
   */
  static isValidIdentifier(identifier: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  }

  /**
   * Validate color string (hex, rgb, named colors)
   */
  static isValidColor(color: string): boolean {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }

    // Check rgb/rgba colors
    if (
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)
    ) {
      return true;
    }

    // Check named colors
    const namedColors = [
      'red',
      'green',
      'blue',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'black',
      'white',
      'gray',
      'grey',
      'cyan',
      'magenta',
      'lime',
      'navy',
      'maroon',
      'olive',
      'aqua',
      'teal',
      'silver',
      'fuchsia',
    ];

    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Validate numeric range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate opacity value (0-1)
   */
  static isValidOpacity(opacity: number): boolean {
    return this.isInRange(opacity, 0, 1);
  }

  /**
   * Validate scale values (should be positive)
   */
  static isValidScale(x: number, y: number, z: number): boolean {
    return x > 0 && y > 0 && z > 0;
  }

  /**
   * Validate graph structure for cycles
   */
  static hasValidStructure(nodes: Map<string, { children: string[] }>): {
    valid: boolean;
    cycles: string[][];
    orphans: string[];
  } {
    const cycles: string[][] = [];
    const orphans: string[] = [];

    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const [nodeId, node] of nodes) {
      if (!visited.has(nodeId)) {
        const cycle = this.findCycleDFS(
          nodeId,
          node,
          nodes,
          visited,
          recursionStack,
          []
        );
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    }

    // Check for orphaned nodes
    const referencedNodes = new Set<string>();
    for (const [, node] of nodes) {
      node.children.forEach((childId) => referencedNodes.add(childId));
    }

    for (const [nodeId] of nodes) {
      if (!referencedNodes.has(nodeId)) {
        // This is a root node, not an orphan
        continue;
      }
    }

    return {
      valid: cycles.length === 0,
      cycles,
      orphans,
    };
  }

  /**
   * Find cycles in graph using DFS
   */
  private static findCycleDFS(
    nodeId: string,
    node: { children: string[] },
    nodes: Map<string, { children: string[] }>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): string[] {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    for (const childId of node.children) {
      if (!nodes.has(childId)) continue;

      if (!visited.has(childId)) {
        const cycle = this.findCycleDFS(
          childId,
          nodes.get(childId)!,
          nodes,
          visited,
          recursionStack,
          [...path]
        );
        if (cycle.length > 0) return cycle;
      } else if (recursionStack.has(childId)) {
        // Found a cycle
        const cycleStart = path.indexOf(childId);
        return path.slice(cycleStart).concat([childId]);
      }
    }

    recursionStack.delete(nodeId);
    return [];
  }

  /**
   * Validate Merfolk syntax line
   */
  static validateMermaidLine(line: string): {
    valid: boolean;
    type: 'node' | 'connection' | 'metadata' | 'comment' | 'unknown';
    errors: string[];
  } {
    const errors: string[] = [];

    // Skip empty lines
    if (!line.trim()) {
      return { valid: true, type: 'comment', errors: [] };
    }

    // Comment lines
    if (line.startsWith('%%') || line.startsWith('//')) {
      return { valid: true, type: 'comment', errors: [] };
    }

    // Node definition
    if (/^[A-Za-z0-9_]+[\[\{\(]/.test(line)) {
      const nodeMatch = line.match(/^([A-Za-z0-9_]+)[\[\{\(<]/);
      if (nodeMatch) {
        const nodeId = nodeMatch[1];
        if (!this.isValidNodeId(nodeId)) {
          errors.push(`Invalid node ID: ${nodeId}`);
        }
      }

      // Check for proper closing brackets
      const openBrackets = (line.match(/[\[\{\(<]/g) || []).length;
      const closeBrackets = (line.match(/[\]\}\)>]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push('Mismatched brackets in node definition');
      }

      return { valid: errors.length === 0, type: 'node', errors };
    }

    // Connection definition
    if (line.includes('-->') || line.includes('---') || line.includes('-.->')) {
      const connectionMatch = line.match(
        /^([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?\s*(-->|---|-.->)\s*([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?/
      );
      if (connectionMatch) {
        const [, sourceId, , , targetId] = connectionMatch;
        if (!this.isValidNodeId(sourceId)) {
          errors.push(`Invalid source node ID: ${sourceId}`);
        }
        if (!this.isValidNodeId(targetId)) {
          errors.push(`Invalid target node ID: ${targetId}`);
        }
      } else {
        errors.push('Invalid connection syntax');
      }

      return { valid: errors.length === 0, type: 'connection', errors };
    }

    // Metadata
    if (line.includes(':') && !line.includes('-->')) {
      return { valid: true, type: 'metadata', errors: [] };
    }

    return { valid: false, type: 'unknown', errors: ['Unknown line format'] };
  }
}
