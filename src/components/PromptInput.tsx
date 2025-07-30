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
    <div className="h-full flex flex-col p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Work Wins</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {!hasApiKey && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>🔑 Setup Required:</strong> Please configure your OpenAI API key in the <strong>Settings</strong> tab to start adding work wins.
            </p>
          </div>
        )}

        
        <div className="flex-1 flex flex-col">
          <label htmlFor="entries" className="block text-sm font-medium text-gray-700 mb-2">
            Enter 1-3 achievements (one per line)
          </label>
          <textarea
            id="entries"
            value={entries}
            onChange={(e) => setEntries(e.target.value)}
            placeholder="• Fixed the login bug that was affecting new users&#10;• Completed the dashboard redesign mockups&#10;• Set up CI/CD pipeline for the backend service"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={10}
          />
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Add to Worklog"}
        </button>
      </form>
    </div>
  );
}

export default PromptInput;