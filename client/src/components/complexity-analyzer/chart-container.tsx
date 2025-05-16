import { useState } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Label,
  Customized,
  Line
} from "recharts";
import { FileData } from "@/lib/mock-data";
import { AlertCircle, ArrowRight, BarChart2, CheckCircle2, LightbulbIcon } from "lucide-react";

interface ChartContainerProps {
  isChartGenerated: boolean;
  isLoading: boolean;
  data: FileData[];
}

// Define view types for analysis
type AnalysisViewType = "refactorTime" | "churn";

// Define ROI quadrant thresholds
const QUADRANT_THRESHOLDS = {
  complexity: 50, // X-axis threshold
  refactorTime: 7, // Y-axis threshold (in days)
  churn: 10       // Y-axis threshold for churn (frequency of file changes)
};

// Churn-Complexity Inversion Curve coordinates (points for the decision boundary)
const CHURN_COMPLEXITY_CURVE = [
  { complexity: 5, churn: 25 },
  { complexity: 10, churn: 20 },
  { complexity: 15, churn: 16 },
  { complexity: 25, churn: 12 },
  { complexity: 35, churn: 9 },
  { complexity: 50, churn: 7 },
  { complexity: 65, churn: 5 },
  { complexity: 80, churn: 4 },
  { complexity: 95, churn: 3 }
];

// Churn view quadrant names
const CHURN_QUADRANTS = {
  Q1: "Lower ROI", // Low complexity, high churn
  Q2: "Stable",    // Low complexity, low churn
  Q3: "Lower Priority", // High complexity, low churn
  Q4: "Refactor Required" // High complexity, high churn
};

// Define quadrant names - updated with neutral terminology
const QUADRANTS = {
  Q1: "Low-Hanging Fruit", // Low complexity, low refactor time
  Q2: "Worth Exploring",   // Low complexity, high refactor time
  Q3: "High Complexity",   // High complexity, high refactor time (renamed from "Too Complex")
  Q4: "Strategic Opportunity" // High complexity, low refactor time (renamed from "Edge Cases")
};

// Definition of optimal investment zone boundaries 
// These should match the values used in metrics calculation
const OPTIMAL_ZONE = {
  complexityMin: 20,
  complexityMax: 50,
  complexityCenter: 35,
  timeMin: 1,
  timeMax: 7,
  timeCenter: 4
};

