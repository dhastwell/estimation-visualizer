import { FileData } from "@/lib/mock-data";
import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, Search } from "lucide-react";

// Define ROI quadrant thresholds - should match the chart component
const QUADRANT_THRESHOLDS = {
  complexity: 50, // X-axis threshold
  refactorTime: 7  // Y-axis threshold (in days)
};

interface FileTableProps {
  data: FileData[];
}

const FileTable = ({ data }: FileTableProps) => {
  const [sortField, setSortField] = useState<keyof FileData>("complexity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [complexityFilter, setComplexityFilter] = useState<string>("all");
  const [roiFilter, setRoiFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 10;

  // Function to determine badge color based on complexity using the new color scale
  const getBadgeColor = (complexity: number) => {
    if (complexity < 20) return "bg-[#00AA57]"; // very low - green
    if (complexity < 40) return "bg-[#CAE46A]"; // low - lime
    if (complexity < 60) return "bg-[#FFC010]"; // medium - yellow
    if (complexity < 80) return "bg-[#D17600]"; // moderately high - orange (updated)
    return "bg-[#970606]"; // high - red
  };

  // Function to get the complexity label
  const getComplexityLabel = (complexity: number) => {
    if (complexity < 20) return "Very Low";
    if (complexity < 40) return "Low";
    if (complexity < 60) return "Medium";
    if (complexity < 80) return "Moderately High";
    return "High";
  };

  // Function to get the ROI quadrant
  const getROIQuadrant = (file: FileData) => {
    const { complexity, refactorTimeDays } = file;
    if (complexity <= QUADRANT_THRESHOLDS.complexity) {
      return refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime 
        ? "Low-Hanging Fruit" 
        : "Worth Exploring";
    } else {
      return refactorTimeDays <= QUADRANT_THRESHOLDS.refactorTime 
        ? "Strategic Opportunity" 
        : "High Complexity";
    }
  };

  // Function to get ROI quadrant badge color
  const getROIQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "Low-Hanging Fruit": return "bg-[#E0FFE0] text-[#023430] border border-[#00AA57]";
      case "Worth Exploring": return "bg-[#FFFBD0] text-[#944F01] border border-[#FFC010]";
      case "High Complexity": return "bg-[#FFE5E5] text-[#970606] border border-[#970606]";
      case "Strategic Opportunity": return "bg-[#F0E8FF] text-[#2D0B59] border border-[#8A7BC8]";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Handle sorting logic
  const handleSort = (field: keyof FileData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter data based on search term and filters
  const filteredData = data.filter(file => {
    // Search filter
    const fileNameMatch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Complexity filter
    let complexityMatch = true;
    if (complexityFilter !== "all") {
      switch (complexityFilter) {
        case "very-low": complexityMatch = file.complexity < 20; break;
        case "low": complexityMatch = file.complexity >= 20 && file.complexity < 40; break;
        case "medium": complexityMatch = file.complexity >= 40 && file.complexity < 60; break;
        case "mod-high": complexityMatch = file.complexity >= 60 && file.complexity < 80; break;
        case "high": complexityMatch = file.complexity >= 80; break;
      }
    }
    
    // ROI quadrant filter
    let roiMatch = true;
    if (roiFilter !== "all") {
      const quadrant = getROIQuadrant(file);
      switch (roiFilter) {
        case "low-hanging": roiMatch = quadrant === "Low-Hanging Fruit"; break;
        case "worth-exploring": roiMatch = quadrant === "Worth Exploring"; break;
        case "high-complexity": roiMatch = quadrant === "High Complexity"; break;
        case "strategic-opportunity": roiMatch = quadrant === "Strategic Opportunity"; break;
      }
    }
    
    return fileNameMatch && complexityMatch && roiMatch;
  });

  // Sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "fileName") {
      return sortDirection === "asc" 
        ? a.fileName.localeCompare(b.fileName)
        : b.fileName.localeCompare(a.fileName);
    } else {
      return sortDirection === "asc" 
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-lg font-semibold mb-4 md:mb-0">File Complexity Details</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#889397]" />
            </div>
            <input 
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-[#E8EDEB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AA57] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="p-2 border border-[#E8EDEB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AA57] focus:border-transparent bg-white"
              value={complexityFilter}
              onChange={(e) => {
                setComplexityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Complexity</option>
              <option value="very-low">Very Low</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="mod-high">Moderately High</option>
              <option value="high">High</option>
            </select>
            
            <select 
              className="p-2 border border-[#E8EDEB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00AA57] focus:border-transparent bg-white"
              value={roiFilter}
              onChange={(e) => {
                setRoiFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All ROI Quadrants</option>
              <option value="low-hanging">Low-Hanging Fruit</option>
              <option value="worth-exploring">Worth Exploring</option>
              <option value="high-complexity">High Complexity</option>
              <option value="strategic-opportunity">Strategic Opportunity</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E8EDEB] border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("fileName")}
              >
                <div className="flex items-center">
                  File Name
                  {sortField === 'fileName' && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("complexity")}
              >
                <div className="flex items-center">
                  Complexity
                  {sortField === 'complexity' && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider">
                Category
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("refactorTimeDays")}
              >
                <div className="flex items-center">
                  Refactor Time
                  {sortField === 'refactorTimeDays' && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("linesOfCode")}
              >
                <div className="flex items-center">
                  Lines
                  {sortField === 'linesOfCode' && (
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#889397] uppercase tracking-wider">ROI Quadrant</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E8EDEB]">
            {paginatedData.length > 0 ? (
              paginatedData.map((file, index) => {
                const quadrant = getROIQuadrant(file);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{file.fileName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(file.complexity)} text-white`}>
                        {file.complexity}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{getComplexityLabel(file.complexity)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{file.refactorTimeDays} days</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{file.linesOfCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getROIQuadrantColor(quadrant)}`}>
                        {quadrant}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No files match your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-[#889397]">
            Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * rowsPerPage, sortedData.length)}</span> of{" "}
            <span className="font-medium">{sortedData.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md text-sm ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#E8EDEB] text-[#001E2B] hover:bg-[#D9E1DE]'}`}
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#E8EDEB] text-[#001E2B] hover:bg-[#D9E1DE]'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTable;
