import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './nav.css'; 

function NavItems() {
  const [isBurgerActive, setIsBurgerActive] = useState(false);

  const handleBurgerClick = () => {
    setIsBurgerActive(!isBurgerActive);
  };

  return (
    <div className="NavItems">
      <div className="codecraft">
        <NavLink to="">
          <p><span style={{color: 'rgb(255, 200, 55)'}}>{"<"}</span><span>{"/"}</span><span style={{color: 'rgb(255, 200, 55)'}}>{">"}</span> CodeCraft</p>
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
        <div className="close" onClick={handleBurgerClick}>
          &times; {/* Close icon */}
        </div>
        <div className="codecraft">
          <NavLink to="">
            <p>{"<"}</p>
            <span className="slash">/</span>
            <p>{">"}</p>
            <p style={{ marginLeft: '10px' }}></p>
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
