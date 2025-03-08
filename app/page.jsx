// app/ainu/page.jsx
"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function AinuPage() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isLoadingClean, setIsLoadingClean] = useState(false);
  const [isLoadingOptimize, setIsLoadingOptimize] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const languages = [
    "javascript",
    "python",
    "java",
    "cpp",
    "typescript",
    "ruby",
    "go",
  ];

  // Auto-hide popup after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 3000);
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const extractCodeFromMarkdown = (markdown) => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;
    const match = markdown.match(codeBlockRegex);
    return match ? match[1] : markdown;
  };

  const handleProcessCode = async (mode) => {
    const setLoading = mode === "clean" ? setIsLoadingClean : setIsLoadingOptimize;
    setLoading(true);

    try {
      const endpoint = mode === "clean" ? "/api/clean" : "/api/optimize";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode, language }),
      });
      const data = await response.json();
      if (response.ok) {
        const extractedCode = extractCodeFromMarkdown(data.result);
        setOutputCode(`\`\`\`${language}\n${extractedCode}\n\`\`\``);
      } else {
        setOutputCode(`Error: ${data.error}`);
      }
    } catch (error) {
      setOutputCode(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      const codeToCopy = extractCodeFromMarkdown(outputCode);
      await navigator.clipboard.writeText(codeToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-lg relative animate-fade-in">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-2">Note</h3>
            <p className="text-gray-300">
              Since you are using the free version of Ainu, it can clean or optimize code less than 50 lines.
            </p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Ainu</h1>
          <div className="flex gap-4 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <div className="hidden md:flex gap-4">
              <button
                onClick={() => handleProcessCode("clean")}
                disabled={isLoadingClean || isLoadingOptimize || !inputCode}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-gray-600 py-2 px-4 rounded-md transition-colors"
              >
                {isLoadingClean ? "Cleaning..." : "Clean"}
              </button>
              <button
                onClick={() => handleProcessCode("optimize")}
                disabled={isLoadingClean || isLoadingOptimize || !inputCode}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-gray-600 py-2 px-4 rounded-md transition-colors"
              >
                {isLoadingOptimize ? "Optimizing..." : "Optimize"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-80px)]">
        {/* Input Code Block */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Input Code</h2>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
            placeholder="Enter your code here... (less than 50 lines)"
          />
          <div className="flex gap-4 mt-4 md:hidden">
            <button
              onClick={() => handleProcessCode("clean")}
              disabled={isLoadingClean || isLoadingOptimize || !inputCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded-md transition-colors"
            >
              {isLoadingClean ? "Cleaning..." : "Clean"}
            </button>
            <button
              onClick={() => handleProcessCode("optimize")}
              disabled={isLoadingClean || isLoadingOptimize || !inputCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded-md transition-colors"
            >
              {isLoadingOptimize ? "Optimizing..." : "Optimize"}
            </button>
          </div>
        </div>

        {/* Output Code Block */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Output Code</h2>
            {outputCode && (
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 cursor-pointer py-1 px-3 rounded-md text-sm transition-colors flex items-center gap-1"
              >
                {copySuccess ? (
                  <>
                    <span className="text-green-400">✓</span> Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-4 overflow-auto">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeLanguage = match ? match[1] : language;
                  return !inline ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={codeLanguage}
                      PreTag="div"
                      showLineNumbers={true}
                      lineNumberStyle={{ color: "#6b7280", paddingRight: "1rem" }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {outputCode || "Your processed code will appear here..."}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}