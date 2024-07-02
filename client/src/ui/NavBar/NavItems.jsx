import { NavLink } from "react-router-dom";

function NavItems() {
  const base = "text-sm text-white"
  return (
    <>
      <li >
        <NavLink  to="">home.jsx</NavLink>
      </li>
      <li>
        <NavLink to="aboutCourse">course.css</NavLink>
      </li>
      <li>
        <NavLink to="about">about.html</NavLink>
      </li>
      <li>
        <NavLink to="login">login.js</NavLink>
      </li>
      <li>
        <NavLink to="signup">signup.js</NavLink>
      </li>
    </>
  );
}
export default NavItems;
