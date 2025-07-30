import { useState, useEffect } from "react";
import { processWorklog, getOpenAIKeyStatus } from "../lib/fileUtils";

interface PromptInputProps {
  onWorklogUpdate: () => void;
}

function PromptInput({ onWorklogUpdate }: PromptInputProps) {
  const [entries, setEntries] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const status = await getOpenAIKeyStatus();
      setHasApiKey(status);
    } catch (err) {
      console.error("Failed to check API key status:", err);
      setError("Failed to check API key status. Please check your configuration.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entries.trim()) {
      setError("Please enter at least one work win");
      return;
    }

    if (!hasApiKey) {
      setError("Please configure your OpenAI API key in Settings first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Split entries by newlines and filter out empty lines
      const entryList = entries
        .split("\n")
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
      
      // Process worklog directly
      await processWorklog(entryList);
      
      // Clear entries after successful submission
      setEntries("");
      
      // Trigger worklog refresh
      onWorklogUpdate();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process worklog");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-full flex flex-col">
      <div className="p-6 text-white" style={{backgroundColor: '#3F72AF'}}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🎆</span>
          </div>
          <h2 className="text-xl font-bold">Today's Work Wins</h2>
        </div>
        <p className="text-sm mt-2" style={{color: '#DBE2EF'}}>Share your achievements and let AI organize them beautifully</p>
      </div>
      
      <div className="flex-1 flex flex-col p-6">
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {!hasApiKey && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🔑</span>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Setup Required
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Please configure your OpenAI API key in the <strong>Settings</strong> tab to start adding work wins.
                </p>
              </div>
            </div>
          </div>
        )}

        
        <div className="flex-1 flex flex-col">
          <label htmlFor="entries" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <span>✨</span>
            <span>Enter 1-3 achievements (one per line)</span>
          </label>
          <div className="flex-1 relative">
            <textarea
              id="entries"
              value={entries}
              onChange={(e) => setEntries(e.target.value)}
              placeholder="• Fixed the login bug that was affecting new users&#10;• Completed the dashboard redesign mockups&#10;• Set up CI/CD pipeline for the backend service"
              className="w-full h-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-200 bg-gray-50 focus:bg-white"
              style={{'--tw-ring-color': '#3F72AF', 'borderColor': entries ? '#3F72AF' : undefined} as React.CSSProperties}
              rows={10}
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">⚠️</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !hasApiKey}
          className="mt-6 w-full text-white py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-sm"
          style={{
            backgroundColor: '#3F72AF',
            '--tw-ring-color': '#3F72AF'
          } as React.CSSProperties}
          onMouseEnter={(e) => !isLoading && !hasApiKey ? null : (e.target as HTMLElement).style.backgroundColor = '#112D4E'}
          onMouseLeave={(e) => !isLoading && !hasApiKey ? null : (e.target as HTMLElement).style.backgroundColor = '#3F72AF'}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Add to Worklog</span>
            </>
          )}
        </button>
      </form>
      </div>
    </div>
  );
}

export default PromptInput;