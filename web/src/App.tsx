import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitMetadata from "./pages/SubmitMetadata";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { initGA } from "./Analytics";

function App() {
  useEffect(() => {
    initGA();
  }, []);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SubmitMetadata />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
