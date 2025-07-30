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
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#DBE2EF'}}>
              <span className="text-lg font-bold" style={{color: '#3F72AF'}}>📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Work Log</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-gray-100 p-1 space-x-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'input'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                style={activeTab === 'input' ? {backgroundColor: '#3F72AF'} : {}}
              >
                <span>✏️</span>
                <span>Daily Input</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'reports'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                style={activeTab === 'reports' ? {backgroundColor: '#3F72AF'} : {}}
              >
                <span>📊</span>
                <span>Reports</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'settings'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                style={activeTab === 'settings' ? {backgroundColor: '#3F72AF'} : {}}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </button>
            </div>
            
            <button
              onClick={handleUndo}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <span>↶</span>
              <span>{isLoading ? "Undoing..." : "Undo Last"}</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {activeTab === 'input' ? (
          <>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <PromptInput onWorklogUpdate={handleWorklogUpdate} />
              </div>
            </div>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <WorklogViewer content={worklogContent} />
              </div>
            </div>
          </>
        ) : activeTab === 'reports' ? (
          <>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <ReportGenerator />
              </div>
            </div>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <WorklogViewer content={worklogContent} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <Settings />
              </div>
            </div>
            <div className="w-1/2">
              <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
                <WorklogViewer content={worklogContent} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;