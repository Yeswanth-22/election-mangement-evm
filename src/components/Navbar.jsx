import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar({ title }) {
	const { currentUser, logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header className="top-nav">
			<div>
				<p className="badge">Election Monitoring</p>
				<h2>{title}</h2>
			</div>

			<div className="top-nav-actions">
				<Link className="btn btn-outline" to="/">
					Home
				</Link>
				<div className="user-chip">
					<span>{currentUser?.name}</span>
					<small>{currentUser?.role}</small>
				</div>
				<button className="btn btn-primary" type="button" onClick={handleLogout}>
					Logout
				</button>
			</div>
		</header>
	);
}

export default Navbar;
