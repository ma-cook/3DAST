import { MarkdownProcessor, AST3DGenerator } from '../src';
import {
  GeometryType,
  Position3D,
  BoundingBox,
  Rotation3D,
  Scale3D,
} from '../src/types/geometry';
import { NodeType, ConnectionType } from '../src/types/ast';
import fs from 'fs';
import path from 'path';

/**
 * Example of how to integrate 3D AST with your 3D application
 */

// Define types for the scene data
interface DiagramData {
  id: string;
  title: string;
  position: { x: number; y: number; z: number };
  nodes: Array<{
    id: string;
    type: NodeType;
    name: string;
    geometry: GeometryType;
    position: Position3D;
    rotation: Rotation3D;
    scale: Scale3D;
    color: string | undefined;
    opacity: number | undefined;
    faces: Array<{
      id: string;
      center: Position3D;
      normal: Position3D;
    }>;
  }>;
  connections: Array<{
    id: string;
    type: ConnectionType;
    source: {
      nodeId: string;
      faceId?: string;
      position: Position3D | undefined;
    };
    target: {
      nodeId: string;
      faceId?: string;
      position: Position3D | undefined;
    };
    waypoints: Position3D[];
    color: string | undefined;
    label?: string;
  }>;
  bounds: BoundingBox;
}

interface SceneData {
  diagrams: DiagramData[];
  metadata: {
    source: string;
    processedAt: string;
    totalNodes: number;
    totalConnections: number;
  };
}

