import { useNavigate } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import "./styles/globals.css";

function App() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleIdle = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  if (!token) {
    return <AppRoutes />;
  }

  return <AuthenticatedLayout onIdle={handleIdle} />;
}

function AuthenticatedLayout({ onIdle }: { onIdle: () => void }) {
  useIdleTimeout(onIdle);
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 app-main">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
