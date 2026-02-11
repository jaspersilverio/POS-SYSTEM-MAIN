import { NavLink, useNavigate } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
import { FaStore, FaBoxesStacked } from "react-icons/fa6";
import { HiShoppingCart } from "react-icons/hi2";
import { IoSettings } from "react-icons/io5";
import logo from "../../assets/logo.png";
import logoSnack from "../../assets/SnackHub v2.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === "admin";

  const allItems = [
    { title: "Dashboard", path: "/", icon: "dashboard" },
    { title: "POS", path: "/pos", icon: "pos" },
    { title: "Products", path: "/products", icon: "products", adminOnly: true },
    { title: "Inventory", path: "/inventory", icon: "inventory", adminOnly: true },
    { title: "Settings", path: "/settings", icon: "settings" },
  ];

  const menuItems = allItems.filter((item) => !item.adminOnly || isAdmin);

  const icons: Record<string, React.ReactNode> = {
    dashboard: <BiSolidDashboard className="me-2" />,
    pos: <HiShoppingCart className="me-2" />,
    products: <FaStore className="me-2" />,
    inventory: <FaBoxesStacked className="me-2" />,
    settings: <IoSettings className="me-2" />,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <div className="logo sidebar d-flex flex-column p-3 text-white">
      <img src={logoSnack} alt="SnackHub Logo" className="logo2" />
      <img src={logo} alt="Logo" className="logo" />
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item mb-2" key={index}>
            <NavLink to={item.path} className={({ isActive }) => "nav-link text-white" + (isActive ? " active" : "")} end={item.path === "/"}>
              {icons[item.icon]}
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <small className="text-muted d-block mb-1">{user?.name} ({user?.role})</small>
        <button type="button" className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
