async function checkDemoAccess() {
    return true;
}

async function checkLogin() {
    try {
        const demoAllowed = await checkDemoAccess();

        if (!demoAllowed) {
            return null;
        }

        const response = await fetch("/api/me");

        if (!response.ok) {
            location.href = "/auth/login.html";
            return null;
        }

        const data = await response.json();

        return data.user || data;

    } catch (error) {
        console.error("ログイン確認エラー:", error);
        location.href = "/auth/login.html";
        return null;
    }
}