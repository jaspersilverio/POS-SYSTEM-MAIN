import AxiosInstance from "../AxiosInstance";

const RoleServices = {
    loadRoles: async () => {
        return AxiosInstance.get('/loadRoles').then((response) => response).catch((error) => {
            throw error;
        });
    },
   storeRole: async (data: any) => {
    return AxiosInstance.post('/storeRole', data).then((response)=> response).catch((error)=>{
        throw error;
    });
   },
   updateRole: async (id: number, data: any) => {
    return AxiosInstance.put(`/updateRole/${id}`, data)
        .then((response) => response)
        .catch((error) => {
            throw error;
        });
   },
   deleteRole: async (id: number) => {
    return AxiosInstance.delete(`/deleteRole/${id}`)
        .then((response) => response)
        .catch((error) => {
            throw error;
        });
   },
}

export default RoleServices;