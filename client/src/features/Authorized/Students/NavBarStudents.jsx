import { NavLink } from "react-router-dom";

function NavBarStudents() {
  return (
    <ul>
      <li>
        <NavLink to="class">class.html</NavLink>
      </li>
      <li>
        <NavLink to="sandbox">sandbox.js</NavLink>
      </li>
    </ul>
  );
}
export default NavBarStudents;
