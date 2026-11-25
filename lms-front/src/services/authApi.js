import client from "./api"

export const loginApi = async(data)=>{
    const response = await client.post("/api/auth/login", data);
    return response.data;
}

export const getCurrentUserApi = async (token) =>{
    const response = await client.get("/api/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}