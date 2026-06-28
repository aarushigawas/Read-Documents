'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = async (files: FileList) => {
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      showToast('Please upload PDF files only', 'error');
      return;
    }

    const formData = new FormData();
    pdfFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploadedFiles(prev => [...prev, ...data.filenames]);
      showToast(`Successfully uploaded ${data.filenames.length} file(s)`, 'success');
    } catch (error) {
      showToast('Failed to upload files', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      showToast('Failed to get response', 'error');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    showToast('Chat cleared', 'success');
  };

  const handleClearDocuments = async () => {
    try {
      await fetch(`${API_URL}/clear`, { method: 'POST' });
      setUploadedFiles([]);
      showToast('Documents cleared', 'success');
    } catch (error) {
      showToast('Failed to clear documents', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-700/50 backdrop-blur-xl bg-zinc-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Read Documents AI
                </h1>
                <p className="text-xs text-zinc-400">Upload PDFs and ask questions instantly</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-medium border border-zinc-700"
              >
                Clear Chat
              </button>
              <button
                onClick={handleClearDocuments}
                className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors text-sm font-medium border border-red-600/50 text-red-400"
              >
                Clear Documents
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Upload */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-zinc-800/50 rounded-2xl border border-zinc-700/50 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Documents
              </h2>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-zinc-600 hover:border-zinc-500 hover:bg-zinc-700/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-zinc-400 mb-2">Drag & drop PDF files here</p>
                <p className="text-xs text-zinc-500">or click to browse</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Uploaded Files</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-700/30 border border-zinc-700/50 animate-fade-in">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 17h8v-2H8v2zm0-4h8v-2H8v2z" />
                        </svg>
                        <span className="text-sm text-zinc-300 truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Chat */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex flex-col h-[calc(100vh-12rem)]">
              <div className="p-4 border-b border-zinc-700/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Chat
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-zinc-400 mb-2">Start a conversation</p>
                    <p className="text-sm text-zinc-500">Upload PDFs and ask questions about your documents</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
                            : 'bg-zinc-700/50 border border-zinc-600/50 text-zinc-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-zinc-700/50 border border-zinc-600/50 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-zinc-700/50">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="flex-1 bg-zinc-700/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2"
                  >
                    {isLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        Send
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl border backdrop-blur-xl animate-fade-in ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
