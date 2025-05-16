export interface FileData {
  fileName: string;
  complexity: number;
  refactorTimeDays: number;
  linesOfCode: number;
  lastModified: string;
  churn: number;  // number of times a file has changed
}

// Helper function to add variation to data points
function addVariation(baseComplexity: number, baseRefactorTime: number): { complexity: number, refactorTimeDays: number } {
  // Random variation factors
  const complexityVar = (Math.random() * 0.2 - 0.1) * baseComplexity; // ±10%
  const timeVar = (Math.random() * 0.3 - 0.15) * baseRefactorTime; // ±15%
  
  // Anomaly factor (5% chance of significant variation)
  const anomalyFactor = Math.random() < 0.05 ? (Math.random() * 0.5 + 0.5) : 1;
  
  // Calculate new values with constraints
  let newComplexity = Math.max(1, Math.min(100, baseComplexity + complexityVar));
  let newRefactorTime = baseRefactorTime + timeVar;
  
  // Special cases: some files have unusual complexity/time ratios
  if (anomalyFactor !== 1) {
    // 2.5% chance of high complexity but low refactor time (well-structured complex code)
    if (Math.random() < 0.5 && baseComplexity > 50) {
      newComplexity = baseComplexity * 1.1;
      newRefactorTime = baseRefactorTime * 0.6;
    } 
    // 2.5% chance of low complexity but high refactor time (poorly designed simple code)
    else if (baseComplexity < 50) {
      newComplexity = baseComplexity * 0.9;
      newRefactorTime = baseRefactorTime * 1.8;
    }
  }
  
  return {
    complexity: Math.round(newComplexity * 10) / 10,
    refactorTimeDays: Math.round(newRefactorTime * 10) / 10
  };
}

// File name templates for generating variations
const fileNameTemplates = {
  auth: ['auth-service', 'authentication', 'auth-middleware', 'auth-provider', 'oauth-client', 'login-handler', 'session-manager'],
  api: ['api-client', 'api-controller', 'rest-handler', 'graphql-client', 'endpoint-manager', 'service-gateway'],
  data: ['data-processor', 'data-transformer', 'query-builder', 'data-validator', 'db-connector', 'data-aggregator', 'data-formatter'],
  ui: ['ui-components', 'theme-provider', 'layout-manager', 'responsive-grid', 'animation-controller', 'dashboard-widgets'],
  utils: ['utility-helpers', 'string-parser', 'date-formatter', 'logger', 'error-handler', 'config-manager', 'cache-service'],
  business: ['payment-processor', 'invoice-generator', 'tax-calculator', 'subscription-manager', 'pricing-engine'],
  security: ['security-middleware', 'encryption-service', 'permission-handler', 'token-validator', 'csrf-protection']
};

// File extensions
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue'];

// Generate variation of a file with different name but similar characteristics
function generateFileVariation(baseFile: FileData, index: number): FileData {
  const categoryKey = Object.keys(fileNameTemplates).find(key => 
    baseFile.fileName.toLowerCase().includes(key) || 
    (key === 'business' && (baseFile.fileName.includes('payment') || baseFile.fileName.includes('invoice')))
  ) || 'utils';
  
  const templates = fileNameTemplates[categoryKey as keyof typeof fileNameTemplates];
  const baseName = templates[index % templates.length];
  const extension = extensions[Math.floor(Math.random() * extensions.length)];
  
  const { complexity, refactorTimeDays } = addVariation(baseFile.complexity, baseFile.refactorTimeDays);
  
  // Generate random dates between Jan 2023 and Oct 2023
  const month = Math.floor(Math.random() * 10) + 1; // 1-10 for Jan-Oct
  const day = Math.floor(Math.random() * 28) + 1; // 1-28 for simplicity
  const lastModified = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Lines of code roughly correlates with complexity but has more variation
  const linesBase = baseFile.complexity * 6;
  const linesVariation = (Math.random() * 0.4 - 0.2) * linesBase; // ±20%
  const linesOfCode = Math.max(20, Math.round(linesBase + linesVariation));
  
  // Generate churn value that generally correlates with complexity
  // Files with higher complexity tend to change more often, with some exceptions
  let churn: number;
  if (complexity > 70) {
    // High complexity files tend to have higher churn
    churn = Math.round(5 + Math.random() * 15); // 5-20 changes
  } else if (complexity > 40) {
    // Medium complexity files have moderate churn
    churn = Math.round(3 + Math.random() * 12); // 3-15 changes
  } else {
    // Lower complexity files generally have less churn
    churn = Math.round(1 + Math.random() * 9); // 1-10 changes
  }
  
  // Add some outliers (10% chance)
  if (Math.random() < 0.1) {
    if (complexity < 30 && Math.random() < 0.5) {
      // Low complexity but high churn (frequently changed utility files)
      churn = Math.round(10 + Math.random() * 15); // 10-25 changes
    } else if (complexity > 70) {
      // High complexity but low churn (stable but complex core modules)
      churn = Math.round(1 + Math.random() * 4); // 1-5 changes
    }
  }
  
  return {
    fileName: `${baseName}${extension}`,
    complexity,
    refactorTimeDays,
    linesOfCode,
    lastModified,
    churn
  };
}

