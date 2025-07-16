import {
  Position3D,
  GeometryType,
  Transform3D,
  Face,
  BoundingBox,
} from '../types/geometry';
import { NodeType, VisualProperties } from '../types/ast';

/**
 * 3D AST Node implementation
 */
export class Node {
  public id: string;
  public type: NodeType;
  public name: string;
  public description?: string;
  public geometry: GeometryType;
  public transform: Transform3D;
  public boundingBox: BoundingBox;
  public faces: Face[];
  public visual: VisualProperties;
  public metadata: Record<string, any>;
  public children: string[] = [];
  public parents: string[] = [];

  constructor(
    id: string,
    type: NodeType,
    name: string,
    geometry: GeometryType = GeometryType.CUBE
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.geometry = geometry;
    this.transform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    this.boundingBox = this.calculateBoundingBox();
    this.faces = this.generateFaces();
    this.visual = {
      color: this.getDefaultColor(),
      opacity: 0.9,
      wireframe: false,
    };
    this.metadata = {};
  }

  /**
   * Add a child node
   */
  addChild(childId: string): void {
    if (!this.children.includes(childId)) {
      this.children.push(childId);
    }
  }

  /**
   * Add a parent node
   */
  addParent(parentId: string): void {
    if (!this.parents.includes(parentId)) {
      this.parents.push(parentId);
    }
  }

  /**
   * Remove a child node
   */
  removeChild(childId: string): void {
    this.children = this.children.filter((id) => id !== childId);
  }

  /**
   * Remove a parent node
   */
  removeParent(parentId: string): void {
    this.parents = this.parents.filter((id) => id !== parentId);
  }

  /**
   * Update the node's position
   */
  setPosition(position: Position3D): void {
    this.transform.position = { ...position };
    this.boundingBox = this.calculateBoundingBox();
    this.updateFacePositions();
  }

  /**
   * Update the node's scale
   */
  setScale(scale: Position3D): void {
    this.transform.scale = { ...scale };
    this.boundingBox = this.calculateBoundingBox();
    this.updateFacePositions();
  }

  /**
   * Get a face by ID
   */
  getFace(faceId: string): Face | undefined {
    return this.faces.find((face) => face.id === faceId);
  }

  /**
   * Get all available connection points (face centers)
   */
  getConnectionPoints(): Position3D[] {
    return this.faces.map((face) => face.center);
  }

  /**
   * Calculate bounding box based on geometry and transform
   */
  private calculateBoundingBox(): BoundingBox {
    const { position, scale } = this.transform;
    const halfSize = {
      x: scale.x / 2,
      y: scale.y / 2,
      z: scale.z / 2,
    };

    return {
      min: {
        x: position.x - halfSize.x,
        y: position.y - halfSize.y,
        z: position.z - halfSize.z,
      },
      max: {
        x: position.x + halfSize.x,
        y: position.y + halfSize.y,
        z: position.z + halfSize.z,
      },
      center: { ...position },
      size: { ...scale },
    };
  }

  /**
   * Generate faces based on geometry type
   */
  private generateFaces(): Face[] {
    const { position, scale } = this.transform;

    switch (this.geometry) {
      case GeometryType.CUBE:
        return this.generateCubeFaces(position, scale);
      case GeometryType.PLANE:
        return this.generatePlaneFaces(position, scale);
      case GeometryType.DODECAHEDRON:
        return this.generateDodecahedronFaces(position, scale);
      default:
        return this.generateCubeFaces(position, scale);
    }
  }

  /**
   * Generate faces for a cube
   */
  private generateCubeFaces(position: Position3D, scale: Position3D): Face[] {
    const faces: Face[] = [];
    const halfScale = { x: scale.x / 2, y: scale.y / 2, z: scale.z / 2 };

    // Front face
    faces.push({
      id: 'front',
      normal: { x: 0, y: 0, z: 1 },
      center: { x: position.x, y: position.y, z: position.z + halfScale.z },
      vertices: [
        {
          x: position.x - halfScale.x,
          y: position.y - halfScale.y,
          z: position.z + halfScale.z,
        },
        {
          x: position.x + halfScale.x,
          y: position.y - halfScale.y,
          z: position.z + halfScale.z,
        },
        {
          x: position.x + halfScale.x,
          y: position.y + halfScale.y,
          z: position.z + halfScale.z,
        },
        {
          x: position.x - halfScale.x,
          y: position.y + halfScale.y,
          z: position.z + halfScale.z,
        },
      ],
    });

    // Back face
    faces.push({
      id: 'back',
      normal: { x: 0, y: 0, z: -1 },
      center: { x: position.x, y: position.y, z: position.z - halfScale.z },
      vertices: [
        {
          x: position.x + halfScale.x,
          y: position.y - halfScale.y,
          z: position.z - halfScale.z,
        },
        {
          x: position.x - halfScale.x,
          y: position.y - halfScale.y,
          z: position.z - halfScale.z,
        },
        {
          x: position.x - halfScale.x,
          y: position.y + halfScale.y,
          z: position.z - halfScale.z,
        },
        {
          x: position.x + halfScale.x,
          y: position.y + halfScale.y,
          z: position.z - halfScale.z,
        },
      ],
    });

    // Add top, bottom, left, right faces...
    // (Similar pattern for other faces)

    return faces;
  }

  /**
   * Generate faces for a plane (simplified - just front and back)
   */
  private generatePlaneFaces(position: Position3D, scale: Position3D): Face[] {
    return [
      {
        id: 'front',
        normal: { x: 0, y: 0, z: 1 },
        center: { ...position },
        vertices: [
          {
            x: position.x - scale.x / 2,
            y: position.y - scale.y / 2,
            z: position.z,
          },
          {
            x: position.x + scale.x / 2,
            y: position.y - scale.y / 2,
            z: position.z,
          },
          {
            x: position.x + scale.x / 2,
            y: position.y + scale.y / 2,
            z: position.z,
          },
          {
            x: position.x - scale.x / 2,
            y: position.y + scale.y / 2,
            z: position.z,
          },
        ],
      },
    ];
  }

  /**
   * Generate faces for a dodecahedron (simplified - 12 pentagonal faces)
   */
  private generateDodecahedronFaces(
    position: Position3D,
    scale: Position3D
  ): Face[] {
    // This is a simplified implementation
    // In a real implementation, you'd calculate the proper pentagonal face positions
    const faces: Face[] = [];
    const radius = Math.max(scale.x, scale.y, scale.z) / 2;

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      faces.push({
        id: `face_${i}`,
        normal: { x: Math.cos(angle), y: Math.sin(angle), z: 0 },
        center: {
          x: position.x + Math.cos(angle) * radius,
          y: position.y + Math.sin(angle) * radius,
          z: position.z,
        },
        vertices: [], // Would calculate pentagon vertices here
      });
    }

    return faces;
  }

  /**
   * Update face positions after transform changes
   */
  private updateFacePositions(): void {
    this.faces = this.generateFaces();
  }

  /**
   * Get default color based on node type
   */
  private getDefaultColor(): string {
    const colorMap: Record<NodeType, string> = {
      [NodeType.FUNCTION]: '#4CAF50',
      [NodeType.COMPONENT]: '#2196F3',
      [NodeType.DATAPATH]: '#FF9800',
      [NodeType.MODULE]: '#9C27B0',
      [NodeType.CLASS]: '#F44336',
      [NodeType.INTERFACE]: '#00BCD4',
      [NodeType.VARIABLE]: '#FFEB3B',
      [NodeType.CONSTANT]: '#795548',
    };

    return colorMap[this.type] || '#808080';
  }
}
