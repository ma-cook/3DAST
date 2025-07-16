# 3D AST Generator

A TypeScript library for parsing Merfolk syntax and generating 3D abstract syntax trees for visualization. Perfect for creating 3D diagrams of application architectures, data flows, and system relationships.

## Features

- 🎯 **Merfolk Syntax**: Familiar, easy-to-write syntax for defining nodes and connections
- 🧊 **Multiple 3D Geometries**: Cubes, dodecahedrons, and planes
- 🔗 **Face-specific Connections**: Connect to specific faces of 3D objects
- 📐 **Smart Layout Algorithms**: Hierarchical, force-directed, circular, and grid layouts
- 🎨 **Customizable Visuals**: Themes, colors, materials, and styling options
- ⚡ **TypeScript Native**: Full type safety and IntelliSense support
- 🔧 **Plugin Ready**: Designed to integrate with 3D visualization applications

## Installation

```bash
npm install 3d-ast-generator
```

## Quick Start

```typescript
import { MarkdownProcessor, AST3DGenerator } from '3d-ast-generator';

const generator = new AST3DGenerator();

const syntax = `
graph3d "My Application"

A[Function: processData]
B{Component: UserInterface}  
C<Datapath: Database>

A --> B : "processed data"
B -.-> A : "user events"
A --> C : "queries"
`;

const graph = generator.generate(syntax);
console.log(
  `Generated ${graph.nodes.size} nodes and ${graph.connections.size} connections`
);

// Export for your 3D application
const jsonData = generator.generateJSON(syntax);

// Or process markdown files with multiple diagrams
const processor = new MarkdownProcessor({
  layout: { algorithm: 'hierarchical', nodeSpacing: 4.0 },
  visual: { theme: 'dark' },
});

const markdownContent = `
# My Architecture
\`\`\`merfolk
graph3d "System Overview"
A[Function: API] --> B{Component: UI}
\`\`\`
`;

const diagrams = processor.processMarkdown(markdownContent);
diagrams.forEach((diagram) => {
  if (diagram.errors.length === 0) {
    console.log(`Diagram: ${diagram.block.title || 'Untitled'}`);
    console.log(`Nodes: ${diagram.graph.nodes.size}`);
  }
});
```

## Syntax Guide

### Node Types & Geometries

| Syntax               | Type      | Geometry     | Use Case               |
| -------------------- | --------- | ------------ | ---------------------- |
| `A[Function: name]`  | Function  | Cube         | Functions, methods     |
| `B{Component: name}` | Component | Dodecahedron | UI components, modules |
| `C<Datapath: name>`  | Datapath  | Plane        | Data flows, streams    |

**Note**: Use `<Datapath: name>` instead of `((Module: name))` for plane geometry.

### Connection Types

| Syntax     | Type         | Style        | Use Case                 |
| ---------- | ------------ | ------------ | ------------------------ |
| `A --> B`  | Data Flow    | Solid arrow  | Data passing             |
| `A -.-> B` | Control Flow | Dashed arrow | Event/control flow       |
| `A --- B`  | Association  | Solid line   | General relationships    |
| `A == B`   | Inheritance  | Thick line   | Inheritance/dependencies |

### Face Connections

Connect to specific faces of 3D objects:

```
A@front --> B@back : "direct connection"
C@top --> D@bottom : "vertical flow"
```

**Available faces:**

- Cubes: `front`, `back`, `top`, `bottom`, `left`, `right`
- Dodecahedrons: `face_0` through `face_11`
- Other shapes have context-appropriate face names

### Labels and Properties

```
A --> B : "Connection Label"
C{Component: MyComp} {color: "blue", scale: "2,1,1"}
```

## Configuration

```typescript
const generator = new AST3DGenerator({
  layout: {
    algorithm: 'hierarchical', // 'hierarchical' | 'force-directed' | 'circular' | 'grid'
    nodeSpacing: 3.0,
    layers: 4,
  },
  visual: {
    theme: 'dark', // 'dark' | 'light' | 'custom'
    colors: {
      function: '#4CAF50',
      component: '#2196F3',
      datapath: '#FF9800',
    },
    material: {
      metalness: 0.1,
      roughness: 0.7,
      opacity: 0.9,
    },
  },
});
```

## API Reference

### Available Exports

```typescript
import {
  // Main Classes
  AST3DGenerator,
  MarkdownProcessor,

  // Core Models
  Node,
  Connection,
  Graph,

  // Parsers
  MermaidParser,
  ASTBuilder,

  // Utilities
  PositionCalculator,
  Validator,
  Helpers,

  // Types
  NodeType,
  ConnectionType,
  GeometryType,

  // Configuration
  DEFAULT_CONFIG,
} from '3d-ast-generator';
```

### AST3DGenerator

Main class for generating 3D AST graphs from Merfolk syntax.

#### Methods

- `generate(input: string): Graph` - Parse and generate 3D graph
- `generateJSON(input: string): AST3DGraph` - Generate serializable format
- `validate(input: string): ValidationResult` - Validate syntax
- `parseOnly(input: string): ParsedGraph` - Parse without building

### MarkdownProcessor

Process markdown files containing multiple Merfolk code blocks.

#### Constructor

```typescript
const processor = new MarkdownProcessor(config?: {
  layout?: { algorithm: string, nodeSpacing: number },
  visual?: { theme: string, colors: object }
});
```

#### Methods

- `processMarkdown(content: string): ProcessedDiagram[]` - Extract and process all Merfolk blocks
- `extractMerfolkBlocks(content: string): MerfolkBlock[]` - Extract code blocks only

### Graph

Represents a 3D AST graph with nodes and connections.

#### Properties

- `nodes: Map<string, Node>` - All nodes in the graph
- `connections: Map<string, Connection>` - All connections
- `bounds: BoundingBox` - Overall graph bounding box

#### Methods

- `addNode(node: Node): void` - Add a node
- `addConnection(connection: Connection): void` - Add a connection
- `getBounds(): BoundingBox` - Calculate bounding box
- `getRootNodes(): Node[]` - Get nodes with no parents
- `getLeafNodes(): Node[]` - Get nodes with no children

### Node

Represents a 3D node with geometry and connections.

#### Properties

- `id: string` - Unique identifier
- `type: NodeType` - Node type (function, component, etc.)
- `geometry: GeometryType` - 3D geometry type
- `transform: Transform3D` - Position, rotation, scale
- `faces: Face[]` - Available connection faces
- `visual: VisualProperties` - Visual styling

### Connection

Represents a connection between two nodes.

#### Properties

- `source: ConnectionPoint` - Source node and face
- `target: ConnectionPoint` - Target node and face
- `type: ConnectionType` - Connection type
- `waypoints: Position3D[]` - Path waypoints
- `visual: VisualProperties` - Visual styling

## Integration with 3D Applications

The library outputs standardized 3D data that can be consumed by various 3D engines:

### Three.js Example

```typescript
import * as THREE from 'three';
import { MarkdownProcessor } from '3d-ast-generator';

