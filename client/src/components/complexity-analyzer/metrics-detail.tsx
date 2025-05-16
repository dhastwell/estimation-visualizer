import { InfoIcon, CheckIcon, AlertTriangleIcon, CalculatorIcon, TimerIcon, TrendingUpIcon, AwardIcon, BarChart2Icon, ChartBarIcon, Target } from "lucide-react";
import { fileData } from "@/lib/mock-data";

// Define ROI quadrant thresholds - should match the chart component
const QUADRANT_THRESHOLDS = {
  complexity: 50, // X-axis threshold
  refactorTime: 7  // Y-axis threshold (in days)
};

// Define optimal investment zone - should match the chart component
const OPTIMAL_ZONE = {
  complexityMin: 20,
  complexityMax: 50,
  timeMin: 1,
  timeMax: 7
};

// Calculate metrics based on actual data - now with more data points
const calculateMetrics = () => {
  const totalFiles = fileData.length;
  
  // Count files in each complexity category
  const veryLowCount = fileData.filter(file => file.complexity < 20).length;
  const lowCount = fileData.filter(file => file.complexity >= 20 && file.complexity < 40).length;
  const mediumCount = fileData.filter(file => file.complexity >= 40 && file.complexity < 60).length;
  const modHighCount = fileData.filter(file => file.complexity >= 60 && file.complexity < 80).length;
  const highCount = fileData.filter(file => file.complexity >= 80).length;
  
  // Calculate percentages
  const veryLowPct = Math.round((veryLowCount / totalFiles) * 100);
  const lowPct = Math.round((lowCount / totalFiles) * 100);
  const mediumPct = Math.round((mediumCount / totalFiles) * 100);
  const modHighPct = Math.round((modHighCount / totalFiles) * 100);
  const highPct = Math.round((highCount / totalFiles) * 100);
  
  // Calculate complexity metrics
  const totalComplexity = fileData.reduce((sum, file) => sum + file.complexity, 0);
  // Simple average
  const avgComplexity = parseFloat((totalComplexity / totalFiles).toFixed(2));
  // Calculate median complexity
  const sortedComplexities = [...fileData].sort((a, b) => a.complexity - b.complexity)
    .map(file => file.complexity);
  const medianComplexity = parseFloat(sortedComplexities.length % 2 === 0 
    ? ((sortedComplexities[sortedComplexities.length / 2 - 1] + sortedComplexities[sortedComplexities.length / 2]) / 2).toFixed(2)
    : sortedComplexities[Math.floor(sortedComplexities.length / 2)].toFixed(2));
  
  // Calculate refactor time metrics
  const totalRefactorDays = parseFloat(fileData.reduce((sum, file) => sum + file.refactorTimeDays, 0).toFixed(1));
  const totalRefactorMonths = parseFloat((totalRefactorDays / 30).toFixed(2));
  const avgRefactorDays = parseFloat((totalRefactorDays / totalFiles).toFixed(2));
  
  // Calculate metrics by ROI quadrants
  const q1Count = fileData.filter(file => file.complexity <= QUADRANT_THRESHOLDS.complexity && file.refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime).length;
  const q2Count = fileData.filter(file => file.complexity <= QUADRANT_THRESHOLDS.complexity && file.refactorTimeDays > QUADRANT_THRESHOLDS.refactorTime).length;
  const q3Count = fileData.filter(file => file.complexity > QUADRANT_THRESHOLDS.complexity && file.refactorTimeDays > QUADRANT_THRESHOLDS.refactorTime).length;
  const q4Count = fileData.filter(file => file.complexity > QUADRANT_THRESHOLDS.complexity && file.refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime).length;
  
  // Calculate optimal zone metrics
  const optimalZoneFiles = fileData.filter(file => 
    file.complexity >= OPTIMAL_ZONE.complexityMin && 
    file.complexity <= OPTIMAL_ZONE.complexityMax && 
    file.refactorTimeDays >= OPTIMAL_ZONE.timeMin && 
    file.refactorTimeDays <= OPTIMAL_ZONE.timeMax
  );
  const optimalZoneCount = optimalZoneFiles.length;
  const optimalZonePercentage = Math.round((optimalZoneCount / totalFiles) * 100);
  const optimalZoneTotalDays = parseFloat(optimalZoneFiles.reduce((sum, file) => sum + file.refactorTimeDays, 0).toFixed(1));
  const optimalZoneAvgDays = optimalZoneCount > 0 
    ? parseFloat((optimalZoneTotalDays / optimalZoneCount).toFixed(2)) 
    : 0;
  
  return {
    totalFiles,
    distribution: {
      veryLow: veryLowPct,
      low: lowPct,
      medium: mediumPct,
      modHigh: modHighPct,
      high: highPct
    },
    counts: {
      veryLow: veryLowCount,
      low: lowCount,
      medium: mediumCount,
      modHigh: modHighCount,
      high: highCount
    },
    complexity: {
      avg: avgComplexity,
      median: medianComplexity
    },
    refactorTime: {
      total: totalRefactorDays,
      avg: avgRefactorDays,
      months: totalRefactorMonths
    },
    roi: {
      lowHanging: q1Count,
      worthExploring: q2Count,
      highComplexity: q3Count,
      strategicOpportunity: q4Count
    },
    optimal: {
      count: optimalZoneCount,
      percentage: optimalZonePercentage,
      totalDays: optimalZoneTotalDays,
      avgDays: optimalZoneAvgDays
    }
  };
};

