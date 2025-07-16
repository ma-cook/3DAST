import { Position3D, GeometryType } from '../types/geometry';
import { NodeType, ConnectionType } from '../types/ast';

/**
 * Utility helper functions
 */
export class Helpers {
  /**
   * Generate a unique ID
   */
  static generateId(prefix: string = 'id'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    if (obj instanceof Map) {
      const cloned = new Map();
      for (const [key, value] of obj) {
        cloned.set(key, this.deepClone(value));
      }
      return cloned as unknown as T;
    }

    if (obj instanceof Set) {
      const cloned = new Set();
      for (const value of obj) {
        cloned.add(this.deepClone(value));
      }
      return cloned as unknown as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }
  /**
   * Merge two objects deeply
   */
  static deepMerge<T>(target: T, source: Partial<T>): T {
    const result = this.deepClone(target);

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          (result as any)[key] = this.deepMerge(
            targetValue,
            sourceValue as any
          );
        } else {
          (result as any)[key] = sourceValue;
        }
      }
    }

    return result;
  }

  /**
   * Check if value is a plain object
   */
  static isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a number between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between two numbers
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Linear interpolation between two 3D positions
   */
  static lerpPosition(
    start: Position3D,
    end: Position3D,
    t: number
  ): Position3D {
    return {
      x: this.lerp(start.x, end.x, t),
      y: this.lerp(start.y, end.y, t),
      z: this.lerp(start.z, end.z, t),
    };
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
   * Add two 3D vectors
   */
  static addVectors(v1: Position3D, v2: Position3D): Position3D {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y,
      z: v1.z + v2.z,
    };
  }

  /**
   * Subtract two 3D vectors
   */
  static subtractVectors(v1: Position3D, v2: Position3D): Position3D {
    return {
      x: v1.x - v2.x,
      y: v1.y - v2.y,
      z: v1.z - v2.z,
    };
  }

  /**
   * Multiply vector by scalar
   */
  static multiplyVector(v: Position3D, scalar: number): Position3D {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
      z: v.z * scalar,
    };
  }

  /**
   * Normalize a 3D vector
   */
  static normalizeVector(v: Position3D): Position3D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length,
    };
  }

  /**
   * Calculate dot product of two vectors
   */
  static dotProduct(v1: Position3D, v2: Position3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * Calculate cross product of two vectors
   */
  static crossProduct(v1: Position3D, v2: Position3D): Position3D {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x,
    };
  }
  /**
   * Convert string to enum value safely
   */
  static stringToEnum<T extends Record<string, string>>(
    enumObj: T,
    value: string,
    defaultValue: T[keyof T]
  ): T[keyof T] {
    const enumValues = Object.values(enumObj);
    const upperValue = value.toUpperCase();

    for (const enumValue of enumValues) {
      if (enumValue.toUpperCase() === upperValue) {
        return enumValue as T[keyof T];
      }
    }

    return defaultValue;
  }

  /**
   * Get display name for node type
   */
  static getNodeTypeDisplayName(type: NodeType): string {
    const displayNames: Record<NodeType, string> = {
      [NodeType.FUNCTION]: 'Function',
      [NodeType.COMPONENT]: 'Component',
      [NodeType.DATAPATH]: 'Data Path',
      [NodeType.MODULE]: 'Module',
      [NodeType.CLASS]: 'Class',
      [NodeType.INTERFACE]: 'Interface',
      [NodeType.VARIABLE]: 'Variable',
      [NodeType.CONSTANT]: 'Constant',
    };

    return displayNames[type] || 'Unknown';
  }

  /**
   * Get display name for connection type
   */
  static getConnectionTypeDisplayName(type: ConnectionType): string {
    const displayNames: Record<ConnectionType, string> = {
      [ConnectionType.DATA_FLOW]: 'Data Flow',
      [ConnectionType.CONTROL_FLOW]: 'Control Flow',
      [ConnectionType.INHERITANCE]: 'Inheritance',
      [ConnectionType.COMPOSITION]: 'Composition',
      [ConnectionType.DEPENDENCY]: 'Dependency',
      [ConnectionType.ASSOCIATION]: 'Association',
    };

    return displayNames[type] || 'Unknown';
  }
  /**
   * Get display name for geometry type
   */
  static getGeometryTypeDisplayName(type: GeometryType): string {
    const displayNames: Record<GeometryType, string> = {
      [GeometryType.CUBE]: 'Cube',
      [GeometryType.DODECAHEDRON]: 'Dodecahedron',
      [GeometryType.PLANE]: 'Plane',
    };

    return displayNames[type] || 'Unknown';
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format number with thousands separators
   */
  static formatNumber(num: number): string {
    return num.toLocaleString();
  }
  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}