// Process markdown with Merfolk diagrams
const processor = new MarkdownProcessor();
const markdownContent = `
\`\`\`merfolk
graph3d "My System"
A[Function: WebServer] --> B{Component: Database}
C<Datapath: APIGateway> --> A
\`\`\`
`;

const diagrams = processor.processMarkdown(markdownContent);

// Create Three.js scene
const scene = new THREE.Scene();

diagrams.forEach((diagram, diagramIndex) => {
  if (diagram.errors.length === 0) {
    const graph = diagram.graph;

    // Add nodes as 3D objects
    for (const [nodeId, node] of graph.nodes) {
      let geometry;

      switch (node.geometry) {
        case 'cube':
          geometry = new THREE.BoxGeometry(
            node.transform.scale.x,
            node.transform.scale.y,
            node.transform.scale.z
          );
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(1);
          break;
        case 'plane':
          geometry = new THREE.PlaneGeometry(
            node.transform.scale.x,
            node.transform.scale.y
          );
          break;
      }

      const material = new THREE.MeshStandardMaterial({
        color: node.visual.color || '#ffffff',
        opacity: node.visual.opacity || 1.0,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        node.transform.position.x + diagramIndex * 20,
        node.transform.position.y,
        node.transform.position.z
      );

      scene.add(mesh);
    }

    // Add connections as lines
    for (const [connId, connection] of graph.connections) {
      const points = [
        new THREE.Vector3(
          connection.source.anchor?.x || 0,
          connection.source.anchor?.y || 0,
          connection.source.anchor?.z || 0
        ),
        ...connection.waypoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
        new THREE.Vector3(
          connection.target.anchor?.x || 0,
          connection.target.anchor?.y || 0,
          connection.target.anchor?.z || 0
        ),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: connection.visual.color || '#ffffff',
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  }
});
```

## Examples

See the `examples/` directory for complete usage examples:

- `basic-usage.ts` - Simple API usage
- `sample.md` - Complex application architecture example

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [Mermaid](https://mermaid-js.github.io/) - Inspiration for syntax
- [Three.js](https://threejs.org/) - 3D rendering library
- [D3.js](https://d3js.org/) - Data visualization

## Markdown File Upload & 3D Generation

You can automatically generate 3D diagrams by uploading markdown files containing Merfolk syntax:

### Installation

```bash
npm install 3d-ast-generator
```

### Basic Setup

```typescript
import { MarkdownProcessor } from '3d-ast-generator';

// Create processor with configuration
const processor = new MarkdownProcessor({
  layout: {
    algorithm: 'hierarchical',
    nodeSpacing: 4.0,
    layers: 5,
  },
  visual: {
    theme: 'dark',
    colors: {
      function: '#4CAF50',
      component: '#2196F3',
      datapath: '#FF9800',
    },
  },
});

// Process markdown file upload
const handleFileUpload = async (file: File) => {
  try {
    const content = await file.text();
    const diagrams = processor.processMarkdown(content);

    const validDiagrams = diagrams.filter((d) => d.errors.length === 0);
    const errors = diagrams
      .filter((d) => d.errors.length > 0)
      .flatMap((d) => d.errors);

    if (validDiagrams.length > 0) {
      console.log(`Generated ${validDiagrams.length} 3D diagrams!`);

      // Process each diagram for your 3D application
      validDiagrams.forEach((diagram, index) => {
        const graph = diagram.graph;
        console.log(`Diagram ${index + 1}:`, {
          title: diagram.block.title || 'Untitled',
          nodes: graph.nodes.size,
          connections: graph.connections.size,
          bounds: graph.getBounds(),
        });

        // Add to your 3D scene here
        addDiagramToScene(graph, index);
      });
    } else {
      console.error('No valid diagrams found:', errors);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Helper function to add diagram to your 3D scene
function addDiagramToScene(graph, diagramIndex) {
  // Implementation depends on your 3D library (Three.js, Babylon.js, etc.)
  // See the Three.js example above for complete implementation
}
```

### File Upload UI Helper

```typescript
// Simple file upload handler
function setupFileUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.md,.markdown';
  fileInput.multiple = true;

  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        await handleFileUpload(file);
      }
    }
  });

  // Trigger file selection
  fileInput.click();
}

// Or drag and drop
function setupDragAndDrop(dropZone: HTMLElement) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer?.files || []);
    for (const file of files) {
      if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        await handleFileUpload(file);
      }
    }
  });
}
```

### Markdown File Format

Your markdown files should contain Merfolk code blocks:

```markdown
# My Architecture

