import axios from 'axios';
import type { UserForm } from '../interfaces/Users';

const API_URL = "http://localhost:8000/api";

const UserServices = {
  getAllUsers: () => {
    return axios.get(`${API_URL}/users`);
  },

  getUserById: (id: number) => {
    return axios.get(`${API_URL}/users/${id}`);
  },

  addUser: (userData: UserForm) => {
    return axios.post(`${API_URL}/users`, userData);
  },

  updateUser: (id: number, userData: UserForm) => {
    return axios.put(`${API_URL}/users/${id}`, userData);
  },

  deleteUser: (id: number) => {
    return axios.delete(`${API_URL}/users/${id}`);
  },
};

export default UserServices; 