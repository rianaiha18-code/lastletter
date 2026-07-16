document.addEventListener("DOMContentLoaded", () => {
    const codeInput = document.getElementById("code");
    const enterButton = document.getElementById("enterDemoButton");

    if (!enterButton) {
        console.error("入るボタンが見つかりません");
        return;
    }

    enterButton.onclick = async () => {
        const accessCode = codeInput.value.trim();

        if (!accessCode) {
            alert("アクセスコードを入力してください");
            return;
        }

        enterButton.disabled = true;
        enterButton.textContent = "確認中...";

        try {
            const response = await fetch("/api/demo-access", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    accessCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "アクセス認証に失敗しました"
                );
            }

            location.href = "/auth/login.html";
        } catch (error) {
            console.error("デモ認証エラー:", error);
            alert(error.message);
        } finally {
            enterButton.disabled = false;
            enterButton.textContent = "入る";
        }
    };

    codeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            enterButton.click();
        }
    });
});