This document describes our system architecture.

\`\`\`merfolk
graph3d "System Overview"

A[Function: WebServer] --> B{Component: Database}
C<Datapath: APIGateway> --> A
B --> D[Function: Cache]
\`\`\`

## Data Flow

\`\`\`merfolk  
graph3d "User Registration"

FORM[Component: SignupForm] --> API[Function: UserAPI]
API --> DB[Function: UserDB]
API -.-> EMAIL[Function: EmailService]
\`\`\`
```

### Features

- **Drag & Drop Upload**: Simply drag markdown files into your application
- **Multiple Diagrams**: Process multiple Merfolk diagrams from a single file
- **Automatic 3D Positioning**: Diagrams are automatically positioned in 3D space
- **Error Handling**: Clear error messages for syntax issues
- **Real-time Processing**: Instant 3D visualization upon upload
- **Batch Processing**: Handle multiple files at once

### Generated 3D Objects

Each Merfolk syntax element becomes a 3D object:

- `[Function: name]` → **Cube mesh** with configurable color and scale
- `{Component: name}` → **Dodecahedron mesh** for UI components
- `<Datapath: name>` → **Plane mesh** for data flows
- Connections → **Line geometries** between nodes
- Face connections → **Precise face-to-face connections**

### Complete Example

```typescript
import { MarkdownProcessor } from '3d-ast-generator';

async function processArchitectureFile(file: File) {
  const processor = new MarkdownProcessor({
    visual: {
      theme: 'dark',
      colors: {
        function: '#4CAF50', // Green cubes
        component: '#2196F3', // Blue dodecahedrons
        datapath: '#FF9800', // Orange planes
      },
    },
  });

  try {
    const content = await file.text();
    const diagrams = processor.processMarkdown(content);

    console.log(`Processed ${file.name}:`);
    diagrams.forEach((diagram, i) => {
      if (diagram.errors.length === 0) {
        const graph = diagram.graph;
        console.log(
          `  Diagram ${i + 1}: ${graph.nodes.size} nodes, ${
            graph.connections.size
          } connections`
        );

        // Convert to your 3D application format
        const diagramData = {
          title: diagram.block.title,
          nodes: Array.from(graph.nodes.values()).map((node) => ({
            id: node.id,
            type: node.type,
            geometry: node.geometry,
            position: node.transform.position,
            color: node.visual.color,
          })),
          connections: Array.from(graph.connections.values()).map((conn) => ({
            source: conn.source.nodeId,
            target: conn.target.nodeId,
            type: conn.type,
          })),
        };

        // Add to your 3D scene, save to database, etc.
        addToScene(diagramData);
      } else {
        console.error(`  Diagram ${i + 1} has errors:`, diagram.errors);
      }
    });
  } catch (error) {
    console.error('Processing failed:', error);
  }
}
```

This makes it incredibly easy to convert documentation into interactive 3D visualizations!
