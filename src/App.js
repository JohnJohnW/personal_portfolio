import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Insights from './components/Insights';
import Article1 from './components/Article1'; // Import Article1 component
import Article2 from './components/Article2'; // Import Article2 component
import Article3 from './components/Article3'; // Import Article3 component
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/article1" element={<Article1 />} /> {/* Add Article1 route */}
          <Route path="/article2" element={<Article2 />} /> {/* Add Article2 route */}
          <Route path="/article3" element={<Article3 />} /> {/* Add Article3 route */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
