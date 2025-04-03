import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import DefaultQueries from "./components/DefaultQueries";
import TypingIndicator from "./components/TypingIndicator";
import SingleAgentPage from "./components/SingleAgentPage";
import Playground from "./components/Playground";
import FeedbackDashboard from "./components/FeedbackDashboard";
import SharedPage from "./components/SharedPage";
import config from "./config";

function App() {
  return (
    <Router>
      {/* Floating top navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side - Marianne link */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
            >
              Marianne
            </Link>
          </div>

          {/* Center - OwlAI title and version */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-800">
              OwlAI
            </span>
            <span className="text-sm text-gray-500">
              v0.2.0
            </span>
          </div>

          {/* Right side - Social links and Dashboard */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Fr3nn3r"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaGithub className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/frdbrunner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
            <Link
              to="/feedback"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Feedback Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Content with top padding for the fixed nav */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<SingleAgentPage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/feedback" element={<FeedbackDashboard />} />
          <Route path="/shared/:queryId" element={<SharedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
