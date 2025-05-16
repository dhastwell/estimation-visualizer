import { useState } from "react";
import ChartContainer from "@/components/complexity-analyzer/chart-container";
import ControlPanel from "@/components/complexity-analyzer/control-panel";
import FileTable from "@/components/complexity-analyzer/file-table";
import MetricsDetail from "@/components/complexity-analyzer/metrics-detail";
import { fileData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const Home = () => {
  const [isChartGenerated, setIsChartGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerateChart = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setIsChartGenerated(true);
    }, 1200);
  };
  
  const handleResetAnalysis = () => {
    setIsChartGenerated(false);
    setIsLoading(false);
  };

  return (
    <div className="bg-background text-textColor min-h-screen font-['Roboto_Mono']">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Code Complexity Analyzer</h1>
          <p className="text-[#889397] text-lg">Visualize code complexity metrics and estimated refactor time</p>
        </header>

        {/* Only show the Control Panel if chart is not yet generated */}
        {!isChartGenerated && (
          <ControlPanel onGenerateChart={handleGenerateChart} />
        )}
        
        {/* Show Reset button if chart is generated */}
        {isChartGenerated && !isLoading && (
          <div className="flex justify-end mb-6">
            <Button 
              onClick={handleResetAnalysis}
              variant="outline"
              className="border-[#889397] text-[#889397] hover:bg-gray-100 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Analysis</span>
            </Button>
          </div>
        )}

        {/* Chart Container - always visible, handles its own states */}
        <ChartContainer 
          isChartGenerated={isChartGenerated}
          isLoading={isLoading}
          data={fileData}
        />

        {/* Only show these components when chart is generated */}
        {isChartGenerated && !isLoading && (
          <>
            {/* Metrics Detail */}
            <MetricsDetail />

            {/* File Table */}
            <FileTable data={fileData} />
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[#889397]">
          <p>Code Complexity Analyzer | Visualizing metrics for better refactoring decisions</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
