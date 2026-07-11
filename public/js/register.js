document.addEventListener("DOMContentLoaded", () => {
    const registerButton =
        document.getElementById("registerButton");

    const usernameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    if (!registerButton) {
        console.error("登録ボタンが見つかりません");
        return;
    }

    registerButton.onclick = async () => {
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            alert("すべての項目を入力してください");
            return;
        }

        if (password !== confirmPassword) {
            alert("確認用パスワードが一致しません");
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = "登録中...";

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "新規登録に失敗しました"
                );
            }

            alert("新規登録が完了しました");

            location.href = "/home/home.html";
        } catch (error) {
            console.error("新規登録エラー:", error);
            alert(error.message);
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "登録する";
        }
    };
});