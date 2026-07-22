document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const trustedList =
        document.getElementById("trustedList");

    const addButton =
        document.getElementById("addTrustedButton");

    const saveButton =
        document.getElementById("saveTrustedButton");

    const sendButton =
        document.getElementById("sendCodesButton");

    const toast =
        document.getElementById("toast");

    // --------------------
    // トースト
    // --------------------

    function showToast(message) {

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);

    }

    // --------------------
    // 入力欄生成
    // --------------------

    function createTrusted(person = {}) {

        const div =
            document.createElement("div");

        div.className = "contact-card";

        div.innerHTML = `

            <label>名前</label>
            <input
                type="text"
                class="trusted-name"
                placeholder="例）山田 花子"
                value="${person.name ?? ""}"
            >

            <label>関係</label>
            <input
                type="text"
                class="trusted-relation"
                placeholder="例）母・親友"
                value="${person.relation ?? ""}"
            >

            <label>メールアドレス</label>
            <input
                type="email"
                class="trusted-email"
                placeholder="sample@example.com"
                value="${person.email ?? ""}"
            >

            <button
                type="button"
                class="delete-button"
            >
                削除
            </button>

        `;

        div.querySelector(".delete-button")
            .addEventListener("click", () => {

                if (confirm("削除しますか？")) {
                    div.remove();
                }

            });

        return div;

    }

    // --------------------
    // 追加
    // --------------------

    addButton.addEventListener("click", () => {

        trustedList.appendChild(
            createTrusted()
        );

    });

    // --------------------
    // データ取得
    // --------------------

    function collectTrusted() {

        const people = [];

        document
            .querySelectorAll(".contact-card")
            .forEach(card => {

                people.push({

                    name:
                        card.querySelector(".trusted-name").value,

                    relation:
                        card.querySelector(".trusted-relation").value,

                    email:
                        card.querySelector(".trusted-email").value

                });

            });

        return people;

    }

    // --------------------
    // 描画
    // --------------------

    function renderTrusted(people) {

        trustedList.innerHTML = "";

        if (!people.length) {

            trustedList.appendChild(
                createTrusted()
            );

            return;

        }

        people.forEach(person => {

            trustedList.appendChild(
                createTrusted(person)
            );

        });

    }

    // --------------------
    // 読み込み
    // --------------------

    async function loadTrusted() {

        try {

            const response =
                await fetch("/api/trusted");

            if (response.status === 401) {

                window.location.href =
                    "/login/login.html";

                return;

            }

            const data =
                await response.json();

            renderTrusted(
                data.trusted || []
            );

        } catch (error) {

            console.error(error);

            renderTrusted([]);

        }

    }

    // --------------------
    // 保存
    // --------------------

    saveButton.addEventListener("click", async () => {

        const original =
            saveButton.textContent;

        saveButton.disabled = true;
        saveButton.textContent = "保存中...";

        try {

            const trusted =
                collectTrusted();

            const response =
                await fetch("/api/trusted", {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        trusted
                    })

                });

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }

            showToast("保存しました✨");

            await loadTrusted();

        } catch (error) {

            console.error(error);

            showToast("保存に失敗しました");

        } finally {

            saveButton.disabled = false;
            saveButton.textContent =
                original;

        }

    });

    // --------------------
    // メール送信
    // --------------------

    sendButton.addEventListener("click", () => {

        showToast("メール送信機能は現在開発中です📨");

    });

    loadTrusted();

});