document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.onclick = async () => {
        const confirmed = confirm("ログアウトしますか？");

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch("/api/logout", {
                method: "POST"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            location.href = "/auth/login.html";
        } catch (error) {
            console.error("ログアウトエラー:", error);
            alert("ログアウトに失敗しました");
        }
    };
});