import { MarkdownProcessor, AST3DGenerator } from '../src';
// Note: Three.js would be imported in a real application
// import * as THREE from 'three';

/**
 * Complete example of uploading markdown files with Merfolk syntax
 * and automatically building 3D diagrams in your application
 *
 * Note: This is a documentation example. In a real Three.js application,
 * you would uncomment the Three.js imports and implementations.
 */

// Configuration for your 3D visualization
const config = {
  layout: {
    algorithm: 'hierarchical' as const,
    nodeSpacing: 4.0,
    layers: 5,
  },
  visual: {
    theme: 'dark' as const,
    colors: {
      function: '#4CAF50', // Green cubes for functions
      component: '#2196F3', // Blue dodecahedrons for components
      datapath: '#FF9800', // Orange planes for data paths
      interface: '#00BCD4', // Cyan for interfaces
      variable: '#FFEB3B', // Yellow for variables
      constant: '#795548', // Brown for constants
    },
    material: {
      metalness: 0.2,
      roughness: 0.6,
      opacity: 0.9,
    },
  },
};

/**
 * Main class for handling markdown file uploads and 3D diagram generation
 */
export class MerfolkDiagramBuilder {
  private processor: MarkdownProcessor;
  private scene: THREE.Scene;
  private diagrams: Map<string, any> = new Map();

  constructor(scene: THREE.Scene, customConfig?: any) {
    this.scene = scene;
    this.processor = new MarkdownProcessor(customConfig || config);
  }

  /**
   * Upload and process a markdown file containing Merfolk syntax
   * @param file File object from HTML input or dropped file
   * @returns Promise with the generated 3D scene data
   */
  async uploadMarkdownFile(file: File): Promise<{
    success: boolean;
    diagrams: any[];
    errors: string[];
    metadata: any;
  }> {
    try {
      // Read the file content
      const markdownContent = await this.readFileContent(file);

      // Process the markdown and generate 3D diagrams
      const result = await this.processMarkdownContent(
        markdownContent,
        file.name
      );

      return result;
    } catch (error) {
      return {
        success: false,
        diagrams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: { fileName: file.name, fileSize: file.size },
      };
    }
  }

