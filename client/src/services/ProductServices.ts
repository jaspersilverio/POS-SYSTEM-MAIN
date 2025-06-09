import AxiosInstance from "../AxiosInstance";

const ProductServices = {
    loadProducts: async () => {
        return AxiosInstance.get('/loadProducts')
            .then((response) => response)
            .catch((error) => {
                throw error;
            });
    },

    storeProduct: async (data: FormData) => {
        return AxiosInstance.post('/storeProduct', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => response)
            .catch((error) => {
                throw error;
            });
    },

    updateProduct: async (id: number, data: FormData) => {
        return AxiosInstance.put(`/updateProduct/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => response)
            .catch((error) => {
                throw error;
            });
    },

    deleteProduct: async (id: number) => {
        return AxiosInstance.delete(`/deleteProduct/${id}`)
            .then((response) => response)
            .catch((error) => {
                throw error;
            });
    },
};

export default ProductServices; 