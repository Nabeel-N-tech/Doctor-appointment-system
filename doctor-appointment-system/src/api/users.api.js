import apiClient from "./apiClient";

export async function getDoctors() {
    const { data } = await apiClient.get("/doctors/");
    return data;
}

export async function getAllUsers() {
    const { data } = await apiClient.get("/users/");
    return data;
}

export async function createUser(userData) {
    const { data } = await apiClient.post("/users/create/", userData);
    return data;
}

export async function deleteUser(id) {
    const { data } = await apiClient.delete(`/users/${id}/delete/`);
    return data;
}

export async function updateUser(id, userData) {
    const { data } = await apiClient.patch(`/users/${id}/update/`, userData);
    return data;
}

export async function updateProfile(profileData) {
    const { data } = await apiClient.patch("/profile/", profileData);
    return data;
}

export async function getProfile() {
    const { data } = await apiClient.get("/profile/");
    return data;
}