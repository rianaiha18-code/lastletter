document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const form =
        document.getElementById("forgotPasswordForm");

    const emailInput =
        document.getElementById("resetEmail");

    const errorMessage =
        document.getElementById("resetError");

    const sendButton =
        document.getElementById("sendResetButton");

    const toast =
        document.getElementById("toast");


    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
    }


    function clearError() {
        errorMessage.textContent = "";
        errorMessage.hidden = true;
    }


    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }


    form.addEventListener("submit", event => {
        event.preventDefault();

        clearError();

        const email =
            emailInput.value.trim();


        if (!email) {
            showError(
                "メールアドレスを入力してください。"
            );
            return;
        }


        if (!emailInput.validity.valid) {
            showError(
                "正しいメールアドレスを入力してください。"
            );
            return;
        }


        sendButton.disabled = true;
        sendButton.textContent = "確認中...";


        setTimeout(() => {
            showToast(
                "メール送信機能は現在開発中です"
            );

            sendButton.disabled = false;
            sendButton.textContent =
                "確認メールを送信";
        }, 500);
    });
});