# 3D AST Generator

A TypeScript library for parsing Merfolk syntax and generating 3D abstract syntax trees for visualization. Perfect for creating 3D diagrams of application architectures, data flows, and system relationships.

## Features

- 🎯 **Merfolk Syntax**: Familiar, easy-to-write syntax for defining nodes and connections
- 🧊 **Multiple 3D Geometries**: Cubes, tetrahedrons, and dodecahedrons
- 🔗 **Face-specific Connections**: Connect to specific faces of 3D objects
- � **Flow Path Tracking**: Trace complete data paths across your entire application, not just between two nodes
- �📐 **Smart Layout Algorithms**: Hierarchical, force-directed, circular, and grid layouts
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
%% My Application Architecture
App{Component: Main Application}
DataService[Function: Process Data]
UserInterface{Component: User Interface}
Database[[Store: Database]]
ThreeJS<Library: Three.js>

%% Data flow connections
App --> UserInterface : "renders"
App --> DataService : "uses"
DataService --> Database : "queries"
UserInterface --> App : "user events"
App --> ThreeJS : "3D rendering"
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
%% System Overview
API[Function: API Server]
UI{Component: User Interface}
Database[[Store: Database]]

API --> UI : "data"
API --> Database : "queries"
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

| Syntax               | Type      | Geometry     | Use Case                  |
| -------------------- | --------- | ------------ | ------------------------- |
| `A{Component: name}` | Component | Dodecahedron | Components, modules       |
| `B[Function: name]`  | Function  | Cube         | Functions, methods        |
| `C[[Store: name]]`   | Store     | Cube         | Databases, data stores    |
| `D((Service: name))` | Service   | Tetrahedron  | External services, APIs   |
| `E<Library: name>`   | Library   | Cube         | External libraries        |
| `F[Hook: name]`      | Hook      | Cube         | React hooks, custom hooks |

**Node Type Detection**: The 3D AST generator automatically detects node types based on the bracket style and content label (e.g., "Component:", "Function:", "Store:", "Hook:", etc.).

### Connection Types

| Syntax       | Type         | Color           | Style              | Use Case                    |
| ------------ | ------------ | --------------- | ------------------ | --------------------------- |
| `A --> B`    | Data Flow    | `#4CAF50` green | Solid arrow        | Data passing                |
| `A -.-> B`   | Control Flow | `#F44336` red   | Dashed arrow       | Event/control flow          |
| `A --- B`    | Association  | `#607D8B` grey  | Solid line         | General relationships       |
| `A == B`     | Inheritance  | `#2196F3` blue  | Thick line         | Inheritance/dependencies    |
| `A *--> B`   | Composition  | `#FF9800` orange| ♦ filled diamond   | Whole/part containment      |
| `A ..> B`    | Dependency   | `#9C27B0` purple| Dotted arrow       | Usage/dependency            |

**Labeled Connections**: Use `-->|"label"|` syntax to add descriptive labels to connections, which will be displayed on the 3D connection lines.

```
%% Composition — Application contains AuthService
APP *--> AUTH : "contains"

%% Dependency — AuthService depends on UserDatabase
AUTH ..> USER_DB : "reads credentials"
```

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

### Flow Path Tracking

Flow paths let you define and trace **complete data paths** that span multiple nodes across your application — not just individual point-to-point connections.

#### The `flowpath` Directive

Define a named, multi-hop data path in a single line. This auto-creates tagged connections between each adjacent pair of nodes:

```
flowpath "userDataFlow" : A --> B --> C --> D
```

This creates 3 connections (A→B, B→C, C→D), all tagged with the `userDataFlow` identifier so the entire path can be queried and traced as a unit.

**Full syntax:**

```
%% Basic flow path
flowpath "name" : NodeA --> NodeB --> NodeC

%% With a custom arrow type (applies to all connections in the path)
flowpath "eventPipeline" (-.->): Input --> Transform --> Output

%% With a description
flowpath "requestLifecycle" : Client --> API --> DB --> API --> Client : "full request cycle"
```

#### The `#tag` Syntax on Connections

Tag individual connections with one or more flow path names using `#`:

```
A --> B : "payload" #userDataFlow
B --> C #userDataFlow #auditTrail
C --> D #auditTrail
```

