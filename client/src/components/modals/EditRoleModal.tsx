import React, { useState, useEffect } from "react";
import RoleServices from "../../services/RoleServices";
import ErrorHandler from "../../../src/handler/ErrorHandler";

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
  role: { role_id: number; role_name: string; description: string } | null;
}

const EditRoleModal: React.FC<Props> = ({ show, onClose, onSave, role }) => {
  const [state, setState] = useState({
    roleName: "",
    roleDescription: "",
    loading: false,
    errors: {} as any,
  });

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (role) {
      setState((prev) => ({
        ...prev,
        roleName: role.role_name,
        roleDescription: role.description || "",
        errors: {},
      }));
    }
  }, [role, show]);

  const handleSubmit = async () => {
    if (!role) return;

    setState((prev) => ({ ...prev, loading: true, errors: {} }));

    try {
      const response = await RoleServices.updateRole(role.role_id, {
        roleName: state.roleName,
        roleDesc: state.roleDescription,
      });

      if (response.status === 200) {
        onSave(response.data.message);
        onClose();
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setState((prev) => ({
          ...prev,
          errors: error.response.data.errors,
        }));
      } else {
        ErrorHandler(error, null);
      }
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (role) {
      setState((prev) => ({
        ...prev,
        roleName: role.role_name,
        roleDescription: role.description || "",
        errors: {},
      }));
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">Edit Role</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleCancel}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.roleName ? "is-invalid" : ""
                }`}
                value={state.roleName}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, roleName: e.target.value }))
                }
              />
              {state.errors.roleName && (
                <div className="invalid-feedback">
                  {state.errors.roleName[0]}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={state.roleDescription}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    roleDescription: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            {state.loading ? (
              <button className="btn btn-success" type="button" disabled>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading...
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