// Configuration for your 3D visualization
const config = {
  layout: {
    algorithm: 'hierarchical' as const,
    nodeSpacing: 30.0,
    layers: 5,
  },
  visual: {
    theme: 'dark' as const,
    colors: {
      function: '#4CAF50', // Green cubes for functions
      component: '#2196F3', // Blue dodecahedrons for components      datapath: '#FF9800',      // Orange planes for data paths
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

// Create processor
const processor = new MarkdownProcessor(config);

// Example: Process a markdown file with multiple 3D diagrams
async function processArchitectureDoc(filePath: string) {
  try {
    // Read the markdown file
    const markdownContent = fs.readFileSync(filePath, 'utf8');

    // Process all 3D AST blocks
    const diagrams = processor.processMarkdown(markdownContent);

    console.log(`📊 Processed ${diagrams.length} diagrams from ${filePath}`);

    // Create your 3D scene data
    const sceneData: SceneData = {
      diagrams: [],
      metadata: {
        source: filePath,
        processedAt: new Date().toISOString(),
        totalNodes: 0,
        totalConnections: 0,
      },
    };

    diagrams.forEach((diagram, index) => {
      if (diagram.errors.length === 0) {
        const graph = diagram.graph;

        // Convert to your 3D application format
        const diagramData = {
          id: `diagram_${index}`,
          title: diagram.block.title || `Diagram ${index + 1}`,
          position: {
            x: index * 25, // Spread diagrams horizontally
            y: 0,
            z: 0,
          },
          nodes: Array.from(graph.nodes.values()).map((node) => ({
            id: node.id,
            type: node.type,
            name: node.name,
            geometry: node.geometry,
            position: node.transform.position,
            rotation: node.transform.rotation,
            scale: node.transform.scale,
            color: node.visual.color,
            opacity: node.visual.opacity,
            faces: node.faces.map((face) => ({
              id: face.id,
              center: face.center,
              normal: face.normal,
            })),
          })),
          connections: Array.from(graph.connections.values()).map((conn) => ({
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
            waypoints: conn.waypoints,
            color: conn.visual.color,
            label: conn.visual.label?.text,
          })),
          bounds: graph.getBounds(),
        };

        sceneData.diagrams.push(diagramData);
        sceneData.metadata.totalNodes += graph.nodes.size;
        sceneData.metadata.totalConnections += graph.connections.size;

        console.log(
          `✅ Diagram "${diagramData.title}": ${graph.nodes.size} nodes, ${graph.connections.size} connections`
        );
      } else {
        console.log(`❌ Diagram ${index + 1} has errors:`, diagram.errors);
      }
    });

    return sceneData;
  } catch (error) {
    console.error('Error processing architecture document:', error);
    throw error;
  }
}

// Example: Live processing of markdown content
function createLiveProcessor() {
  const generator = new AST3DGenerator(config);

  return {
    // Process a single 3D AST code block
    processSingle: (ast3dCode: string) => {
      try {
        const validation = generator.validate(ast3dCode);

        if (!validation.valid) {
          return {
            success: false,
            errors: validation.errors,
            graph: null,
          };
        }

        const graph = generator.generate(ast3dCode);

        return {
          success: true,
          errors: [],
          graph: {
            nodes: Array.from(graph.nodes.values()).map((node) => ({
              id: node.id,
              type: node.type,
              name: node.name,
              geometry: node.geometry,
              position: node.transform.position,
              scale: node.transform.scale,
              color: node.visual.color,
              faces: node.faces,
            })),
            connections: Array.from(graph.connections.values()).map((conn) => ({
              id: conn.id,
              type: conn.type,
              source: conn.source,
              target: conn.target,
              color: conn.visual.color,
              waypoints: conn.waypoints,
            })),
            bounds: graph.getBounds(),
          },
        };
      } catch (error) {
        return {
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          graph: null,
        };
      }
    },

    // Update configuration
    updateConfig: (newConfig: any) => {
      generator.updateConfig(newConfig);
    },
  };
}

// Example usage with your 3D engine (Three.js, Babylon.js, etc.)
class Architecture3DVisualizer {
  private processor: MarkdownProcessor;
  private scenes: Map<string, any> = new Map();

  constructor() {
    this.processor = new MarkdownProcessor(config);
  }

  // Load architecture from markdown file
  async loadArchitecture(filePath: string, sceneName: string) {
    const sceneData = await processArchitectureDoc(filePath);

    // Create 3D scene (pseudo-code for your 3D engine)
    const scene = this.createScene(sceneName);

    sceneData.diagrams.forEach((diagram: DiagramData) => {
      // Add nodes as 3D objects
      diagram.nodes.forEach((node) => {
        const mesh = this.createNodeMesh(node);
        scene.add(mesh);
      });

      // Add connections as lines/curves
      diagram.connections.forEach((connection) => {
        const line = this.createConnectionLine(connection);
        scene.add(line);
      });
    });

    this.scenes.set(sceneName, scene);
    return scene;
  }

  // Update architecture from new markdown content
  updateArchitecture(markdownContent: string, sceneName: string) {
    const diagrams = this.processor.processMarkdown(markdownContent);

    // Clear existing scene
    const scene = this.scenes.get(sceneName);
    if (scene) {
      this.clearScene(scene);

      // Rebuild with new data
      diagrams.forEach((diagram) => {
        if (diagram.errors.length === 0) {
          this.addDiagramToScene(diagram, scene);
        }
      });
    }
  }

  // Pseudo-methods for your 3D engine integration
  private createScene(name: string): any {
    // Create your 3D scene here
    console.log(`Creating scene: ${name}`);
    return {};
  }

  private createNodeMesh(node: any): any {
    // Create 3D mesh based on node.geometry type
    console.log(`Creating ${node.geometry} mesh for ${node.name}`);
    return {};
  }

  private createConnectionLine(connection: any): any {
    // Create line/curve between nodes
    console.log(
      `Creating connection from ${connection.source.nodeId} to ${connection.target.nodeId}`
    );
    return {};
  }

  private clearScene(scene: any): void {
    // Clear all objects from scene
    console.log('Clearing scene');
  }

  private addDiagramToScene(diagram: any, scene: any): void {
    // Add diagram to existing scene
    console.log(`Adding diagram to scene`);
  }
}

// Example: Generate a complete project documentation
async function generateProjectDocs() {
  const docsPath = path.join(__dirname, '../docs');
  const outputPath = path.join(__dirname, '../dist/documentation.html');

  // Find all markdown files with 3D AST content
  const markdownFiles = fs
    .readdirSync(docsPath)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(docsPath, file));

  let combinedContent = '';

  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf8');
    combinedContent += content + '\n\n';
  }

  // Generate HTML documentation
  const htmlDocs = processor.generateHTMLDocs(combinedContent);
  fs.writeFileSync(outputPath, htmlDocs);

  console.log(`📄 Generated documentation: ${outputPath}`);

  // Also export JSON for 3D applications
  const jsonExport = processor.exportToJSON(combinedContent);
  const jsonPath = path.join(__dirname, '../dist/diagrams.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonExport, null, 2));

  console.log(`📊 Exported diagrams: ${jsonPath}`);
}

// Export examples
export {
  processArchitectureDoc,
  createLiveProcessor,
  Architecture3DVisualizer,
  generateProjectDocs,
};

// Run example if this file is executed directly
if (require.main === module) {
  console.log('🚀 Running 3D AST integration examples...');

  // Example 1: Process sample markdown
  const samplePath = path.join(__dirname, '../docs/usage-guide.md');
  if (fs.existsSync(samplePath)) {
    processArchitectureDoc(samplePath)
      .then((sceneData) => {
        console.log('\n📈 Scene data summary:');
        console.log(`- Diagrams: ${sceneData.diagrams.length}`);
        console.log(`- Total nodes: ${sceneData.metadata.totalNodes}`);
        console.log(
          `- Total connections: ${sceneData.metadata.totalConnections}`
        );
      })
      .catch(console.error);
  }

  // Example 2: Generate documentation
  generateProjectDocs().catch(console.error);
}
