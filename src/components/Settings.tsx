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
    <div className="h-full flex flex-col">
      <div className="bg-gray-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">⚙️</span>
          </div>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        <p className="text-gray-300 text-sm mt-2">Configure your app preferences and security</p>
      </div>
      
      <div className="flex-1 p-6">
      
      <div className="space-y-6">
        {/* API Key Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#DBE2EF'}}>
              <span className="text-lg" style={{color: '#3F72AF'}}>🔑</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">OpenAI API Key</h3>
              <p className="text-sm text-gray-500">Securely stored in your system keychain</p>
            </div>
          </div>
          
          {hasApiKey ? (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">API Key Configured</p>
                    <p className="text-xs text-green-700 mt-1">Your OpenAI API key is securely stored in your system keychain</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDeleteKey}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span>{isLoading ? "Deleting..." : "Delete API Key"}</span>
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{'--tw-ring-color': '#3F72AF', 'borderColor': apiKey ? '#3F72AF' : undefined} as React.CSSProperties}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">OpenAI Platform</a>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                style={{
                  backgroundColor: '#3F72AF',
                  '--tw-ring-color': '#3F72AF'
                } as React.CSSProperties}
                onMouseEnter={(e) => isLoading ? null : (e.target as HTMLElement).style.backgroundColor = '#112D4E'}
                onMouseLeave={(e) => isLoading ? null : (e.target as HTMLElement).style.backgroundColor = '#3F72AF'}
              >
                <span>💾</span>
                <span>{isLoading ? "Saving..." : "Save API Key"}</span>
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
        <div className="rounded-lg p-6" style={{backgroundColor: '#F9F7F7', borderColor: '#DBE2EF'}}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#DBE2EF'}}>
                <span className="text-lg" style={{color: '#3F72AF'}}>🔒</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-2" style={{color: '#112D4E'}}>Secure Storage</h4>
              <p className="text-sm mb-3" style={{color: '#3F72AF'}}>Your API key is encrypted and stored in:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm" style={{color: '#3F72AF'}}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#3F72AF'}}></span>
                  <span><strong>macOS:</strong> Keychain Access</span>
                </div>
                <div className="flex items-center space-x-2 text-sm" style={{color: '#3F72AF'}}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#3F72AF'}}></span>
                  <span><strong>Windows:</strong> Windows Credential Manager</span>
                </div>
                <div className="flex items-center space-x-2 text-sm" style={{color: '#3F72AF'}}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: '#3F72AF'}}></span>
                  <span><strong>Linux:</strong> Secret Service (GNOME Keyring)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Settings;