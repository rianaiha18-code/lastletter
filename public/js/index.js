document.addEventListener("DOMContentLoaded", async () => {
    const allowed = await checkDemoAccess();

    if (!allowed) {
        return;
    }
});