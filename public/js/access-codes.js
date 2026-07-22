document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const accessCodeList =
        document.getElementById("accessCodeList");

    const emptyState =
        document.getElementById("emptyAccessCodes");

    const toast =
        document.getElementById("toast");


    function showToast(message) {

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);

    }


    function escapeHtml(value = "") {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    async function copyCode(code) {

        try {

            await navigator.clipboard.writeText(code);

            showToast("閲覧コードをコピーしました");

        } catch (error) {

            console.error(
                "閲覧コードのコピーエラー:",
                error
            );

            // Clipboard APIが使えない場合の予備処理
            const textarea =
                document.createElement("textarea");

            textarea.value = code;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            const copied =
                document.execCommand("copy");

            textarea.remove();

            if (copied) {
                showToast("閲覧コードをコピーしました");
            } else {
                showToast("コピーに失敗しました");
            }

        }

    }


    function createAccessCodeCard(item) {

        const card =
            document.createElement("div");

        card.className = "access-code-card";

        const name =
            escapeHtml(item.name || "名前未設定");

        const relation =
            escapeHtml(item.relation || "");

        const code =
            String(item.view_code || "").trim();

        card.innerHTML = `
            <div class="access-code-person">
                <i data-lucide="user-round"></i>

                <div>
                    <h2>${name}</h2>

                    ${
                        relation
                            ? `<p class="access-code-relation">${relation}</p>`
                            : ""
                    }
                </div>
            </div>

            <p class="access-code-label">
                閲覧コード
            </p>

            <div class="access-code-row">

                <p class="access-code-value">
                    ${escapeHtml(code)}
                </p>

                <button
                    type="button"
                    class="copy-code-button"
                >
                    コピー
                </button>

            </div>
        `;

        const copyButton =
            card.querySelector(".copy-code-button");

        copyButton.addEventListener("click", () => {

            if (!code) {
                showToast("閲覧コードがありません");
                return;
            }

            copyCode(code);

        });

        return card;

    }


    function renderAccessCodes(codes) {

        accessCodeList.innerHTML = "";

        if (!Array.isArray(codes) || codes.length === 0) {

            emptyState.hidden = false;
            lucide.createIcons();

            return;

        }

        emptyState.hidden = true;

        codes.forEach(item => {

            accessCodeList.appendChild(
                createAccessCodeCard(item)
            );

        });

        lucide.createIcons();

    }


    async function loadAccessCodes() {

        try {

            const response =
                await fetch("/api/access-codes");

            if (response.status === 401) {

                window.location.href =
                    "/login/login.html";

                return;

            }

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "閲覧コードの取得に失敗しました"
                );

            }

            renderAccessCodes(
                data.codes || []
            );

        } catch (error) {

            console.error(
                "閲覧コード一覧の取得エラー:",
                error
            );

            accessCodeList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="circle-alert"></i>
                    <p>
                        閲覧コードを読み込めませんでした。
                    </p>
                </div>
            `;

            emptyState.hidden = true;

            lucide.createIcons();

        }

    }


    loadAccessCodes();

});