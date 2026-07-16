document.addEventListener("DOMContentLoaded", async () => {
    const allowed = await checkDemoAccess();

    if (!allowed) {
        return;
    }

    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!loginButton || !emailInput || !passwordInput) {
        console.error("ログイン画面の要素が見つかりません");
        return;
    }

    loginButton.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("メールアドレスとパスワードを入力してください");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "ログイン中...";

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "ログインに失敗しました"
                );
            }

            location.href = "/home/home.html";
        } catch (error) {
            console.error("ログインエラー:", error);
            alert(error.message);
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "ログイン";
        }
    };

    passwordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            loginButton.click();
        }
    });
});