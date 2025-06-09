import { useState } from "react";
import AlertMessage from "../../AlertMessage";
import AddRoleModal from "../../modals/AddRoleModal";
import RolesTable from "../../tables/RolesTable";

const Roles = () => {
  const [refreshRoles, setRefreshRoles] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleShowAlertMessage = (
    message: string,
    isSuccess: boolean,
    isVisible: boolean
  ) => {
    setMessage(message);
    setIsSuccess(isSuccess);
    setIsVisible(isVisible);
  };

  const handleCloseAlertMessage = () => {
    setMessage("");
    setIsSuccess(false);
    setIsVisible(false);
  };

  return (
    <>
      <AlertMessage
        message={message}
        isSuccess={isSuccess}
        isVisible={isVisible}
        onClose={handleCloseAlertMessage}
      />
      <div className="container mt-4">
        <AddRoleModal
          onRoleAdded={(message) => {
            handleShowAlertMessage(message, true, true);
            setRefreshRoles(!refreshRoles);
          }}
        />
        <RolesTable 
          refreshRoles={refreshRoles} 
          onRoleDeleted={(message) => {
            handleShowAlertMessage(message, true, true);
            setRefreshRoles(!refreshRoles);
          }}
        />
      </div>
    </>
  );
};

export default Roles;
