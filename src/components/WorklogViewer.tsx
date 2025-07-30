import ReactMarkdown from "react-markdown";

interface WorklogViewerProps {
  content: string;
}

function WorklogViewer({ content }: WorklogViewerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-700 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">📝</span>
          </div>
          <h2 className="text-xl font-bold">Your Worklog</h2>
        </div>
        <p className="text-gray-300 text-sm mt-2">AI-organized achievements and progress tracking</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg p-6 h-full border border-gray-200">
          <ReactMarkdown className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800">
            {content || "# Daily Work Log\n\n🎆 Your organized achievements will appear here...\n\nStart by adding your first work win in the input panel!"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default WorklogViewer;