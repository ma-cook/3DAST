// Note: Three.js would be imported in a real application
// import * as THREE from 'three';
import {
  MerfolkDiagramBuilder,
  createMarkdownUploader,
} from './markdown-uploader';

/**
 * Complete example of integrating Merfolk markdown upload in a 3D application
 */

// Example 1: Basic setup with Three.js scene
export function setupBasic3DApp() {
  // Create Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add basic lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  // Position camera
  camera.position.set(0, 10, 30);
  camera.lookAt(0, 0, 0);

  // Create the markdown uploader
  const uploader = createMarkdownUploader(
    scene,
    'upload-container',
    (result) => {
      console.log('Upload result:', result);

      if (result.success) {
        // Automatically position camera to view all diagrams
        focusCameraOnDiagrams(camera, result.diagrams);

        // Log success
        console.log(
          `🎉 Successfully generated ${result.diagrams.length} 3D diagrams!`
        );
        console.log(`📊 Total nodes: ${result.metadata.totalNodes}`);
        console.log(
          `🔗 Total connections: ${result.metadata.totalConnections}`
        );
      } else {
        console.error('Upload failed:', result.errors);
        alert('Failed to process markdown file: ' + result.errors.join(', '));
      }
    }
  );

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer, uploader };
}

// Example 2: Advanced setup with custom configuration
export function setupAdvanced3DApp() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Custom configuration for diagrams
  const customConfig = {
    layout: {
      algorithm: 'force-directed' as const,
      nodeSpacing: 6.0,
      layers: 4,
    },
    visual: {
      theme: 'light' as const,
      colors: {
        function: '#28a745', // Custom green for functions
        component: '#007bff', // Custom blue for components
        datapath: '#fd7e14', // Custom orange for datapaths
        interface: '#20c997', // Custom teal for interfaces
        variable: '#ffc107', // Custom yellow for variables
        constant: '#6f42c1', // Custom purple for constants
      },
      material: {
        metalness: 0.1,
        roughness: 0.8,
        opacity: 0.95,
      },
    },
  };

  const builder = new MerfolkDiagramBuilder(scene, customConfig);

  // Multiple upload methods
  return {
    scene,
    camera,
    renderer,
    builder,

    // Method 1: Upload file
    uploadFile: async (file: File) => {
      return await builder.uploadMarkdownFile(file);
    },

    // Method 2: Process markdown string directly
    processMarkdown: async (markdownContent: string) => {
      return await builder.processMarkdownContent(markdownContent);
    },

    // Method 3: Load from URL
    loadFromUrl: async (url: string) => {
      try {
        const response = await fetch(url);
        const markdownContent = await response.text();
        return await builder.processMarkdownContent(
          markdownContent,
          `url:${url}`
        );
      } catch (error) {
        throw new Error(`Failed to load from URL: ${error}`);
      }
    },
  };
}

// Example 3: Batch processing multiple files
export async function processMerfolkFiles(scene: THREE.Scene, files: FileList) {
  const builder = new MerfolkDiagramBuilder(scene);
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.name.endsWith('.md')) {
      console.log(`Processing ${file.name}...`);
      const result = await builder.uploadMarkdownFile(file);
      results.push({ file: file.name, result });
    }
  }

  return results;
}

// Helper function to focus camera on all diagrams
function focusCameraOnDiagrams(camera: THREE.Camera, diagrams: any[]) {
  if (diagrams.length === 0) return;

  // Calculate bounding box of all diagrams
  const box = new THREE.Box3();

  diagrams.forEach((diagram) => {
    const diagramBox = new THREE.Box3(
      new THREE.Vector3(
        diagram.bounds.min.x + diagram.position.x,
        diagram.bounds.min.y + diagram.position.y,
        diagram.bounds.min.z + diagram.position.z
      ),
      new THREE.Vector3(
        diagram.bounds.max.x + diagram.position.x,
        diagram.bounds.max.y + diagram.position.y,
        diagram.bounds.max.z + diagram.position.z
      )
    );
    box.union(diagramBox);
  });

  // Position camera to view all diagrams
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2;

  camera.position.set(
    center.x + distance,
    center.y + distance * 0.5,
    center.z + distance
  );

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.lookAt(center);
  }
}