const MetricsDetail = () => {
  const metrics = calculateMetrics();
  const { distribution, counts, complexity, refactorTime, roi, optimal } = metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Complexity Distribution Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-[#016BF8]" />
          Complexity Distribution
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-full bg-[#E8EDEB] rounded-full h-4">
              <div className="bg-[#00AA57] rounded-full h-4" style={{ width: `${distribution.veryLow}%` }}></div>
            </div>
            <span className="ml-4 min-w-[130px] text-sm text-[#023430]">Very Low: {distribution.veryLow}% ({counts.veryLow})</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-[#E8EDEB] rounded-full h-4">
              <div className="bg-[#CAE46A] rounded-full h-4" style={{ width: `${distribution.low}%` }}></div>
            </div>
            <span className="ml-4 min-w-[130px] text-sm">Low: {distribution.low}% ({counts.low})</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-[#E8EDEB] rounded-full h-4">
              <div className="bg-[#FFC010] rounded-full h-4" style={{ width: `${distribution.medium}%` }}></div>
            </div>
            <span className="ml-4 min-w-[130px] text-sm text-[#944F01]">Medium: {distribution.medium}% ({counts.medium})</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-[#E8EDEB] rounded-full h-4">
              <div className="bg-[#D17600] rounded-full h-4" style={{ width: `${distribution.modHigh}%` }}></div>
            </div>
            <span className="ml-4 min-w-[130px] text-sm">Mod. High: {distribution.modHigh}% ({counts.modHigh})</span>
          </div>
          <div className="flex items-center">
            <div className="w-full bg-[#E8EDEB] rounded-full h-4">
              <div className="bg-[#970606] rounded-full h-4" style={{ width: `${distribution.high}%` }}></div>
            </div>
            <span className="ml-4 min-w-[130px] text-sm">High: {distribution.high}% ({counts.high})</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#E8EDEB]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-[#001E2B] text-2xl font-semibold">{complexity.median}</div>
              <div className="text-[#889397] text-xs mt-1">Median Complexity</div>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-[#001E2B] text-2xl font-semibold">{complexity.avg}</div>
              <div className="text-[#889397] text-xs mt-1">Mean Complexity</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="text-[#001E2B] text-xl font-semibold">{refactorTime.total}</div>
              <div className="text-[#889397] text-xs mt-1">Total Days</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="text-[#001E2B] text-xl font-semibold">{refactorTime.avg}</div>
              <div className="text-[#889397] text-xs mt-1">Avg. Days/File</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="text-[#001E2B] text-xl font-semibold">{optimal.avgDays}</div>
              <div className="text-[#889397] text-xs mt-1">Optimal Zone Avg.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Insights Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-[#00AA57]" />
          ROI &amp; Optimization Zones
        </h3>
        
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E0FFE0] bg-opacity-30 border border-[#00AA57] border-opacity-20 rounded p-3">
              <div className="text-[#023430] font-medium mb-1">Low-Hanging Fruit</div>
              <div className="text-3xl font-bold text-[#00AA57]">{roi.lowHanging}</div>
              <div className="text-xs text-[#889397] mt-1">Low complexity, quick wins</div>
            </div>
            <div className="bg-[#FFFBD0] bg-opacity-30 border border-[#FFC010] border-opacity-20 rounded p-3">
              <div className="text-[#944F01] font-medium mb-1">Worth Exploring</div>
              <div className="text-3xl font-bold text-[#FFC010]">{roi.worthExploring}</div>
              <div className="text-xs text-[#889397] mt-1">Moderate time investment</div>
            </div>
            <div className="bg-[#FFE5E5] bg-opacity-30 border border-[#970606] border-opacity-20 rounded p-3">
              <div className="text-[#970606] font-medium mb-1">High Complexity</div>
              <div className="text-3xl font-bold text-[#970606]">{roi.highComplexity}</div>
              <div className="text-xs text-[#889397] mt-1">Future consideration</div>
            </div>
            <div className="bg-[#F0E8FF] bg-opacity-30 border border-[#8A7BC8] border-opacity-20 rounded p-3">
              <div className="text-[#2D0B59] font-medium mb-1">Strategic Opportunity</div>
              <div className="text-3xl font-bold text-[#8A7BC8]">{roi.strategicOpportunity}</div>
              <div className="text-xs text-[#889397] mt-1">Targeted modernization</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border border-dashed border-[#00AA57] rounded-md mb-5 bg-[#fafffe]">
          <div className="flex items-start">
            <div className="rounded-full bg-[#E0FFE0] p-1 mr-3 mt-0.5">
              <Target className="h-5 w-5 text-[#00AA57]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#023430]">Optimal Investment Zone</p>
              <p className="text-xs text-[#889397] mt-1">
                {optimal.count} files ({optimal.percentage}%) fall within the ideal balance of
                complexity and effort for efficient modernization
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="text-[#970606] mr-3 mt-0.5">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-[#001E2B]">Files with complexity scores above 80 should be considered for architectural redesign</p>
          </div>
          <div className="flex items-start">
            <div className="text-[#D17600] mr-3 mt-0.5">
              <InfoIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-[#001E2B]">Authentication, security, and payment processing modules have highest complexity scores</p>
          </div>
          <div className="flex items-start">
            <div className="text-[#00AA57] mr-3 mt-0.5">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-[#001E2B]">Focus on files in the optimal investment zone to maximize modernization ROI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDetail;
