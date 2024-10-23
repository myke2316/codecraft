import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './nav.css'; 
import footerimg from "./new.png"

function NavItems() {
  const [isBurgerActive, setIsBurgerActive] = useState(false);

  const handleBurgerClick = () => {
    setIsBurgerActive(!isBurgerActive);
  };

  return (
    <div className="NavItems">
      <div className="codecraft">
      <NavLink to="" style={{ display: 'flex', alignItems: 'center' }}>
        <img
          style={{ width: '60px', height: '50px', marginRight: '10px' }} 
          src={footerimg} 
          alt="CodeCraft logo" 
        />
        <p style={{ margin: 0, fontSize: '24px', color: 'rgb(75, 57, 135)', fontWeight: 'bold' }}>
          CodeCraft
        </p>
      </NavLink>

      </div>
      <div className="burger" onClick={handleBurgerClick}>
        &#9776; 
      </div>

      <div className="navselection">
        <li><NavLink to="">HOME</NavLink></li>
        <li><NavLink to="aboutCourse">COURSE</NavLink></li>
        <li><NavLink to="about">ABOUT</NavLink></li>
      </div>

      <div className="login">
        <NavLink to="login">LOG IN <span>&#8594;</span></NavLink>
      </div>

     

      <div className={`side-menu ${isBurgerActive ? 'active' : ''}`}>
       
        <div className="codecraft">
          <NavLink to="">
            <img 
            style={{ width: '50px', height: '40px', marginRight: '10px' }}
            src={footerimg} alt="" />
          
          </NavLink>
        </div>
        <ul className="navselection-side">
          <li><NavLink to="">HOME</NavLink></li>
          <li><NavLink to="aboutCourse">COURSE</NavLink></li>
          <li><NavLink to="about">ABOUT</NavLink></li>
        </ul>
        <div className="login-side">
          <NavLink to="login">LOG IN</NavLink>
        </div>
      </div>
    </div>
  );
}

export default NavItems;