const ChartContainer = ({ isChartGenerated, isLoading, data }: ChartContainerProps) => {
  const [showQuadrants, setShowQuadrants] = useState<boolean>(true);
  const [analysisView, setAnalysisView] = useState<AnalysisViewType>("refactorTime");
  
  // Function to determine point color based on complexity using the new color scale
  const getComplexityColor = (complexity: number) => {
    if (complexity < 20) return "#00AA57"; // very low - green
    if (complexity < 40) return "#CAE46A"; // low - lime
    if (complexity < 60) return "#FFC010"; // medium - yellow
    if (complexity < 80) return "#D17600"; // moderately high - orange (updated)
    return "#970606"; // high - red
  };

  // Function to determine which quadrant a file belongs to
  const getQuadrant = (file: FileData) => {
    const { complexity, refactorTimeDays } = file;
    if (complexity <= QUADRANT_THRESHOLDS.complexity) {
      return refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime ? QUADRANTS.Q1 : QUADRANTS.Q2;
    } else {
      return refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime ? QUADRANTS.Q4 : QUADRANTS.Q3;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const quadrant = getQuadrant(data);
      
      return (
        <div className="bg-white border border-[#E8EDEB] shadow-md p-3 rounded">
          <div className="font-medium mb-1">{data.fileName}</div>
          <div className="mb-2 text-xs bg-gray-100 px-2 py-1 rounded text-center">
            <span className="font-semibold">{quadrant}</span>
          </div>
          <div className="text-xs">
            <div className="flex justify-between">
              <span className="text-[#889397]">Complexity:</span>
              <span>{data.complexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#889397]">
                {analysisView === "refactorTime" ? "Refactor Time:" : "Churn:"}
              </span>
              <span>
                {analysisView === "refactorTime" 
                  ? `${data.refactorTimeDays} days` 
                  : `${data.churn} changes`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#889397]">Lines of Code:</span>
              <span>{data.linesOfCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#889397]">Last Modified:</span>
              <span>{data.lastModified}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Group data by complexity categories for scatter plot
  const veryLowComplexityData = data.filter(file => file.complexity < 20);
  const lowComplexityData = data.filter(file => file.complexity >= 20 && file.complexity < 40);
  const mediumComplexityData = data.filter(file => file.complexity >= 40 && file.complexity < 60);
  const modHighComplexityData = data.filter(file => file.complexity >= 60 && file.complexity < 80);
  const highComplexityData = data.filter(file => file.complexity >= 80);

  // Group data by ROI quadrants
  const q1Data = data.filter(file => 
    file.complexity <= QUADRANT_THRESHOLDS.complexity && 
    file.refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime
  );
  
  const q2Data = data.filter(file => 
    file.complexity <= QUADRANT_THRESHOLDS.complexity && 
    file.refactorTimeDays > QUADRANT_THRESHOLDS.refactorTime
  );
  
  const q3Data = data.filter(file => 
    file.complexity > QUADRANT_THRESHOLDS.complexity && 
    file.refactorTimeDays > QUADRANT_THRESHOLDS.refactorTime
  );
  
  const q4Data = data.filter(file => 
    file.complexity > QUADRANT_THRESHOLDS.complexity && 
    file.refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime
  );
  
  // Calculate chart domain max for Y axis based on data
  const maxRefactorTime = Math.max(...data.map(d => d.refactorTimeDays));
  const refactorTimeYAxisMax = Math.ceil(maxRefactorTime * 1.1); // Add 10% padding
  
  // Calculate max churn for Y axis in churn view
  const maxChurn = Math.max(...data.map(d => d.churn));
  const churnYAxisMax = Math.ceil(maxChurn * 1.1); // Add 10% padding
  
  // Get the current Y axis max based on selected view
  const yAxisMax = analysisView === "refactorTime" ? refactorTimeYAxisMax : churnYAxisMax;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-[#016BF8]" />
          Code Complexity Analysis
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-[#889397] cursor-pointer">
              <input 
                type="checkbox" 
                checked={showQuadrants} 
                onChange={() => setShowQuadrants(!showQuadrants)}
                className="mr-1"
              />
              Show ROI Quadrants
            </label>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      {isChartGenerated && !isLoading && (
        <div className="flex mb-6 border border-[#E8EDEB] rounded-md overflow-hidden w-max mx-auto">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              analysisView === "refactorTime"
                ? "bg-[#016BF8] text-white"
                : "bg-white text-[#6E7681] hover:bg-gray-50"
            }`}
            onClick={() => setAnalysisView("refactorTime")}
          >
            Refactor Time
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              analysisView === "churn"
                ? "bg-[#016BF8] text-white"
                : "bg-white text-[#6E7681] hover:bg-gray-50"
            }`}
            onClick={() => setAnalysisView("churn")}
          >
            Churn
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-160">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AA57]"></div>
            <p className="mt-4 text-[#889397]">Generating analysis...</p>
          </div>
        </div>
      )}

      {/* Empty State - No need to show this when chart isn't generated, since Control Panel is shown instead */}
      {!isLoading && !isChartGenerated && (
        <div className="flex flex-col justify-center items-center h-160">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#889397]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-4 text-[#889397] font-medium">No data to display yet</p>
          <p className="text-sm text-[#889397] mt-2">Click "Generate Scatter Plot Analysis" to visualize complexity metrics</p>
        </div>
      )}

      {/* Chart View - Only show when chart is generated */}
      {!isLoading && isChartGenerated && (
        <>
          <div className="chart-container relative h-160">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 50, left: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} strokeWidth={1} />
                
                {/* Quadrant background areas - only for Refactor Time view */}
                {showQuadrants && analysisView === "refactorTime" && (
                  <>
                    {/* Q1: Low-hanging fruit (green background) */}
                    <ReferenceArea 
                      x1={0} 
                      x2={QUADRANT_THRESHOLDS.complexity} 
                      y1={0} 
                      y2={QUADRANT_THRESHOLDS.refactorTime} 
                      fill="#E0FFE0" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q2: Worth exploring (yellow background) */}
                    <ReferenceArea 
                      x1={0} 
                      x2={QUADRANT_THRESHOLDS.complexity} 
                      y1={QUADRANT_THRESHOLDS.refactorTime} 
                      y2={yAxisMax} 
                      fill="#FFFBD0" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q3: High Complexity (red background) */}
                    <ReferenceArea 
                      x1={QUADRANT_THRESHOLDS.complexity} 
                      x2={100} 
                      y1={QUADRANT_THRESHOLDS.refactorTime} 
                      y2={yAxisMax} 
                      fill="#FFE5E5" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q4: Strategic Opportunity (purple background) */}
                    <ReferenceArea 
                      x1={QUADRANT_THRESHOLDS.complexity} 
                      x2={100} 
                      y1={0} 
                      y2={QUADRANT_THRESHOLDS.refactorTime} 
                      fill="#F0E8FF" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Add gradient definition for the optimal zone */}
                    <defs>
                      <radialGradient id="optimalGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#00AA57" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00AA57" stopOpacity={0.05} />
                      </radialGradient>
                    </defs>
                    
                    {/* Create the optimal investment zone as an ellipse */}
                    <ReferenceArea 
                      x1={OPTIMAL_ZONE.complexityMin} 
                      x2={OPTIMAL_ZONE.complexityMax} 
                      y1={OPTIMAL_ZONE.timeMin} 
                      y2={OPTIMAL_ZONE.timeMax} 
                      fill="url(#optimalGradient)"
                      stroke="#00AA57"
                      strokeDasharray="4 2"
                      strokeWidth={1}
                      fillOpacity={0.3}
                      ifOverflow="extendDomain"
                    />
                    
                    {/* Label for the optimal zone */}
                    <ReferenceLine 
                      x={OPTIMAL_ZONE.complexityCenter} 
                      y={OPTIMAL_ZONE.timeMin + 1.5}
                      stroke="transparent" 
                      label={{ 
                        value: "Optimal Investment Zone", 
                        position: "insideTop",
                        fill: "#023430",
                        fontSize: 11,
                        fontWeight: "bold"
                      }} 
                    />
                  </>
                )}

                {/* Churn View Quadrants and Curve */}
                {showQuadrants && analysisView === "churn" && (
                  <>
                    {/* Q1: Lower ROI (orange background) */}
                    <ReferenceArea 
                      x1={0} 
                      x2={QUADRANT_THRESHOLDS.complexity} 
                      y1={QUADRANT_THRESHOLDS.churn} 
                      y2={yAxisMax} 
                      fill="#FFE8D0" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q2: Stable (green background) */}
                    <ReferenceArea 
                      x1={0} 
                      x2={QUADRANT_THRESHOLDS.complexity} 
                      y1={0} 
                      y2={QUADRANT_THRESHOLDS.churn} 
                      fill="#E0FFE0" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q3: Lower Priority (blue background) */}
                    <ReferenceArea 
                      x1={QUADRANT_THRESHOLDS.complexity} 
                      x2={100} 
                      y1={0} 
                      y2={QUADRANT_THRESHOLDS.churn} 
                      fill="#E0F0FF" 
                      fillOpacity={0.3} 
                    />
                    
                    {/* Q4: Refactor Required (red background) */}
                    <ReferenceArea 
                      x1={QUADRANT_THRESHOLDS.complexity} 
                      x2={100} 
                      y1={QUADRANT_THRESHOLDS.churn} 
                      y2={yAxisMax} 
                      fill="#FFE5E5" 
                      fillOpacity={0.3} 
                    />

                    {/* Churn-Complexity Inversion Curve */}
                    <Line
                      type="natural"
                      dataKey="churn"
                      data={CHURN_COMPLEXITY_CURVE}
                      stroke="#016BF8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                      activeDot={false}
                      name="Decision Boundary"
                    />
                    
                    {/* Label for the curve */}
                    <ReferenceLine 
                      x={40} 
                      y={12}
                      stroke="transparent" 
                      label={{ 
                        value: "Churn-Complexity Inversion Curve", 
                        position: "insideTop",
                        fill: "#016BF8",
                        fontSize: 11,
                        fontWeight: "bold"
                      }} 
                    />

                    {/* Quadrant labels */}
                    <ReferenceArea 
                      x1={5} 
                      x2={5} 
                      y1={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.churn + 4)} 
                      y2={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.churn + 4)} 
                      label={{ 
                        value: CHURN_QUADRANTS.Q1, 
                        position: "insideTopLeft",
                        fill: "#944F01",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={5} 
                      x2={5} 
                      y1={2} 
                      y2={2} 
                      label={{ 
                        value: CHURN_QUADRANTS.Q2, 
                        position: "insideBottomLeft",
                        fill: "#023430",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={80} 
                      x2={80} 
                      y1={2} 
                      y2={2} 
                      label={{ 
                        value: CHURN_QUADRANTS.Q3, 
                        position: "insideBottomRight",
                        fill: "#01579B",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={80} 
                      x2={80} 
                      y1={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.churn + 4)} 
                      y2={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.churn + 4)} 
                      label={{ 
                        value: CHURN_QUADRANTS.Q4, 
                        position: "insideTopRight",
                        fill: "#970606",
                        fontSize: 12
                      }} 
                    />
                  </>
                )}
                
                <XAxis 
                  type="number" 
                  dataKey="complexity" 
                  name="Complexity" 
                  domain={[0, 100]} 
                  label={{ 
                    value: "Complexity Score (0-100)", 
                    position: "bottom",
                    style: { textAnchor: "middle", fill: "#001E2B" },
                    offset: 25
                  }}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  stroke="#333"
                  strokeWidth={1}
                />
                
                {/* Y-Axis - changes based on selected view */}
                <YAxis 
                  type="number" 
                  dataKey={analysisView === "refactorTime" ? "refactorTimeDays" : "churn"} 
                  name={analysisView === "refactorTime" ? "Refactor Time" : "Churn"} 
                  domain={[0, yAxisMax]}
                  label={{ 
                    value: analysisView === "refactorTime" ? "Refactor Time (days)" : "Churn (change frequency)", 
                    angle: -90, 
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#001E2B" },
                    offset: -55
                  }}
                  stroke="#333"
                  strokeWidth={1}
                />
                
                {/* Reference lines for quadrants with dashed lines - only for refactor time view */}
                {showQuadrants && analysisView === "refactorTime" && (
                  <>
                    <ReferenceLine 
                      x={QUADRANT_THRESHOLDS.complexity} 
                      stroke="#666" 
                      strokeDasharray="3 3" 
                      strokeWidth={1} 
                    />
                    <ReferenceLine 
                      y={QUADRANT_THRESHOLDS.refactorTime} 
                      stroke="#666" 
                      strokeDasharray="3 3" 
                      strokeWidth={1} 
                    />
                    
                    {/* Quadrant labels with updated colors and text */}
                    <ReferenceArea 
                      x1={5} 
                      x2={5} 
                      y1={2} 
                      y2={2} 
                      label={{ 
                        value: "Low-Hanging Fruit", 
                        position: "insideBottomLeft",
                        fill: "#023430",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={5} 
                      x2={5} 
                      y1={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.refactorTime + 4)} 
                      y2={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.refactorTime + 4)} 
                      label={{ 
                        value: "Worth Exploring", 
                        position: "insideTopLeft",
                        fill: "#944F01",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={80} 
                      x2={80} 
                      y1={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.refactorTime + 4)} 
                      y2={Math.min(yAxisMax - 2, QUADRANT_THRESHOLDS.refactorTime + 4)} 
                      label={{ 
                        value: "High Complexity", 
                        position: "insideTopRight",
                        fill: "#970606",
                        fontSize: 12
                      }} 
                    />
                    
                    <ReferenceArea 
                      x1={80} 
                      x2={80} 
                      y1={2} 
                      y2={2} 
                      label={{ 
                        value: "Strategic Opportunity", 
                        position: "insideBottomRight",
                        fill: "#2D0B59",
                        fontSize: 12
                      }} 
                    />
                  </>
                )}
                
                {/* Reference threshold for churn view */}
                {showQuadrants && analysisView === "churn" && (
                  <ReferenceLine 
                    y={QUADRANT_THRESHOLDS.churn} 
                    stroke="#666" 
                    strokeDasharray="3 3" 
                    strokeWidth={1}
                    label={{ 
                      value: "Churn Threshold", 
                      position: "insideRight",
                      fill: "#444",
                      fontSize: 10
                    }} 
                  />
                )}
                
                <ZAxis 
                  type="number" 
                  dataKey="linesOfCode" 
                  range={[60, 250]} 
                  name="Lines of Code" 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Show data by complexity category */}
                <Scatter 
                  name="Very Low Complexity (0-19)" 
                  data={veryLowComplexityData} 
                  fill="#00AA57"
                  shape="circle"
                />
                <Scatter 
                  name="Low Complexity (20-39)" 
                  data={lowComplexityData} 
                  fill="#CAE46A" 
                  shape="circle"
                />
                <Scatter 
                  name="Medium Complexity (40-59)" 
                  data={mediumComplexityData} 
                  fill="#FFC010" 
                  shape="circle"
                />
                <Scatter 
                  name="Moderately High Complexity (60-79)" 
                  data={modHighComplexityData} 
                  fill="#D17600" 
                  shape="circle"
                />
                <Scatter 
                  name="High Complexity (80-100)" 
                  data={highComplexityData} 
                  fill="#970606" 
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - always visible */}
          <div className="flex flex-wrap gap-4 mt-8 mb-6 justify-center">
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 rounded-full bg-[#00AA57] mr-2"></span>
              <span className="text-xs">Very Low (0-19)</span>
            </div>
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 rounded-full bg-[#CAE46A] mr-2"></span>
              <span className="text-xs">Low (20-39)</span>
            </div>
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 rounded-full bg-[#FFC010] mr-2"></span>
              <span className="text-xs">Medium (40-59)</span>
            </div>
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 rounded-full bg-[#D17600] mr-2"></span>
              <span className="text-xs">Moderately High (60-79)</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-[#970606] mr-2"></span>
              <span className="text-xs">High (80-100)</span>
            </div>
          </div>

          {/* Next Step Recommendations Section */}
          <div className="mt-8 pt-6 border-t border-[#E8EDEB]">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <LightbulbIcon className="h-5 w-5 mr-2 text-[#FFC010]" />
              Next Step Recommendations
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-[#00AA57] mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">Focus on files in the Optimal Investment Zone</span> for quick modernization wins. 
                  These {q1Data.length} files offer the best balance of complexity and required effort.
                </p>
              </div>
              
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-[#970606] mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">Reassess high-complexity, high-time files</span> for potential architectural redesign.
                  Consider breaking these {q3Data.length} files into smaller, more manageable components.
                </p>
              </div>
              
              <div className="flex items-start">
                <ArrowRight className="h-5 w-5 text-[#016BF8] mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">Use this analysis to prioritize a phased modernization roadmap</span> by addressing 
                  low-hanging fruit first, then strategic opportunities, followed by exploring medium-complexity files.
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm mb-3 text-[#889397]">Do you need help planning and prioritizing?</p>
                <button 
                  className="bg-[#016BF8] hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded transition-all duration-200 flex items-center gap-2 mx-auto"
                  onClick={(e) => e.preventDefault()}
                >
                  <span>Generate Refactor Plan</span>
                  <LightbulbIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartContainer;