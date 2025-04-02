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
import config from "./config";

function App() {
  return (
    <Router>
      <div>
        {/* Floating top navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  OwlAI Playground
                </Link>
                <Link to="/single-agent" className="text-gray-600 hover:text-gray-800">
                  Single Agent
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content with top padding for the fixed nav */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Playground />} />
            <Route path="/single-agent" element={<SingleAgentPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