This is useful when you want to manually compose flow paths from existing connections rather than auto-generating them.

#### Combining Both Approaches

You can freely mix `flowpath` directives with `#tag` connections. If a `flowpath` references a connection that already exists, it tags the existing connection instead of creating a duplicate:

```merfolk
%% Nodes
UI{Component: User Interface}
API[Function: API Handler]
Auth[Function: Auth Service]
DB[[Store: Database]]
Cache[Function: Cache Layer]

%% Explicit connections
UI --> API : "request" #userFlow
API --> Auth : "validate"

%% Flow path reuses existing UI-->API connection, creates the rest
flowpath "userFlow" : UI --> API --> Auth --> DB

%% A separate flow path through the cache layer
flowpath "cachedRead" : UI --> API --> Cache --> DB
```

#### Querying Flow Paths

```typescript
const graph = generator.generate(syntax);

// Trace a complete data path — returns ordered nodes and connections
const trace = graph.traceFlowPath('userDataFlow');
console.log(trace.nodes.map(n => n.name));  // ['UI', 'API Handler', 'Auth Service', 'DB']
console.log(trace.connections.length);       // 3

// Which flow paths pass through a specific node?
const apiFlows = graph.getNodeFlowPaths('API');
console.log(apiFlows.map(fp => fp.name));    // ['userFlow', 'cachedRead']

// Get all connections belonging to a flow path
const conns = graph.getFlowPathConnections('cachedRead');

// Find all flow paths that connect two nodes (even indirectly)
const paths = graph.getFlowPathsBetween('UI', 'DB');
console.log(paths.length);  // 2  (userFlow and cachedRead both reach from UI to DB)

// List all defined flow paths
const all = graph.getAllFlowPaths();
```

#### JSON Output

Flow paths are included in `generateJSON()` output:

```json
{
  "flowPaths": [
    {
      "id": "flowpath_0",
      "name": "userDataFlow",
      "nodeSequence": ["UI", "API", "Auth", "DB"],
      "connectionIds": ["conn_0", "conn_1", "conn_2"]
    }
  ]
}
```

Each connection also carries a `flowPaths` array listing which flow paths it belongs to, making it easy to highlight or filter connections by path in your 3D visualization.

### Nested Grouping (Automatic)

The 3D AST generator automatically creates nested grouping when functions are connected to components:

```merfolk
%% Define components and functions
UserService{Component: User Service}
AuthService{Component: Authentication Service}

validateUser[Function: User Validation]
authenticateToken[Function: Token Authentication]

%% Connect functions to components (creates nesting)
validateUser --> UserService : "validates"
authenticateToken --> AuthService : "authenticates"
```

**Result**: Functions automatically become nested inside their connected components:

- Components become **containers** with increased scale
- Functions are positioned **inside** their parent components
- Parent-child relationships are tracked in the data structure

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
  FlowPath,
  ParsedFlowPath,

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
- `flowPaths: Map<string, FlowPath>` - All registered flow paths
- `bounds: BoundingBox` - Overall graph bounding box

#### Methods

- `addNode(node: Node): void` - Add a node
- `addConnection(connection: Connection): void` - Add a connection
- `getBounds(): BoundingBox` - Calculate bounding box
- `getRootNodes(): Node[]` - Get nodes with no parents
- `getLeafNodes(): Node[]` - Get nodes with no children
- `addFlowPath(flowPath: FlowPath): void` - Register a flow path
- `removeFlowPath(flowPathId: string): void` - Remove a flow path
- `traceFlowPath(name: string): { nodes: Node[], connections: Connection[] } | null` - Trace a complete data path
- `getNodeFlowPaths(nodeId: string): FlowPath[]` - Get all flow paths through a node
- `getFlowPathConnections(name: string): Connection[]` - Get connections in a flow path
- `getFlowPathsBetween(nodeA: string, nodeB: string): FlowPath[]` - Find flow paths connecting two nodes
- `getFlowPathByName(name: string): FlowPath | undefined` - Look up a flow path by name
- `getAllFlowPaths(): FlowPath[]` - List all registered flow paths

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
- `flowPaths: string[]` - Flow path names this connection belongs to

#### Methods

