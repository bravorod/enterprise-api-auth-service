// scripts/generate-swagger.js
// Converts the OpenAPI YAML spec into JSON for CI/CD and tooling consumption

const fs = require('fs');
const YAML = require('yamljs');

// Load the OpenAPI spec (YAML)
const swaggerDocument = YAML.load('docs/openapi.yaml');

// Write out JSON version for tooling and CI
fs.writeFileSync(
  'docs/openapi.json',
  JSON.stringify(swaggerDocument, null, 2)
);

console.log('Swagger JSON generated at docs/openapi.json');
