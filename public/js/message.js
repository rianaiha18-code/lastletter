document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("personModal");
    const addButton = document.getElementById("addPersonButton");
    const cancelButton = document.getElementById("cancelButton");
    const savePersonButton = document.getElementById("savePersonButton");
    const deletePersonButton = document.getElementById("deletePersonButton");

    const personList = document.getElementById("personList");
    const saveButton = document.getElementById("saveButton");
    const toast = document.getElementById("toast");

    const modalName = document.getElementById("modalName");
    const modalRelation = document.getElementById("modalRelation");
    const modalKeyword = document.getElementById("modalKeyword"); 
    const modalMessage = document.getElementById("modalMessage");

    const overallMessage = document.getElementById("overallMessage");
    let editIndex = null;

    let people = [];

    function generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code.slice(0, 4) + "-" + code.slice(4);
    }

    async function loadPeople() {
        try {
            const response = await fetch("/api/recipients");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            people = data.recipients.map(person => ({
                id: person.id,
                name: person.name,
                relation: person.relation,
                keyword: "",
                message: person.message || "",
                icon: "😊",
                code: person.code
            }));

            renderPeople();
        } catch (error) {
            console.error("相手一覧取得エラー:", error);
            showToast("相手一覧を読み込めませんでした");
        }
    }

    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function resetModal() {
        modalName.value = "";
        modalRelation.value = "";
        modalKeyword.value = "";
        modalMessage.value = "";

        modalKeyword.disabled = false;
        modalKeyword.placeholder = "例）家族旅行";

        document.getElementById("keywordNote").textContent =
            "※ 合言葉は初回登録時のみ設定できます。忘れないように控えてください。";

        editIndex = null;
        deletePersonButton.style.display = "none";
    }

    function openModal(index = null) {
        if (index === null) {
            resetModal();
        } else {
            editIndex = index;

            modalName.value = people[index].name;
            modalRelation.value = people[index].relation;
            modalMessage.value = people[index].message || "";

            // 合言葉は再表示・変更しない
            modalKeyword.value = "";
            modalKeyword.disabled = true;
            modalKeyword.placeholder = "設定済み（変更できません）";

            document.getElementById("keywordNote").textContent =
                "※ 合言葉は登録済みです。変更する場合は、相手を削除して再登録してください。";

            deletePersonButton.style.display = "block";
        }

        modal.classList.add("show");
    }

    function closeModal() {
        modal.classList.remove("show");
        resetModal();
    }

    function renderPeople() {
        personList.innerHTML = "";

        people.forEach((person, index) => {
            const card = document.createElement("div");
            card.className = "person-card";

            const messageStatus = person.message ? "メッセージ登録済み" : "メッセージ未登録";

            card.innerHTML = `
                <div class="person-icon">${person.icon}</div>
                <div class="person-info">
                    <p class="person-name">${person.name}</p>
                    <p class="person-relation">${person.relation}・${messageStatus}</p>
                    <p class="person-code">閲覧コード：${person.code}</p>
                </div>
                <span class="person-arrow">›</span>
            `;

            card.onclick = () => {
                openModal(index);
            };

            personList.appendChild(card);
        });
    }

    addButton.onclick = () => {
        openModal();
    };

    cancelButton.onclick = () => {
        closeModal();
    };

    savePersonButton.onclick = async () => {
        const name = modalName.value.trim();
        const relation = modalRelation.value.trim();
        const keyword = modalKeyword.value.trim();
        const message = modalMessage.value.trim();

        const isNewRecipient = editIndex === null;

        if (!name || !relation) {
            alert("名前と関係を入力してください");
            return;
        }

        if (isNewRecipient && !keyword) {
            alert("合言葉を入力してください");
            return;
        }

        try {
            if (isNewRecipient) {
                const code = generateCode();

                const response = await fetch("/api/recipients", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        relation,
                        keyword,
                        message,
                        code
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "登録に失敗しました");
                }

                await loadPeople();
                closeModal();
                showToast("✔ 追加しました");
            } else {
                const recipient = people[editIndex];

                const response = await fetch(
                    `/api/recipients/${recipient.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name,
                            relation,
                            message
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "更新に失敗しました");
                }

                await loadPeople();
                closeModal();
                showToast("✔ 更新しました");
            }
        } catch (error) {
            console.error("相手保存エラー:", error);
            showToast(error.message || "保存に失敗しました");
        }
    };

    deletePersonButton.onclick = async () => {

        if (editIndex === null) return;

        const person = people[editIndex];

        const ok = confirm(`${person.name}さんを削除しますか？`);

        if (!ok) return;

        try {

            const response = await fetch(
                `/api/recipients/${person.id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            await loadPeople();

            closeModal();

            showToast("✔ 削除しました");

        } catch (error) {

            console.error(error);

            showToast("削除に失敗しました");

        }

    };

    saveButton.onclick = async () => {
        try {
            const response = await fetch("/api/message", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    overallMessage: overallMessage.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // 相手別データは、まだLocalStorageに保存

            showToast("✔ 保存しました");
        } catch (error) {
            console.error("全体メッセージ保存エラー:", error);
            showToast("保存に失敗しました");
        }
    };
    async function loadOverallMessage() {
        try {
            const response = await fetch("/api/message");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            overallMessage.value = data.overallMessage;
        } catch (error) {
            console.error("全体メッセージ取得エラー:", error);
            showToast("メッセージを読み込めませんでした");
        }
    }
    loadPeople();
    loadOverallMessage();
});