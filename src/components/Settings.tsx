import { useState, useEffect } from "react";
import { saveOpenAIKey, getOpenAIKeyStatus, deleteOpenAIKey } from "../lib/fileUtils";

function Settings() {
  const [apiKey, setApiKey] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const status = await getOpenAIKeyStatus();
      setHasApiKey(status);
    } catch (err) {
      console.error("Failed to check API key status:", err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key");
      return;
    }

    if (!apiKey.startsWith('sk-') || apiKey.length < 40 || !/^sk-[A-Za-z0-9_-]+$/.test(apiKey)) {
      setError("Invalid OpenAI API key format. Keys should start with 'sk-' and be at least 40 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      await saveOpenAIKey(apiKey);
      
      setSuccess("API key saved securely!");
      setApiKey(""); // Clear the input
      setHasApiKey(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm("Are you sure you want to delete your saved API key?")) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      await deleteOpenAIKey();
      
      setSuccess("API key deleted successfully!");
      setHasApiKey(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* API Key Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">OpenAI API Key</h3>
          
          {hasApiKey ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">API Key Configured</p>
                  <p className="text-sm text-gray-500">Your OpenAI API key is securely stored in your system keychain</p>
                </div>
              </div>
              
              <button
                onClick={handleDeleteKey}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete API Key"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your OpenAI API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">OpenAI Platform</a>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save API Key"}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Secure Storage</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your API key is encrypted and stored in:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>macOS:</strong> Keychain Access</li>
                  <li><strong>Windows:</strong> Windows Credential Manager</li>
                  <li><strong>Linux:</strong> Secret Service (GNOME Keyring)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;