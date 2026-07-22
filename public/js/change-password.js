document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();

    const user = await checkLogin();

    if (!user) {
        return;
    }

    const form =
        document.getElementById("changePasswordForm");

    const currentPassword =
        document.getElementById("currentPassword");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const errorMessage =
        document.getElementById("passwordError");

    const submitButton =
        document.getElementById("changePasswordButton");

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
        }, 2500);
    }


    document
        .querySelectorAll(".password-toggle-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                if (!input) {
                    return;
                }

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword ? "text" : "password";

                button.innerHTML = `
                    <i data-lucide="${
                        isPassword ? "eye-off" : "eye"
                    }"></i>
                `;

                button.setAttribute(
                    "aria-label",
                    isPassword
                        ? "パスワードを隠す"
                        : "パスワードを表示"
                );

                lucide.createIcons();
            });
        });


    form.addEventListener("submit", async event => {
        event.preventDefault();

        clearError();

        const currentValue =
            currentPassword.value.trim();

        const newValue =
            newPassword.value.trim();

        const confirmValue =
            confirmPassword.value.trim();


        if (!currentValue || !newValue || !confirmValue) {
            showError("すべての項目を入力してください。");
            return;
        }


        if (newValue.length < 8) {
            showError(
                "新しいパスワードは8文字以上で入力してください。"
            );
            return;
        }


        if (newValue !== confirmValue) {
            showError(
                "新しいパスワードが一致していません。"
            );
            return;
        }


        if (currentValue === newValue) {
            showError(
                "現在とは異なるパスワードを設定してください。"
            );
            return;
        }


        submitButton.disabled = true;
        submitButton.textContent = "変更中...";


        try {
            const response =
                await fetch("/api/change-password", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        currentPassword: currentValue,
                        newPassword: newValue
                    })
                });


            const data =
                await response.json();


            if (response.status === 401) {
                location.href = "/";
                return;
            }


            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "パスワードの変更に失敗しました。"
                );
            }


            form.reset();

            showToast(
                "パスワードを変更しました"
            );


            setTimeout(() => {
                location.href = "/setting.html";
            }, 1200);

        } catch (error) {
            console.error(
                "パスワード変更エラー:",
                error
            );

            showError(
                error.message ||
                "パスワードの変更に失敗しました。"
            );

        } finally {
            submitButton.disabled = false;
            submitButton.textContent =
                "パスワードを変更";
        }
    });
});