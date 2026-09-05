import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { Timeline } from './Timeline';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="layout-container">
    <nav className="nav">
      <Link to="/">Accueil</Link>
      <Link to="/timeline">Timeline</Link>
    </nav>
    <main>{children}</main>
  </div>
);

const Home = () => <h1>Bienvenue sur Love Quest</h1>;

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
        </Routes>
      </Layout>
    </Router>
  );
}
