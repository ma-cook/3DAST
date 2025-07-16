/**
 * Example integration with 3D applications
 * This demonstrates how to process Merfolk markdown files for use in 3D applications
 *
 * Note: This is a documentation example. In a real Three.js application,
 * you would add the Three.js imports and 3D rendering implementations.
 */

import { MarkdownProcessor } from '../src';

/**
 * Example: Basic 3D scene setup for markdown upload
 */
export function setupBasic3DScene() {
  console.log('Setting up basic 3D scene...');

  // In a real Three.js application, you would create:
  // const scene = new THREE.Scene();
  // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // const renderer = new THREE.WebGLRenderer();
  // document.body.appendChild(renderer.domElement);

  // Return mock scene for documentation
  return {
    scene: 'Mock 3D Scene',
    camera: 'Mock Camera',
    renderer: 'Mock Renderer',
  };
}

/**
 * Example: Advanced 3D scene with better lighting and controls
 */
export function setupAdvanced3DScene() {
  console.log('Setting up advanced 3D scene...');

  // In a real Three.js application, you would add:
  // - Ambient and directional lighting
  // - OrbitControls for navigation
  // - Post-processing effects
  // - Performance monitoring

  return {
    scene: 'Advanced Mock Scene',
    lighting: 'Mock Lighting Setup',
    controls: 'Mock Camera Controls',
  };
}

/**
 * Example: File upload handler for markdown files
 */
export async function handleFileUpload(files: FileList): Promise<any[]> {
  const processor = new MarkdownProcessor();
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
      try {
        const content = await file.text();
        const diagrams = processor.processMarkdown(content);

        results.push({
          filename: file.name,
          diagrams: diagrams.filter((d) => d.errors.length === 0),
          errors: diagrams.filter((d) => d.errors.length > 0),
        });

        console.log(
          `✅ Processed ${file.name}: ${diagrams.length} diagrams found`
        );
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        results.push({
          filename: file.name,
          diagrams: [],
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }
  }

  return results;
}

/**
 * Example: Process multiple Merfolk files and organize them
 */
export async function processMerfolkFiles(files: FileList) {
  const uploadResults = await handleFileUpload(files);

  // Organize diagrams by file
  const organizedData = uploadResults.map((result) => ({
    filename: result.filename,
    diagrams: result.diagrams.map((diagram: any, index: number) => ({
      id: `${result.filename}_${index}`,
      title: diagram.block.title || `Diagram ${index + 1}`,
      nodeCount: diagram.graph.nodes.size,
      connectionCount: diagram.graph.connections.size,
      bounds: diagram.graph.getBounds(),
    })),
    errorCount: result.errors.length,
  }));

  console.log('📊 Organized diagram data:', organizedData);

  // In a real application, you would:
  // 1. Add each diagram to your 3D scene
  // 2. Position them appropriately
  // 3. Set up camera focus
  // 4. Add UI controls for navigation

  return organizedData;
}

/**
 * Example HTML for file upload interface
 */
export const UPLOAD_HTML = `
<div class="merfolk-uploader">
  <h2>Upload Merfolk Markdown Files</h2>
  <div class="upload-area" id="uploadArea">
    <p>Drag and drop .md files here or click to select</p>
    <input type="file" id="fileInput" multiple accept=".md,.markdown" style="display: none;">
  </div>
  <div id="uploadResults"></div>
</div>

<style>
.merfolk-uploader {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  text-align: center;
}

.upload-area {
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-area:hover {
  background: #e9e9e9;
}

.upload-area.dragover {
  background: #e3f2fd;
  border-color: #2196f3;
}

#uploadResults {
  margin-top: 20px;
  text-align: left;
}
</style>
`;

/**
 * Example JavaScript for handling file uploads
 */
export const UPLOAD_SCRIPT = `
// Setup file upload handlers
function setupUploaders() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const results = document.getElementById('uploadResults');

  // Click to select files
  uploadArea.addEventListener('click', () => fileInput.click());

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    await handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', async (e) => {
    await handleFiles(e.target.files);
  });

  async function handleFiles(files) {
    results.innerHTML = '<p>Processing files...</p>';
    
    try {
      // Import your processor
      const { processMerfolkFiles } = await import('./upload-integration-examples');
      const processedData = await processMerfolkFiles(files);
      
      // Display results
      results.innerHTML = processedData.map(file => \`
        <div class="file-result">
          <h3>\${file.filename}</h3>
          <p>\${file.diagrams.length} diagrams processed</p>
          \${file.errorCount > 0 ? \`<p style="color: red">\${file.errorCount} errors</p>\` : ''}
          <ul>
            \${file.diagrams.map(d => \`<li>\${d.title} (\${d.nodeCount} nodes, \${d.connectionCount} connections)</li>\`).join('')}
          </ul>
        </div>
      \`).join('');
      
    } catch (error) {
      results.innerHTML = \`<p style="color: red">Error: \${error.message}</p>\`;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupUploaders);
} else {
  setupUploaders();
}
`;

export default {
  setupBasic3DScene,
  setupAdvanced3DScene,
  handleFileUpload,
  processMerfolkFiles,
  UPLOAD_HTML,
  UPLOAD_SCRIPT,
};
