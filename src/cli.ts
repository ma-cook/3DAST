#!/usr/bin/env node

import { MarkdownProcessor } from '../src/utils/markdown-processor';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';

// CLI tool for processing 3D AST markdown files
program
  .name('3d-ast')
  .description('Process 3D AST syntax in markdown files')
  .version('1.0.0');

program
  .command('process')
  .description('Process markdown file and generate 3D AST data')
  .argument('<file>', 'Markdown file to process')
  .option('-o, --output <file>', 'Output JSON file')
  .option('-f, --format <type>', 'Output format (json|html)', 'json')
  .option(
    '--layout <algorithm>',
    'Layout algorithm (hierarchical|force-directed|circular|grid)',
    'hierarchical'
  )
  .option('--spacing <number>', 'Node spacing', '3.0')
  .action((file: string, options: any) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(`❌ File not found: ${file}`);
        process.exit(1);
      }

      const markdownContent = fs.readFileSync(file, 'utf8');
      const processor = new MarkdownProcessor({
        layout: {
          algorithm: options.layout as any,
          nodeSpacing: parseFloat(options.spacing),
          layers: 5,
        },
      });

      console.log(`📄 Processing ${file}...`);

      if (options.format === 'html') {
        const html = processor.generateHTMLDocs(markdownContent);
        const outputFile =
          options.output || file.replace(/\.md$/, '_report.html');
        fs.writeFileSync(outputFile, html);
        console.log(`✅ Generated HTML report: ${outputFile}`);
      } else {
        const jsonData = processor.exportToJSON(markdownContent);
        const outputFile =
          options.output || file.replace(/\.md$/, '_diagrams.json');
        fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
        console.log(`✅ Generated JSON data: ${outputFile}`);

        // Show summary
        console.log(`\n📊 Summary:`);
        console.log(`- Diagrams: ${jsonData.metadata.totalDiagrams}`);
        console.log(`- Generated: ${jsonData.metadata.generatedAt}`);
      }
    } catch (error) {
      console.error(`❌ Error processing file:`, error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate 3D AST syntax in markdown file')
  .argument('<file>', 'Markdown file to validate')
  .action((file: string) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(`❌ File not found: ${file}`);
        process.exit(1);
      }

      const markdownContent = fs.readFileSync(file, 'utf8');
      const processor = new MarkdownProcessor();
      const report = processor.generateReport(markdownContent);

      console.log(`📄 Validating ${file}...`);
      console.log(`\n📊 Validation Report:`);
      console.log(`- Total blocks: ${report.totalBlocks}`);
      console.log(`- Valid blocks: ${report.validBlocks}`);
      console.log(`- Error blocks: ${report.errorBlocks}`);

      if (report.errorBlocks > 0) {
        console.log(`\n❌ Errors found:`);
        report.diagrams.forEach((diagram, index) => {
          if (diagram.errors.length > 0) {
            console.log(`\nDiagram ${index + 1}:`);
            diagram.errors.forEach((error) => {
              console.log(`  - ${error}`);
            });
          }
        });
        process.exit(1);
      } else {
        console.log(`\n✅ All syntax is valid!`);
        console.log(`📈 Summary:`);
        console.log(`- Total nodes: ${report.summary.totalNodes}`);
        console.log(`- Total connections: ${report.summary.totalConnections}`);

        if (Object.keys(report.summary.nodeTypes).length > 0) {
          console.log(`- Node types:`, report.summary.nodeTypes);
        }
      }
    } catch (error) {
      console.error(`❌ Error validating file:`, error);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch markdown file for changes and regenerate')
  .argument('<file>', 'Markdown file to watch')
  .option('-o, --output <file>', 'Output JSON file')
  .option('-f, --format <type>', 'Output format (json|html)', 'json')
  .action((file: string, options: any) => {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }

    console.log(`👀 Watching ${file} for changes...`);
    console.log(`Press Ctrl+C to stop.`);

    const processor = new MarkdownProcessor();

    const processFile = () => {
      try {
        const markdownContent = fs.readFileSync(file, 'utf8');

        if (options.format === 'html') {
          const html = processor.generateHTMLDocs(markdownContent);
          const outputFile =
            options.output || file.replace(/\.md$/, '_report.html');
          fs.writeFileSync(outputFile, html);
          console.log(`🔄 Updated HTML report: ${outputFile}`);
        } else {
          const jsonData = processor.exportToJSON(markdownContent);
          const outputFile =
            options.output || file.replace(/\.md$/, '_diagrams.json');
          fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
          console.log(`🔄 Updated JSON data: ${outputFile}`);
        }
      } catch (error) {
        console.error(`❌ Error processing file:`, error);
      }
    };

    // Initial processing
    processFile();

    // Watch for changes
    fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`📝 File changed, regenerating...`);
        processFile();
      }
    });
  });

program
  .command('example')
  .description('Generate example markdown file')
  .option('-o, --output <file>', 'Output file', 'example.md')
  .action((options: any) => {
    const exampleMarkdown = `# Example 3D AST Documentation

This is an example of how to document your application architecture using 3D AST syntax.

## Simple Web Application

\`\`\`3d-ast
graph3d "Simple Web App"

%% Frontend
UI[Component: UserInterface]
API{Component: APILayer}

%% Backend
SERVER[Function: WebServer]
DB((Module: Database))
CACHE<Datapath: RedisCache>

%% Connections
UI --> API : "HTTP requests"
API --> SERVER : "API calls"
SERVER --> DB : "data queries"
SERVER -.-> CACHE : "caching"
\`\`\`

## Process with:
- \`3d-ast process example.md\` - Generate JSON
- \`3d-ast validate example.md\` - Validate syntax
- \`3d-ast process example.md -f html\` - Generate HTML report
`;

    fs.writeFileSync(options.output, exampleMarkdown);
    console.log(`✅ Generated example file: ${options.output}`);
    console.log(`\nNext steps:`);
    console.log(`1. Edit the file to document your architecture`);
    console.log(`2. Run: 3d-ast validate ${options.output}`);
    console.log(`3. Run: 3d-ast process ${options.output}`);
  });

program.parse();
