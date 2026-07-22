document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const logoutButton = document.getElementById("logoutButton");

    function showProfileError() {
        if (userName) {
            userName.textContent = "読み込みに失敗しました";
        }

        if (userEmail) {
            userEmail.textContent = "";
        }
    }

    async function loadMyPage() {
        try {
            const response = await fetch("/api/me");

            if (response.status === 401) {
                window.location.href = "/";
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "ユーザー情報の取得に失敗しました"
                );
            }

            const user = data.user || data;

            if (userName) {
                userName.textContent =
                    user.name ||
                    user.username ||
                    "名前未設定";
            }

            if (userEmail) {
                userEmail.textContent = user.email || "";
            }
        } catch (error) {
            console.error("マイページ情報の取得エラー:", error);
            showProfileError();
        }
    }

    async function logout() {
        const confirmed = window.confirm("ログアウトしますか？");

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                console.warn("ログアウトレスポンスはJSONではありませんでした");
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "ログアウトに失敗しました"
                );
            }

            window.location.href = "/";
        } catch (error) {
            console.error("ログアウトエラー:", error);
            alert("ログアウトに失敗しました。もう一度お試しください。");
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    loadMyPage();
});