// Base data set (the original files we'll use as templates)
const baseFileData: FileData[] = [
  // High complexity (80-100)
  { fileName: "auth-service.js", complexity: 90, refactorTimeDays: 14, linesOfCode: 730, lastModified: "2023-08-12", churn: 18 },
  { fileName: "payment-processor.ts", complexity: 85, refactorTimeDays: 12, linesOfCode: 680, lastModified: "2023-07-18", churn: 15 },
  { fileName: "security-middleware.js", complexity: 80, refactorTimeDays: 10, linesOfCode: 520, lastModified: "2023-06-22", churn: 12 },
  
  // Moderately high complexity (60-79)
  { fileName: "data-aggregator.js", complexity: 75, refactorTimeDays: 9, linesOfCode: 460, lastModified: "2023-09-02", churn: 14 },
  { fileName: "legacy-adapter.ts", complexity: 70, refactorTimeDays: 8, linesOfCode: 410, lastModified: "2023-08-05", churn: 8 },
  { fileName: "analytics-engine.js", complexity: 65, refactorTimeDays: 7, linesOfCode: 390, lastModified: "2023-07-28", churn: 10 },
  { fileName: "realtime-processor.js", complexity: 60, refactorTimeDays: 6, linesOfCode: 350, lastModified: "2023-10-04", churn: 9 },
  
  // Medium complexity (40-59)
  { fileName: "dashboard.jsx", complexity: 55, refactorTimeDays: 5, linesOfCode: 310, lastModified: "2023-09-05", churn: 11 },
  { fileName: "api-client.js", complexity: 50, refactorTimeDays: 4.5, linesOfCode: 280, lastModified: "2023-08-29", churn: 8 },
  { fileName: "form-validation.js", complexity: 45, refactorTimeDays: 4, linesOfCode: 245, lastModified: "2023-09-18", churn: 7 },
  { fileName: "query-builder.ts", complexity: 40, refactorTimeDays: 3.5, linesOfCode: 220, lastModified: "2023-10-12", churn: 5 },
  
  // Low complexity (20-39)
  { fileName: "ui-components.js", complexity: 35, refactorTimeDays: 3, linesOfCode: 195, lastModified: "2023-10-01", churn: 16 }, // High churn for UI
  { fileName: "notification-system.js", complexity: 30, refactorTimeDays: 2.5, linesOfCode: 175, lastModified: "2023-09-25", churn: 6 },
  { fileName: "utility-helpers.ts", complexity: 25, refactorTimeDays: 2, linesOfCode: 150, lastModified: "2023-07-12", churn: 13 }, // High churn for utilities
  { fileName: "theme-provider.jsx", complexity: 20, refactorTimeDays: 1.5, linesOfCode: 120, lastModified: "2023-08-17", churn: 9 },
  
  // Very low complexity (0-19)
  { fileName: "data-formatter.js", complexity: 15, refactorTimeDays: 1, linesOfCode: 90, lastModified: "2023-09-20", churn: 7 },
  { fileName: "error-logger.js", complexity: 10, refactorTimeDays: 0.5, linesOfCode: 65, lastModified: "2023-08-08", churn: 3 },
  { fileName: "config-loader.js", complexity: 5, refactorTimeDays: 0.2, linesOfCode: 40, lastModified: "2023-10-05", churn: 5 }
];

// Generate the expanded dataset
export const fileData: FileData[] = [];

// Add all base files
baseFileData.forEach(file => fileData.push({...file}));

// Generate 5 variations for each base file
baseFileData.forEach((baseFile, baseIndex) => {
  for (let i = 0; i < 5; i++) {
    fileData.push(generateFileVariation(baseFile, i));
  }
});

// Add some special edge cases (outliers)
fileData.push(
  // High complexity but very low refactor time (well-documented complex code)
  { fileName: "well-documented-complex.ts", complexity: 88, refactorTimeDays: 3.2, linesOfCode: 650, lastModified: "2023-09-12", churn: 4 },
  // Low complexity but very high refactor time (poorly structured simple code)
  { fileName: "spaghetti-simple.js", complexity: 22, refactorTimeDays: 9.5, linesOfCode: 180, lastModified: "2023-07-05", churn: 21 },
  // Extreme complexity (legacy system)
  { fileName: "legacy-monolith.js", complexity: 98, refactorTimeDays: 22, linesOfCode: 2100, lastModified: "2023-03-10", churn: 3 },
  // Extremely simple utility
  { fileName: "tiny-utility.ts", complexity: 2, refactorTimeDays: 0.1, linesOfCode: 12, lastModified: "2023-10-15", churn: 25 }
);
