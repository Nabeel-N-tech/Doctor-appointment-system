// Simulate availability API
// In a real app, this would fetch from the backend

const STORAGE_KEY = "health_app_availability";

// Helper to get from storage
function getStoredSlots() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

// Helper to save to storage
function saveStoredSlots(slots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

export async function getDoctorAvailability(doctorName) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allData = getStoredSlots();
    // Return slots for this doctor, or default empty array
    return allData[doctorName] || ["09:00 AM", "10:00 AM"];
}

export async function toggleAvailability(doctorName, slot) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allData = getStoredSlots();
    const currentSlots = allData[doctorName] || ["09:00 AM", "10:00 AM"];

    let newSlots;
    if (currentSlots.includes(slot)) {
        newSlots = currentSlots.filter((s) => s !== slot);
    } else {
        newSlots = [...currentSlots, slot].sort();
    }

    allData[doctorName] = newSlots;
    saveStoredSlots(allData);

    return newSlots;
}
