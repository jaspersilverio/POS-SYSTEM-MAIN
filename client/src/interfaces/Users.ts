export interface User {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix_name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  password: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  profile_picture: string | null;
  role?: {
    role_id: number;
    role_name: string;
  };
}

export interface UserForm {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix_name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  password: string;
  role_id: number;
}

export interface AddUserModalProps {
  onUserAdded: (message: string) => void;
}

export interface UserTableProps {
  refreshUsers: boolean;
  onUserDeleted: (message: string) => void;
}

export interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user: User;
  onUserUpdated: () => void;
}
  