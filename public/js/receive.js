document.addEventListener("DOMContentLoaded", () => {
    const requestButton = document.getElementById("requestButton");
    const viewCode = document.getElementById("viewCode");
    const viewKeyword = document.getElementById("viewKeyword");
    const toast = document.getElementById("toast");

    requestButton.onclick = async () => {
        const inputCode = viewCode.value.trim();
        const inputKeyword = viewKeyword.value.trim();

        if (!inputCode || !inputKeyword) {
            alert("閲覧コードと合言葉を入力してください");
            return;
        }

        try {
            const response = await fetch("/api/view-access", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    viewCode: inputCode,
                    keyword: inputKeyword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // 閲覧ページで使う情報を一時保存
            sessionStorage.setItem(
                "viewRecipient",
                JSON.stringify(data.recipient)
            );

            toast.textContent = "✔ 確認できました";
            toast.classList.add("show");

            setTimeout(() => {
                location.href = "/view.html";
            }, 1000);
        } catch (error) {
            console.error("閲覧確認エラー:", error);
            alert(error.message || "閲覧確認に失敗しました");
        }
    };
});