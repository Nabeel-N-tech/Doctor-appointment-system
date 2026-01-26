import apiClient from "./apiClient";

export async function getNotifications() {
    const { data } = await apiClient.get("/notifications/");
    return data;
}

export async function markAsRead(id) {
    const { data } = await apiClient.put(`/notifications/${id}/read/`, {});
    return data;
}
