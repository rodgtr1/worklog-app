import { useState } from "react";
import { generateSummaryReport } from "../lib/fileUtils";

interface ReportGeneratorProps {
  // No props needed - uses .env file
}

const REPORT_STYLES = [
  { value: "executive", label: "Executive Summary", description: "High-level achievements for leadership review" },
  { value: "detailed", label: "Detailed Report", description: "Comprehensive view with technical details" },
  { value: "chronological", label: "Chronological", description: "Month-by-month progression timeline" },
  { value: "accomplishments", label: "Major Accomplishments", description: "Focus on significant wins and milestones" }
];

function ReportGenerator({}: ReportGeneratorProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportStyle, setReportStyle] = useState<string>("executive");
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Set default date range (last 6 months)
  const setDefaultDateRange = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setGeneratedReport("");
      
      const report = await generateSummaryReport(
        startDate,
        endDate,
        reportStyle
      );
      
      setGeneratedReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worklog-report-${startDate}-to-${endDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
        <button
          onClick={setDefaultDateRange}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Set Last 6 Months
        </button>
      </div>
      
      <form onSubmit={handleGenerateReport} className="space-y-4 mb-6">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Report Style */}
        <div>
          <label htmlFor="report-style" className="block text-sm font-medium text-gray-700 mb-2">
            Report Style
          </label>
          <div className="space-y-2">
            {REPORT_STYLES.map((style) => (
              <label key={style.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="report-style"
                  value={style.value}
                  checked={reportStyle === style.value}
                  onChange={(e) => setReportStyle(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating Report..." : "Generate Report"}
        </button>
      </form>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium text-gray-900">Generated Report</h3>
            <div className="space-x-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Copy
              </button>
              <button
                onClick={downloadReport}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Download MD
              </button>
            </div>
          </div>
          <div className="flex-1 border border-gray-300 rounded-md p-4 bg-gray-50 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedReport}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;