  /**
   * Process markdown content from a string
   * @param markdownContent The markdown content as string
   * @param fileName Optional filename for metadata
   */
  async processMarkdownContent(
    markdownContent: string,
    fileName?: string
  ): Promise<{
    success: boolean;
    diagrams: any[];
    errors: string[];
    metadata: any;
  }> {
    try {
      // Extract and process all Merfolk diagrams
      const diagrams = this.processor.processMarkdown(markdownContent);

      const processedDiagrams: any[] = [];
      const errors: string[] = [];

      diagrams.forEach((diagram, index) => {
        if (diagram.errors.length === 0) {
          const graph = diagram.graph;

          // Convert to 3D scene data
          const diagramData = this.convertGraphToSceneData(
            graph,
            diagram,
            index
          );
          processedDiagrams.push(diagramData);

          // Add to the 3D scene
          this.addDiagramToScene(diagramData, index);

          // Store for later reference
          this.diagrams.set(diagramData.id, diagramData);

          console.log(
            `✅ Generated diagram "${diagramData.title}": ${graph.nodes.size} nodes, ${graph.connections.size} connections`
          );
        } else {
          errors.push(`Diagram ${index + 1}: ${diagram.errors.join(', ')}`);
          console.log(`❌ Diagram ${index + 1} has errors:`, diagram.errors);
        }
      });

      return {
        success: processedDiagrams.length > 0,
        diagrams: processedDiagrams,
        errors,
        metadata: {
          fileName: fileName || 'uploaded-content',
          totalDiagrams: diagrams.length,
          successfulDiagrams: processedDiagrams.length,
          totalNodes: processedDiagrams.reduce(
            (sum, d) => sum + d.nodes.length,
            0
          ),
          totalConnections: processedDiagrams.reduce(
            (sum, d) => sum + d.connections.length,
            0
          ),
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        diagrams: [],
        errors: [error instanceof Error ? error.message : 'Processing failed'],
        metadata: { fileName: fileName || 'uploaded-content' },
      };
    }
  }

  /**
   * Convert a graph to 3D scene data
   */
  private convertGraphToSceneData(graph: any, diagram: any, index: number) {
    return {
      id: `diagram_${index}_${Date.now()}`,
      title: diagram.block.title || `Diagram ${index + 1}`,
      description: diagram.block.description || '',
      position: {
        x: index * 25, // Spread diagrams horizontally
        y: 0,
        z: 0,
      },
      nodes: Array.from(graph.nodes.values()).map((node: any) => ({
        id: node.id,
        type: node.type,
        name: node.name,
        geometry: node.geometry,
        position: node.transform.position,
        rotation: node.transform.rotation,
        scale: node.transform.scale,
        color: node.visual.color,
        opacity: node.visual.opacity,
        faces:
          node.faces?.map((face: any) => ({
            id: face.id,
            center: face.center,
            normal: face.normal,
          })) || [],
      })),
      connections: Array.from(graph.connections.values()).map((conn: any) => ({
        id: conn.id,
        type: conn.type,
        source: {
          nodeId: conn.source.nodeId,
          faceId: conn.source.faceId,
          position: conn.source.anchor,
        },
        target: {
          nodeId: conn.target.nodeId,
          faceId: conn.target.faceId,
          position: conn.target.anchor,
        },
        waypoints: conn.waypoints || [],
        color: conn.visual.color,
        label: conn.visual.label?.text,
      })),
      bounds: graph.getBounds(),
    };
  }

  /**
   * Add a diagram to the Three.js scene
   */
  private addDiagramToScene(diagramData: any, index: number) {
    const diagramGroup = new THREE.Group();
    diagramGroup.name = diagramData.id;
    diagramGroup.position.set(
      diagramData.position.x,
      diagramData.position.y,
      diagramData.position.z
    );

    // Add nodes as 3D meshes
    diagramData.nodes.forEach((node: any) => {
      const mesh = this.createNodeMesh(node);
      if (mesh) {
        mesh.userData = { nodeId: node.id, diagramId: diagramData.id };
        diagramGroup.add(mesh);
      }
    });

    // Add connections as lines
    diagramData.connections.forEach((connection: any) => {
      const line = this.createConnectionLine(connection, diagramData.nodes);
      if (line) {
        line.userData = {
          connectionId: connection.id,
          diagramId: diagramData.id,
        };
        diagramGroup.add(line);
      }
    });

    this.scene.add(diagramGroup);
  }

  /**
   * Create a 3D mesh for a node based on its geometry
   */
  private createNodeMesh(node: any): THREE.Mesh | null {
    let geometry: THREE.BufferGeometry;

    // Create geometry based on node type
    switch (node.geometry) {
      case 'cube':
        geometry = new THREE.BoxGeometry(
          node.scale[0],
          node.scale[1],
          node.scale[2]
        );
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(Math.max(...node.scale) / 2);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(node.scale[0], node.scale[1]);
        break;
      default:
        console.warn(`Unknown geometry type: ${node.geometry}`);
        return null;
    }

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(node.color),
      opacity: node.opacity,
      transparent: node.opacity < 1,
      metalness: config.visual.material.metalness,
      roughness: config.visual.material.roughness,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);

    return mesh;
  }

  /**
   * Create a connection line between nodes
   */
  private createConnectionLine(
    connection: any,
    nodes: any[]
  ): THREE.Line | null {
    const sourceNode = nodes.find((n) => n.id === connection.source.nodeId);
    const targetNode = nodes.find((n) => n.id === connection.target.nodeId);

    if (!sourceNode || !targetNode) {
      console.warn(`Could not find nodes for connection: ${connection.id}`);
      return null;
    }

    // Create line points
    const points = [
      new THREE.Vector3(
        sourceNode.position.x,
        sourceNode.position.y,
        sourceNode.position.z
      ),
      ...connection.waypoints.map(
        (wp: any) => new THREE.Vector3(wp.x, wp.y, wp.z)
      ),
      new THREE.Vector3(
        targetNode.position.x,
        targetNode.position.y,
        targetNode.position.z
      ),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(connection.color || '#ffffff'),
      linewidth: 2,
    });

