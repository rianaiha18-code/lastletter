document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const deleteAccountButton =
        document.getElementById("deleteAccountButton");

    if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", () => {
            alert("アカウント削除機能は現在準備中です。");
        });
    }
});