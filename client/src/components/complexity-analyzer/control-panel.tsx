import { Button } from "@/components/ui/button";
import { PlusIcon, BarChart2Icon } from "lucide-react";

interface ControlPanelProps {
  onGenerateChart: () => void;
}

const ControlPanel = ({ onGenerateChart }: ControlPanelProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <BarChart2Icon className="h-8 w-8 mr-3 text-[#00AA57]" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Code Complexity Metrics Dashboard</h2>
            <p className="text-sm text-[#889397]">Generate a scatter plot to visualize code complexity vs. refactor time in days</p>
          </div>
        </div>
        <Button 
          onClick={onGenerateChart}
          className="bg-[#00AA57] hover:bg-opacity-90 text-white font-medium py-3 px-6 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00AA57] focus:ring-opacity-50 flex items-center gap-2"
        >
          <span>Generate Scatter Plot Analysis</span>
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
