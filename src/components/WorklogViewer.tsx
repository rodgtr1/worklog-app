import ReactMarkdown from "react-markdown";

interface WorklogViewerProps {
  content: string;
}

function WorklogViewer({ content }: WorklogViewerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Worklog Preview</h2>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default WorklogViewer;