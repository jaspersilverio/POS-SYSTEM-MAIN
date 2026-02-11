import { useNavigate } from "react-router-dom";

const ErrorHandler = (
  error: unknown,
  _navigate: ReturnType<typeof useNavigate> | null
): void => {
  const err = error as { response?: { status?: number } };
  if (err?.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }
  console.error("Request error:", err);
};

export default ErrorHandler;