- `addFlowPath(name: string): void` - Tag this connection with a flow path
- `removeFlowPath(name: string): void` - Remove a flow path tag
- `belongsToFlowPath(name: string): boolean` - Check if connection is part of a flow path

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
%% My System Architecture
WebServer[Function: Web Server]
Database{Component: Database Service}
APIGateway((Service: API Gateway))

APIGateway --> WebServer : "routes requests"
WebServer --> Database : "queries data"
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
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(1);
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
%% System Overview
WebServer[Function: Web Server]
Database{Component: Database Service}
APIGateway((Service: API Gateway))
Cache[Function: Cache System]

APIGateway --> WebServer : "routes requests"
WebServer --> Database : "queries data"
Database --> Cache : "caches results"
\`\`\`

## Data Flow

\`\`\`merfolk  
%% User Registration Flow
SignupForm{Component: Signup Form}
UserAPI[Function: User API]
UserDB[[Store: User Database]]
EmailService((Service: Email Service))

SignupForm --> UserAPI : "submits form"
UserAPI --> UserDB : "stores user"
UserAPI -.-> EmailService : "sends welcome email"
\`\`\`
```

### Complete Syntax Example

Here's a comprehensive example showing all geometry types and connection features:

```markdown
\`\`\`merfolk
%% Complete Application Architecture
%% Components (Dodecahedrons, can become containers for functions)
App{Component: Main Application}
UI{Component: User Interface}
API{Component: API Gateway}

%% Functions (Cubes, can be nested in components)
processData[Function: Data Processing]
validateUser[Function: User Validation]
renderUI[Function: UI Rendering]

%% Hooks (Cubes, for React hooks and custom hooks)
useAuth[Hook: useAuth]
useForm[Hook: useForm]
useTheme[Hook: useTheme]

%% Stores (Cubes)
UserDB[[Store: User Database]]
ConfigDB[[Store: Configuration Store]]

%% External Services (Tetrahedrons)
PaymentAPI((Service: Payment Gateway))
EmailService((Service: Email Provider))

%% Libraries (Cubes)
ReactLib<Library: React>
ExpressLib<Library: Express.js>

%% Labeled connections with nested grouping
processData --> API : "processes requests"
validateUser --> API : "validates tokens"
renderUI --> UI : "renders components"

%% Hook connections
useAuth --> UI : "provides auth state"
useForm --> UI : "manages form state"
useTheme --> UI : "provides theme"

%% Component connections
App --> UI : "renders"
App --> API : "calls"
API --> UserDB : "queries"
API --> PaymentAPI : "payment processing"
API -.-> EmailService : "notifications"

%% Library dependencies  
UI --> ReactLib : "uses"
API --> ExpressLib : "uses"

%% Face-specific connections
App@front --> UI@back : "direct rendering"
API@top --> UserDB@bottom : "data flow"
\`\`\`
```

**Result**: This creates:

- **Nested grouping**: Functions automatically nest inside their connected components
- **Multi-geometry**: 3 different 3D shapes (cubes, dodecahedrons, tetrahedrons)
- **Hooks support**: React hooks and custom hooks as cubes with pink color (#E91E63)
- **Labeled connections**: Descriptive labels on connection lines
- **Face connections**: Specific face-to-face connections for precise 3D positioning

### Features

- **Drag & Drop Upload**: Simply drag markdown files into your application
- **Multiple Diagrams**: Process multiple Merfolk diagrams from a single file
- **Automatic 3D Positioning**: Diagrams are automatically positioned in 3D space
- **Error Handling**: Clear error messages for syntax issues
- **Real-time Processing**: Instant 3D visualization upon upload
- **Batch Processing**: Handle multiple files at once

### Generated 3D Objects

Each Merfolk syntax element becomes a 3D object:

- `{Component: name}` → **Dodecahedron mesh** (becomes container when containing functions)
- `[Function: name]` → **Cube mesh** (can be nested inside components)
- `[Hook: name]` → **Cube mesh** (pink #E91E63) for React hooks and custom hooks
- `[[Store: name]]` → **Cube mesh** for databases and data stores
- `((Service: name))` → **Tetrahedron mesh** for external services
- `<Library: name>` → **Cube mesh** for external libraries
- Connections → **Line geometries** between nodes with optional labels
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
