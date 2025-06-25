import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavCategories.css';

function NavCategories() {
  return (
    <nav className="categories">
      <ul>
        <li><Link to="/category/new">New products</Link></li>
        <li><Link to="/category/learning">Learning and Well-being</Link></li>
        <li><Link to="/category/food">Food & Drink</Link></li>
        <li><Link to="/category/fashion">Fashion</Link></li>
        <li><Link to="/category/beauty">Beauty</Link></li>
        <li><Link to="/category/lifestyle">Lifestyle</Link></li>
        <li><Link to="/category/fitness">Fitness</Link></li>
        <li><Link to="/category/technology">Technology</Link></li>
        <li><Link to="/category/all">All</Link></li>
      </ul>
    </nav>
  );
}

export default NavCategories;
