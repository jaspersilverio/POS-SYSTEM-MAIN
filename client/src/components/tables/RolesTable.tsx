import { useEffect, useState } from "react";
import type { Roles } from "../../interfaces/Roles";
import RoleServices from "../../services/RoleServices";
import ErrorHandler from "../../handler/ErrorHandler";
import Spinner from "./Spinner";
import EditRoleModal from "../modals/EditRoleModal";

interface RolesTableProps {
  refreshRoles: boolean;
  onRoleDeleted: (message: string) => void;
}

const RolesTable = ({ refreshRoles, onRoleDeleted }: RolesTableProps) => {
  const [state, setState] = useState({
    loadingRoles: true,
    roles: [] as Roles[],
    showEditModal: false,
    selectedRole: null as Roles | null,
  });

  const handleLoadRoles = () => {
    RoleServices.loadRoles()
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            roles: res.data.roles,
          }));
        } else {
          console.error("Unexpected status error loading Roles:", res.status);
        }
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingRoles: false,
        }));
      });
  };

  useEffect(() => {
    handleLoadRoles();
  }, [refreshRoles]);

  const handleEditClick = (role: Roles) => {
    setState((prev) => ({
      ...prev,
      showEditModal: true,
      selectedRole: role,
    }));
  };

  const handleEditClose = () => {
    setState((prev) => ({
      ...prev,
      showEditModal: false,
      selectedRole: null,
    }));
  };

  const handleEditSave = () => {
    handleLoadRoles(); // Refresh the roles list
    handleEditClose();
  };

  const handleDeleteClick = (role: Roles) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      RoleServices.deleteRole(role.role_id)
        .then((res) => {
          if (res.status === 200) {
            onRoleDeleted(res.data.message);
            handleLoadRoles(); // Refresh the roles list
          }
        })
        .catch((error) => {
          ErrorHandler(error, null);
        });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Roles</h3>
        <button
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#addRoleModal"
        >
          Add Role
        </button>
      </div>

      <table className="table table-dark table-striped table-hover">
        <thead className="align-middle">
          <tr className="align-middle">
            <th>ID</th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.loadingRoles ? (
            <tr className="align-middle">
              <td colSpan={4} className="text-center">
                <Spinner />
              </td>
            </tr>
          ) : (
            state.roles.map((role, index) => (
              <tr className="" key={index}>
                <td>{index + 1}</td>
                <td>{role.role_name}</td>
                <td>{role.description}</td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleEditClick(role)}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(role)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <EditRoleModal
        show={state.showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        role={state.selectedRole}
      />
    </div>
  );
};

export default RolesTable;
