import { useEffect } from "react";
import "../style/CustomAlertMessage.css"; // Import styles

interface AlertMessageProps {
  message: string;
  isSuccess: boolean;
  isVisible: boolean;
  onClose: () => void;
  customClass?: string;
}

const AlertMessage = ({
  message,
  isSuccess,
  isVisible,
  onClose,
  customClass = "alert-green",
}: AlertMessageProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={`custom-alert alert d-flex align-items-start gap-4 shadow-lg ${
        customClass ? customClass : isSuccess ? "alert-success" : "alert-danger"
      } ${isVisible ? "fade-in" : "d-none"}`}
      role="alert"
    >
      {/* Icon section */}
      <div className="d-flex align-items-center">
        <i className="ki-duotone ki-search-list fs-2hx text-light me-4 mb-5 mb-sm-0">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
      </div>

      {/* Text content section */}
      <div className="d-flex flex-column text-light pe-0 pe-sm-10">
        <h4 className="mb-2 fw-bold">{isSuccess ? "Success!" : "Error"}</h4>
        <span className="mssg">{message}</span>
      </div>
    </div>
  );
};

export default AlertMessage;
