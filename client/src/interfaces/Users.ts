import type { Roles } from "./Roles";


export interface UserForm {
    profile_image?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix_name?: string;
    age: string;
    gender: 'female' | 'male' | 'others';
    contact: string;
    address: string;
    role_id: Roles;
    email: string;
    password: string;
  }
  