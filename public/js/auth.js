async function checkDemoAccess() {
    try {
        const response = await fetch("/api/demo-access");

        if (!response.ok) {
            location.href = "/demo.html";
            return false;
        }

        return true;
    } catch (error) {
        console.error("デモアクセス確認エラー:", error);
        location.href = "/demo.html";
        return false;
    }
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

        return await response.json();
    } catch (error) {
        console.error("ログイン確認エラー:", error);
        location.href = "/auth/login.html";
        return null;
    }
}