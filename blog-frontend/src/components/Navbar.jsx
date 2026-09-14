import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login", { replace: true });
  };

  const getNavClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? "/" : "/login"} className="navbar-logo" onClick={closeMenu}>
          <span className="logo-mark">B</span>
          <span>BlogDesk</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={menuOpen ? "navbar-links open" : "navbar-links"}>
          {isAuthenticated ? (
            <>
              <NavLink to="/blogs" className={getNavClass} onClick={closeMenu}>
                Blogs
              </NavLink>
              <NavLink to="/dashboard" className={getNavClass} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/blogs/create" className={getNavClass} onClick={closeMenu}>
                Create Blog
              </NavLink>
              {user?.username && <span className="user-pill">{user.username}</span>}
              <button className="nav-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getNavClass} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className={getNavClass} onClick={closeMenu}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
