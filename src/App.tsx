import { useState, useEffect } from "react";
import PromptInput from "./components/PromptInput";
import WorklogViewer from "./components/WorklogViewer";
import ReportGenerator from "./components/ReportGenerator";
import Settings from "./components/Settings";
import { readWorklog, undoLastChange } from "./lib/fileUtils";

function App() {
  const [worklogContent, setWorklogContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'input' | 'reports' | 'settings'>('input');

  const loadWorklog = async () => {
    try {
      setIsLoading(true);
      const content = await readWorklog();
      setWorklogContent(content);
    } catch (error) {
      console.error("Failed to load worklog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async () => {
    try {
      setIsLoading(true);
      await undoLastChange();
      await loadWorklog();
    } catch (error) {
      console.error("Failed to undo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorklogUpdate = () => {
    loadWorklog();
  };

  useEffect(() => {
    loadWorklog();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Daily Work Log</h1>
          <div className="flex items-center space-x-4">
            {/* Tab Navigation */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'input'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Daily Input
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                  activeTab === 'reports'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Generate Reports
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
            </div>
            
            <button
              onClick={handleUndo}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Undoing..." : "Undo Last"}
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'input' ? (
          <>
            <div className="w-1/2 border-r border-gray-200">
              <PromptInput onWorklogUpdate={handleWorklogUpdate} />
            </div>
            <div className="w-1/2">
              <WorklogViewer content={worklogContent} />
            </div>
          </>
        ) : activeTab === 'reports' ? (
          <>
            <div className="w-1/2 border-r border-gray-200">
              <ReportGenerator />
            </div>
            <div className="w-1/2">
              <WorklogViewer content={worklogContent} />
            </div>
          </>
        ) : (
          <>
            <div className="w-1/2 border-r border-gray-200">
              <Settings />
            </div>
            <div className="w-1/2">
              <WorklogViewer content={worklogContent} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;