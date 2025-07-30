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
  const [showUndoConfirm, setShowUndoConfirm] = useState<boolean>(false);

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

  const handleUndoClick = () => {
    setShowUndoConfirm(true);
  };

  const handleUndoConfirm = async () => {
    setShowUndoConfirm(false);
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

  const handleUndoCancel = () => {
    setShowUndoConfirm(false);
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
              onClick={handleUndoClick}
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

      {/* Undo Confirmation Modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Undo Action</h3>
                  <p className="text-sm text-gray-500 mt-1">This action cannot be reversed</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to undo your last worklog change? This will restore the previous version and permanently delete the current changes.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleUndoCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUndoConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <span>↶</span>
                  <span>Undo Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;