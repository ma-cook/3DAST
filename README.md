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
import { AST3DGenerator } from '3d-ast-generator';

const generator = new AST3DGenerator();

const syntax = `
graph3d "My Application"

A[Function: processData]
B{Component: UserInterface}  
C((Module: Database))

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
```

## Syntax Guide

### Node Types & Geometries

| Syntax               | Type      | Geometry     | Use Case               |
| -------------------- | --------- | ------------ | ---------------------- |
| `A[Function: name]`  | Function  | Cube         | Functions, methods     |
| `B{Component: name}` | Component | Dodecahedron | UI components, modules |
| `D<Datapath: name>`  | Datapath  | Plane        | Data flows, streams    |

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

### AST3DGenerator

Main class for generating 3D AST graphs.

#### Methods

- `generate(input: string): Graph` - Parse and generate 3D graph
- `generateJSON(input: string): AST3DGraph` - Generate serializable format
- `validate(input: string): ValidationResult` - Validate syntax
- `parseOnly(input: string): ParsedGraph` - Parse without building

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
import { AST3DGenerator } from '3d-ast-generator';

const generator = new AST3DGenerator();
const graph = generator.generate(merfolkSyntax);

// Create Three.js scene
const scene = new THREE.Scene();

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
    // ... other geometries
  }

  const material = new THREE.MeshStandardMaterial({
    color: node.visual.color,
    opacity: node.visual.opacity,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    node.transform.position.x,
    node.transform.position.y,
    node.transform.position.z
  );

  scene.add(mesh);
}

// Add connections as lines
for (const [connId, connection] of graph.connections) {
  const points = connection
    .getPathPoints()
    .map((p) => new THREE.Vector3(p.x, p.y, p.z));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: connection.visual.color,
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);
}
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
npm install 3d-ast-generator three
```

### Basic Setup

```typescript
import * as THREE from 'three';
import { MerfolkDiagramBuilder } from '3d-ast-generator';

// Create your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

// Setup the diagram builder
const builder = new MerfolkDiagramBuilder(scene);

// Upload and process a markdown file
const uploadFile = async (file: File) => {
  const result = await builder.uploadMarkdownFile(file);

  if (result.success) {
    console.log(`Generated ${result.diagrams.length} 3D diagrams!`);
    console.log(`Total nodes: ${result.metadata.totalNodes}`);
    console.log(`Total connections: ${result.metadata.totalConnections}`);
  } else {
    console.error('Upload failed:', result.errors);
  }
};

// Or process markdown content directly
const processMarkdown = async (markdownContent: string) => {
  const result = await builder.processMarkdownContent(markdownContent);
  return result;
};
```

### File Upload UI

```typescript
import { createMarkdownUploader } from '3d-ast-generator/examples/markdown-uploader';

// Create an upload area in your HTML
const uploader = createMarkdownUploader(scene, 'upload-container', (result) => {
  if (result.success) {
    console.log('Diagrams generated:', result.diagrams);
  }
});
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

### Example Integration

```typescript
// Complete example with file upload
async function setupMerfolkApp() {
  const scene = new THREE.Scene();
  const builder = new MerfolkDiagramBuilder(scene);

  // Handle file input
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  fileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const result = await builder.uploadMarkdownFile(file);

      if (result.success) {
        // Focus camera on generated diagrams
        focusCameraOnDiagrams(result.diagrams);

        // Display metadata
        console.log(result.metadata);
      }
    }
  });

  return builder;
}
```

This makes it incredibly easy to convert documentation into interactive 3D visualizations!
