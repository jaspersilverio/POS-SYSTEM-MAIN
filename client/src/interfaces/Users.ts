export interface User {
  id: number;
  name: string;
  email?: string | null;
  username: string;
  role: "admin" | "cashier";
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserForm {
  name: string;
  email?: string;
  username: string;
  password: string;
  role: "admin" | "cashier";
  status?: string;
}

export interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

export interface UserTableProps {
  refreshUsers: boolean;
  onUserDeleted: (message: string) => void;
  onAddUser: () => void;
}

export interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  user: User | null;
  onSave: () => void;
}