// Example 4: HTML setup for upload area
export function createUploadHTML() {
  return `
    <div id="app">
      <h1>Merfolk 3D Diagram Viewer</h1>
      <div id="upload-container"></div>
      <div id="controls">
        <button id="clear-btn">Clear All Diagrams</button>
        <button id="example-btn">Load Example</button>
      </div>
      <div id="info">
        <p>Upload a markdown file containing Merfolk syntax to generate 3D diagrams</p>
        <p>Supported formats: .md, .markdown</p>
      </div>
    </div>
  `;
}

// Example 5: Complete integration with UI controls
export function setupCompleteApp() {
  // Setup HTML
  document.body.innerHTML = createUploadHTML();

  // Setup 3D scene
  const { scene, camera, renderer, uploader } = setupBasic3DApp();

  // Add controls
  const clearBtn = document.getElementById('clear-btn');
  const exampleBtn = document.getElementById('example-btn');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      uploader.builder.clearAllDiagrams();
      console.log('Cleared all diagrams');
    });
  }

  if (exampleBtn) {
    exampleBtn.addEventListener('click', async () => {
      // Load example Merfolk content
      const exampleMarkdown = `
# Example Architecture

\`\`\`merfolk
graph3d "Simple App Architecture"

A[Function: MainApp]
B{Component: UserInterface}
C<Datapath: APIGateway>
D[Function: DatabaseService]

A --> B : "renders"
B --> C : "API calls"
C --> D : "queries"
D --> A : "data"
\`\`\`
      `;

      const result = await uploader.builder.processMarkdownContent(
        exampleMarkdown,
        'example'
      );
      console.log('Example loaded:', result);
    });
  }

  return { scene, camera, renderer, uploader };
}

// Example markdown content for testing
export const exampleMerfolkMarkdown = `
# E-commerce Architecture

This document shows a simple e-commerce system architecture.

\`\`\`merfolk
graph3d "E-commerce System"
description: "Main system components and data flow"

%% Frontend
WEB[Component: WebApp] {color: "#2196F3"}
MOBILE{Component: MobileApp} {color: "#4CAF50"}

%% Backend Services  
API<Datapath: APIGateway> {color: "#FF9800", scale: "3,0.5,1"}
AUTH[Function: AuthService] {color: "#F44336"}
USER[Function: UserService] {color: "#9C27B0"}
PRODUCT[Function: ProductService] {color: "#607D8B"}
ORDER[Function: OrderService] {color: "#795548"}

%% Data Layer
DB[Function: Database] {color: "#3F51B5"}
CACHE<Datapath: RedisCache> {color: "#FFC107"}

%% Connections
WEB --> API@front : "HTTPS"
MOBILE --> API@left : "API calls"
API@back --> AUTH@front : "authentication"
API@bottom --> USER@top : "user ops"
API@bottom --> PRODUCT@top : "catalog"
API@bottom --> ORDER@top : "orders"

%% Data flow
USER --> DB@left : "user data"
PRODUCT --> DB@front : "catalog data"  
ORDER --> DB@right : "order data"

%% Caching
USER -.-> CACHE@left : "cache"
PRODUCT -.-> CACHE@right : "cache"

%% Dependencies
ORDER == USER : "requires user"
ORDER == PRODUCT : "requires catalog"
\`\`\`

## Payment Flow

\`\`\`merfolk  
graph3d "Payment Processing"

CART[Component: ShoppingCart]
CHECKOUT{Component: CheckoutForm}
PAYMENT[Function: PaymentService]
STRIPE[Function: StripeAPI]
DB[Function: OrderDB]

CART --> CHECKOUT : "proceed"
CHECKOUT --> PAYMENT : "process payment"
PAYMENT --> STRIPE : "charge card"
STRIPE --> PAYMENT : "result"
PAYMENT --> DB : "save order"
\`\`\`
`;
