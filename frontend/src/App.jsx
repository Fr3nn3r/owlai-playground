import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
import config from "./config";

function App() {
  return (
    <Router>
      {/* Floating top navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side - OwlAI title and Feedback link */}
          <div className="flex items-center gap-8">
            <Link 
              to="/single-agent" 
              className="text-xl font-semibold text-gray-800 hover:text-primary transition-colors"
            >
              OwlAI
            </Link>
            <Link
              to="/feedback"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Feedback Dashboard
            </Link>
          </div>

          {/* Right side - Version 0.1.0 link */}
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            version 0.1.0
          </Link>
        </div>
      </nav>

      {/* Content with top padding for the fixed nav */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Playground />} />
          <Route path="/single-agent" element={<SingleAgentPage />} />
          <Route path="/feedback" element={<FeedbackDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
