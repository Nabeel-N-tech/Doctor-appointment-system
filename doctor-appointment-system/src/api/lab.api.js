import apiClient from "./apiClient";

export async function getLabReports() {
    const { data } = await apiClient.get("/lab-reports/");
    return data;
}

export async function createLabReport(reportData) {
    const { data } = await apiClient.post("/lab-reports/create/", reportData);
    return data;
}
