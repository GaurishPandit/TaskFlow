import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">◆</span> TaskFlow
        </Link>

        {user && (
          <nav className="navbar-nav">
            <NavLink to="/" end className="nav-link">
              Projects
            </NavLink>
            <NavLink to="/analytics" className="nav-link">
              Analytics
            </NavLink>
          </nav>
        )}
      </div>

      {user && (
        <nav className="navbar-right">
          <span className="navbar-user">{user.name}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
