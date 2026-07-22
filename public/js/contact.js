document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const contactList = document.getElementById("contactList");
    const addButton = document.getElementById("addContactButton");
    const saveButton = document.getElementById("saveContactButton");
    const toast = document.getElementById("toast");

    // -----------------------
    // トースト
    // -----------------------

    function showToast(message) {

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);

    }

    // -----------------------
    // 入力欄生成
    // -----------------------

    function createContact(contact = {}) {

        const div = document.createElement("div");
        div.className = "contact-card";

        div.innerHTML = `
            <label>名前</label>
            <input
                type="text"
                class="contact-name"
                value="${contact.name ?? ""}"
                placeholder="例）山田 太郎"
            >

            <label>関係</label>
            <input
                type="text"
                class="contact-relation"
                value="${contact.relation ?? ""}"
                placeholder="例）母・親友"
            >

            <label>電話番号</label>
            <input
                type="text"
                class="contact-phone"
                value="${contact.phone ?? ""}"
                placeholder="090-1234-5678"
            >

            <label>メールアドレス</label>
            <input
                type="email"
                class="contact-email"
                value="${contact.email ?? ""}"
                placeholder="sample@example.com"
            >

            <label>Instagram</label>
            <input
                type="text"
                class="contact-instagram"
                value="${contact.instagram ?? ""}"
                placeholder="@username"
            >

            <label>その他SNS</label>
            <input
                type="text"
                class="contact-sns"
                value="${contact.sns ?? ""}"
                placeholder="LINE・Xなど"
            >

            <label>メモ</label>
            <textarea
                class="contact-memo"
                placeholder="メモ"
            >${contact.memo ?? ""}</textarea>

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

    // -----------------------
    // 追加
    // -----------------------

    addButton.addEventListener("click", () => {

        contactList.appendChild(createContact());

    });

    // -----------------------
    // 取得
    // -----------------------

    function collectContacts() {

        const contacts = [];

        document
            .querySelectorAll(".contact-card")
            .forEach(card => {

                contacts.push({

                    name: card.querySelector(".contact-name").value,

                    relation: card.querySelector(".contact-relation").value,

                    phone: card.querySelector(".contact-phone").value,

                    email: card.querySelector(".contact-email").value,

                    instagram: card.querySelector(".contact-instagram").value,

                    sns: card.querySelector(".contact-sns").value,

                    memo: card.querySelector(".contact-memo").value

                });

            });

        return contacts;

    }

    // -----------------------
    // 描画
    // -----------------------

    function renderContacts(contacts) {

        contactList.innerHTML = "";

        if (!contacts.length) {

            contactList.appendChild(createContact());
            return;

        }

        contacts.forEach(contact => {

            contactList.appendChild(createContact(contact));

        });

    }

    // -----------------------
    // 読み込み
    // -----------------------

    async function loadContacts() {

        try {

            const response =
                await fetch("/api/contacts");

            if (response.status === 401) {

                window.location.href = "/login/login.html";
                return;

            }

            const data =
                await response.json();

            renderContacts(data.contacts || []);

        } catch (error) {

            console.error(error);

            renderContacts([]);

        }

    }

    // -----------------------
    // 保存
    // -----------------------

    saveButton.addEventListener("click", async () => {

        const originalText =
            saveButton.textContent;

        saveButton.disabled = true;
        saveButton.textContent = "保存中...";

        try {

            const contacts =
                collectContacts();

            const response =
                await fetch("/api/contacts", {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        contacts
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

            await loadContacts();

        } catch (error) {

            console.error(error);

            showToast("保存に失敗しました");

        } finally {

            saveButton.disabled = false;
            saveButton.textContent =
                originalText;

        }

    });

    loadContacts();

});