    return new THREE.Line(geometry, material);
  }

  /**
   * Read file content as text
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  }

  /**
   * Clear all diagrams from the scene
   */
  clearAllDiagrams() {
    this.diagrams.forEach((_, diagramId) => {
      const diagramGroup = this.scene.getObjectByName(diagramId);
      if (diagramGroup) {
        this.scene.remove(diagramGroup);
      }
    });
    this.diagrams.clear();
  }

  /**
   * Remove a specific diagram
   */
  removeDiagram(diagramId: string) {
    const diagramGroup = this.scene.getObjectByName(diagramId);
    if (diagramGroup) {
      this.scene.remove(diagramGroup);
      this.diagrams.delete(diagramId);
    }
  }

  /**
   * Get all current diagrams
   */
  getAllDiagrams() {
    return Array.from(this.diagrams.values());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: any) {
    this.processor = new MarkdownProcessor(newConfig);
  }
}

/**
 * Simple HTML-based file uploader for vanilla JavaScript/TypeScript
 */
export function createMarkdownUploader(
  scene: THREE.Scene,
  containerId: string,
  onDiagramsGenerated: (result: DiagramResult) => void
) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id '${containerId}' not found`);
  }

  const builder = new MerfolkDiagramBuilder(scene);

  // Create upload area
  const uploadArea = document.createElement('div');
  uploadArea.style.cssText = `
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    border-radius: 8px;
    background: #f9f9f9;
    margin: 10px 0;
  `;
  uploadArea.innerHTML = `
    <p>Click to upload or drag & drop your Merfolk markdown file here</p>
    <input type="file" accept=".md,.markdown" style="display: none;" id="file-input">
  `;

  const fileInput = uploadArea.querySelector('#file-input') as HTMLInputElement;

  // Click to upload
  uploadArea.addEventListener('click', () => fileInput.click());

  // File selection
  fileInput.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const result = await builder.uploadMarkdownFile(file);
      onDiagramsGenerated(result);
    }
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007bff';
    uploadArea.style.backgroundColor = '#e3f2fd';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = '#f9f9f9';
  });

  uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = '#f9f9f9';

    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.md')) {
      const result = await builder.uploadMarkdownFile(file);
      onDiagramsGenerated(result);
    }
  });

  container.appendChild(uploadArea);

  return {
    builder,
    uploadArea,
    destroy: () => container.removeChild(uploadArea),
  };
}

/**
 * Example usage in your 3D application
 */
export function setupMerfolkUploader(scene: THREE.Scene) {
  const builder = new MerfolkDiagramBuilder(scene);

  // Example: Process from file upload
  const processUploadedFile = async (file: File) => {
    const result = await builder.uploadMarkdownFile(file);

    if (result.success) {
      console.log(
        `🎉 Successfully generated ${result.diagrams.length} diagrams!`
      );
      console.log('Metadata:', result.metadata);
    } else {
      console.error('❌ Errors:', result.errors);
    }

    return result;
  };

  // Example: Process from string content
  const processMarkdownString = async (markdownContent: string) => {
    const result = await builder.processMarkdownContent(
      markdownContent,
      'direct-input'
    );
    return result;
  };

  return {
    builder,
    processUploadedFile,
    processMarkdownString,
    clearAll: () => builder.clearAllDiagrams(),
    getDiagrams: () => builder.getAllDiagrams(),
  };
}

// Export types for TypeScript users
export interface DiagramResult {
  success: boolean;
  diagrams: any[];
  errors: string[];
  metadata: any;
}

export interface NodeData {
  id: string;
  type: string;
  name: string;
  geometry: 'cube' | 'dodecahedron' | 'plane';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
}

export interface ConnectionData {
  id: string;
  type: string;
  source: {
    nodeId: string;
    faceId?: string;
    position: [number, number, number];
  };
  target: {
    nodeId: string;
    faceId?: string;
    position: [number, number, number];
  };
  waypoints: Array<{ x: number; y: number; z: number }>;
  color: string;
  label?: string;
}
