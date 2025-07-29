import { Position3D, BoundingBox } from '../types/geometry';
import { Graph } from '../models/graph';
import { Node } from '../models/node';

/**
 * Utility class for calculating positions and spatial relationships
 */
export class PositionCalculator {
  /**
   * Calculate optimal spacing between nodes to avoid overlaps
   */
  static calculateOptimalSpacing(nodes: Node[]): number {
    if (nodes.length === 0) return 30.0;

    // Find the largest node dimension
    let maxDimension = 0;
    for (const node of nodes) {
      const size = node.boundingBox.size;
      const nodeDimension = Math.max(size.x, size.y, size.z);
      maxDimension = Math.max(maxDimension, nodeDimension);
    }

    // Ensure minimum spacing even for small nodes
    maxDimension = Math.max(maxDimension, 1.0);

    // Add padding based on node count
    const paddingFactor = Math.max(1.5, Math.sqrt(nodes.length) * 0.5);
    const calculatedSpacing = maxDimension * paddingFactor;

    // Ensure minimum spacing of 20 units
    return Math.max(calculatedSpacing, 20.0);
  }

  /**
   * Check if two nodes overlap
   */
  static doNodesOverlap(
    node1: Node,
    node2: Node,
    margin: number = 0.1
  ): boolean {
    const box1 = node1.boundingBox;
    const box2 = node2.boundingBox;

    return (
      box1.min.x - margin <= box2.max.x + margin &&
      box1.max.x + margin >= box2.min.x - margin &&
      box1.min.y - margin <= box2.max.y + margin &&
      box1.max.y + margin >= box2.min.y - margin &&
      box1.min.z - margin <= box2.max.z + margin &&
      box1.max.z + margin >= box2.min.z - margin
    );
  }

  /**
   * Find the closest face connection point between two nodes
   */
  static findClosestFaceConnection(
    sourceNode: Node,
    targetNode: Node
  ): {
    sourceFace: string;
    targetFace: string;
    distance: number;
  } {
    let minDistance = Infinity;
    let bestSourceFace = '';
    let bestTargetFace = '';

    for (const sourceFace of sourceNode.faces) {
      for (const targetFace of targetNode.faces) {
        const distance = this.distance3D(sourceFace.center, targetFace.center);
        if (distance < minDistance) {
          minDistance = distance;
          bestSourceFace = sourceFace.id;
          bestTargetFace = targetFace.id;
        }
      }
    }

    return {
      sourceFace: bestSourceFace,
      targetFace: bestTargetFace,
      distance: minDistance,
    };
  }

  /**
   * Calculate the center point of a group of nodes
   */
  static calculateCenterPoint(nodes: Node[]): Position3D {
    if (nodes.length === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    let totalX = 0;
    let totalY = 0;
    let totalZ = 0;

    for (const node of nodes) {
      const pos = node.transform.position;
      totalX += pos.x;
      totalY += pos.y;
      totalZ += pos.z;
    }

    return {
      x: totalX / nodes.length,
      y: totalY / nodes.length,
      z: totalZ / nodes.length,
    };
  }

  /**
   * Calculate bounding box for a group of nodes
   */
  static calculateGroupBounds(nodes: Node[]): BoundingBox {
    if (nodes.length === 0) {
      return {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
        center: { x: 0, y: 0, z: 0 },
        size: { x: 0, y: 0, z: 0 },
      };
    }

    const firstBounds = nodes[0].boundingBox;
    let min = { ...firstBounds.min };
    let max = { ...firstBounds.max };

    for (const node of nodes) {
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
   * Distribute nodes evenly in a circle
   */
  static distributeInCircle(
    nodes: Node[],
    radius: number,
    center: Position3D = { x: 0, y: 0, z: 0 }
  ): void {
    const angleStep = (Math.PI * 2) / nodes.length;

    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      const position = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y,
        z: center.z + Math.sin(angle) * radius,
      };
      node.setPosition(position);
    });
  }

  /**
   * Distribute nodes in a grid pattern
   */
  static distributeInGrid(
    nodes: Node[],
    spacing: number,
    center: Position3D = { x: 0, y: 0, z: 0 }
  ): void {
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const offset = {
      x: center.x - ((gridSize - 1) * spacing) / 2,
      y: center.y,
      z: center.z - ((gridSize - 1) * spacing) / 2,
    };

    nodes.forEach((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const position = {
        x: offset.x + col * spacing,
        y: offset.y,
        z: offset.z + row * spacing,
      };
      node.setPosition(position);
    });
  }

  /**
   * Arrange nodes in hierarchical layers
   */
  static distributeInLayers(
    graph: Graph,
    layerSpacing: number,
    nodeSpacing: number
  ): void {
    const layers = this.calculateHierarchicalLayers(graph);

    layers.forEach((layerNodes, layerIndex) => {
      const y = layerIndex * layerSpacing;
      const totalWidth = Math.max(0, layerNodes.length - 1) * nodeSpacing;
      const startX = -totalWidth / 2;

      layerNodes.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * nodeSpacing;
        node.setPosition({ x, y, z: 0 });
      });
    });
  }

  /**
   * Calculate hierarchical layers from graph structure
   */
  static calculateHierarchicalLayers(graph: Graph): Node[][] {
    const layers: Node[][] = [];
    const visited = new Set<string>();
    const nodeToLayer = new Map<string, number>();

    // Find root nodes (no parents)
    const rootNodes = graph.getRootNodes();

    // Assign layer 0 to root nodes
    rootNodes.forEach((node) => {
      nodeToLayer.set(node.id, 0);
    });

    // BFS to assign layers
    const queue: { node: Node; layer: number }[] = rootNodes.map((node) => ({
      node,
      layer: 0,
    }));

    while (queue.length > 0) {
      const { node, layer } = queue.shift()!;

      if (visited.has(node.id)) continue;
      visited.add(node.id);

      // Ensure layer array exists
      while (layers.length <= layer) {
        layers.push([]);
      }
      layers[layer].push(node);

      // Process children
      node.children.forEach((childId) => {
        const child = graph.getNode(childId);
        if (child && !visited.has(childId)) {
          const currentChildLayer = nodeToLayer.get(childId) || 0;
          const newChildLayer = Math.max(currentChildLayer, layer + 1);
          nodeToLayer.set(childId, newChildLayer);
          queue.push({ node: child, layer: newChildLayer });
        }
      });
    }

    return layers;
  }

  /**
   * Calculate shortest path between two points with obstacles
   */
  static calculatePath(
    start: Position3D,
    end: Position3D,
    obstacles: BoundingBox[] = []
  ): Position3D[] {
    // Simple direct path if no obstacles
    if (obstacles.length === 0) {
      return [start, end];
    }

    // For simplicity, return direct path
    // In a real implementation, you might use A* or similar pathfinding
    return [start, end];
  }

  /**
   * Calculate distance between two 3D points
   */
  static distance3D(p1: Position3D, p2: Position3D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Normalize a 3D vector
   */
  static normalize(vector: Position3D): Position3D {
    const length = Math.sqrt(
      vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
    );
    if (length === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length,
    };
  }

  /**
   * Calculate the angle between two vectors
   */
  static angleBetweenVectors(v1: Position3D, v2: Position3D): number {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

    if (mag1 === 0 || mag2 === 0) return 0;

    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  }
}
