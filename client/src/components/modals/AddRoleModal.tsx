import { useState, type ChangeEvent, type FormEvent } from "react";
import RoleServices from "../../services/RoleServices";
import ErrorHandler from "../../handler/ErrorHandler";
import type { RoleFieldErrors } from "../../interfaces/RoleFieldErrors";
import { useRef } from "react";

interface AddRoleModalProps {
  onRoleAdded: (message: string) => void;
}

const AddRoleModal = ({ onRoleAdded }: AddRoleModalProps) => {
  const [state, setState] = useState({
    loadingStore: false,
    roleName: "",
    roleDesc: "",
    errors: {} as RoleFieldErrors,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStoreRole = (e: FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({
      ...prevState,
      loadingStore: true,
    }));

    RoleServices.storeRole(state)
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            roleName: "",
            roleDesc: "",
            errors: {} as RoleFieldErrors,
          }));

          if (modalRef.current) {
            // @ts-ignore
            const modal = window.bootstrap.Modal.getOrCreateInstance(
              modalRef.current
            );
            // First hide the modal
            modal.hide();
            // Then dispose of it
            modal.dispose();
            // Clean up the backdrop and body classes
            const backdrop = document.querySelector(".modal-backdrop");
            if (backdrop) {
              backdrop.remove();
            }
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
          }

          onRoleAdded(res.data.message);
        } else {
          console.error("Unexpected error during role creation:", res.status);
        }
      })
      .catch((error) => {
        if (error.response.status === 422) {
          setState((prevState) => ({
            ...prevState,
            errors: error.response.data.errors,
          }));
        } else {
          ErrorHandler(error, null);
        }
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingStore: false,
        }));
      });
  };

  return (
    <>
      <form onSubmit={handleStoreRole}>
        <div
          ref={modalRef}
          className="modal fade"
          id="addRoleModal"
          tabIndex={-1}
          aria-labelledby="addRoleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title" id="addRoleModalLabel">
                  Add Role
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="roleName" className="form-label">
                    Role Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      state.errors.roleName ? "is-invalid" : ""
                    }`}
                    id="roleName"
                    placeholder="Enter role name"
                    name="roleName"
                    value={state.roleName}
                    onChange={handleInputChange}
                  />
                  {state.errors.roleName && (
                    <p className="text-danger">{state.errors.roleName[0]}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="roleDesc" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="roleDesc"
                    rows={3}
                    placeholder="Enter role description"
                    name="roleDesc"
                    value={state.roleDesc}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                {/* <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button> */}
                {state.loadingStore ? (
                  <button className="btn btn-primary" type="button" disabled>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </button>
                ) : (
                  <button type="submit" className="btn btn-danger">
                    Save Role
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddRoleModal;
