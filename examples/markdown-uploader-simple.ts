import { MarkdownProcessor, AST3DGenerator } from '../src';

/**
 * Simple example of processing markdown files with Merfolk syntax
 * This shows the data processing without 3D rendering dependencies
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
 * Markdown file processor for 3D diagrams
 */
export class MarkdownProcessor3D {
  private processor: MarkdownProcessor;
  private diagrams: any[] = [];

  constructor(customConfig?: any) {
    this.processor = new MarkdownProcessor(customConfig || config);
  }

  /**
   * Process markdown content and extract diagram data
   * @param markdownContent String content of the markdown file
   * @returns Processed diagram data ready for 3D rendering
   */
  async processMarkdownContent(markdownContent: string): Promise<{
    success: boolean;
    diagrams: any[];
    errors: string[];
    metadata: any;
  }> {
    try {
      console.log('🔄 Processing markdown content...');

      // Process all Merfolk blocks in the markdown
      const diagrams = this.processor.processMarkdown(markdownContent);

      // Filter out diagrams with errors
      const validDiagrams = diagrams.filter((d) => d.errors.length === 0);
      const errors = diagrams
        .filter((d) => d.errors.length > 0)
        .flatMap((d) => d.errors);

      console.log(`✅ Successfully processed ${validDiagrams.length} diagrams`);
      if (errors.length > 0) {
        console.warn(`⚠️ Found ${errors.length} errors in diagrams`);
      }

      // Convert to a format suitable for 3D applications
      const processedDiagrams = validDiagrams.map((diagram, index) => ({
        id: `diagram_${index}`,
        title: diagram.block.title || `Diagram ${index + 1}`,
        nodes: Array.from(diagram.graph.nodes.values()).map((node) => ({
          id: node.id,
          type: node.type,
          name: node.name,
          geometry: node.geometry,
          position: node.transform.position,
          rotation: node.transform.rotation,
          scale: node.transform.scale,
          color: node.visual.color || '#ffffff',
          opacity: node.visual.opacity || 1.0,
        })),
        connections: Array.from(diagram.graph.connections.values()).map(
          (conn) => ({
            id: conn.id,
            type: conn.type,
            source: {
              nodeId: conn.source.nodeId,
              faceId: conn.source.faceId,
            },
            target: {
              nodeId: conn.target.nodeId,
              faceId: conn.target.faceId,
            },
            color: conn.visual.color || '#ffffff',
            label: conn.visual.label?.text,
          })
        ),
        bounds: diagram.graph.getBounds(),
      }));

      return {
        success: true,
        diagrams: processedDiagrams,
        errors,
        metadata: {
          processedAt: new Date().toISOString(),
          totalDiagrams: validDiagrams.length,
          totalNodes: processedDiagrams.reduce(
            (sum, d) => sum + d.nodes.length,
            0
          ),
          totalConnections: processedDiagrams.reduce(
            (sum, d) => sum + d.connections.length,
            0
          ),
        },
      };
    } catch (error) {
      console.error('❌ Error processing markdown:', error);
      return {
        success: false,
        diagrams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          processedAt: new Date().toISOString(),
          totalDiagrams: 0,
          totalNodes: 0,
          totalConnections: 0,
        },
      };
    }
  }

  /**
   * Process a markdown file from the filesystem
   * @param filePath Path to the markdown file
   */
  async processMarkdownFile(filePath: string) {
    const fs = await import('fs');
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    return this.processMarkdownContent(markdownContent);
  }
}

/**
 * Example usage
 */
export async function exampleUsage() {
  const processor = new MarkdownProcessor3D();

  // Example markdown content with Merfolk syntax
  const exampleMarkdown = `
# My Architecture

\`\`\`merfolk
graph3d "Simple System"

Frontend[Component: WebApp] {color: "#2196F3"}
Backend[Function: APIServer] {color: "#4CAF50"}
Database((Module: PostgreSQL)) {color: "#FF9800"}

Frontend --> Backend : "HTTP requests"
Backend --> Database : "SQL queries"
\`\`\`
`;

  // Process the markdown
  const result = await processor.processMarkdownContent(exampleMarkdown);

  if (result.success) {
    console.log('📊 Diagram data ready for 3D rendering:');
    console.log(JSON.stringify(result.diagrams, null, 2));
  } else {
    console.error('❌ Processing failed:', result.errors);
  }

  return result;
}

// Export for use in other applications
export default MarkdownProcessor3D;
