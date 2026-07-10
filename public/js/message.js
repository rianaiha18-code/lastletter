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

    let people = JSON.parse(localStorage.getItem("people")) || [
        { name: "お母さん", relation: "家族", keyword: "", message: "", icon: "👩", code: generateCode() },
        { name: "お兄ちゃん", relation: "家族", keyword: "", message: "", icon: "👨", code: generateCode() },
        { name: "美咲", relation: "親友",keyword: "", message: "", icon: "😊", code: generateCode() }
    ];
    people = people.map(person => {
    if (!person.code) {
        person.code = generateCode();
    }
    return person;
});

savePeople();

    overallMessage.value = localStorage.getItem("overallMessage") || "";

    function generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code.slice(0, 4) + "-" + code.slice(4);
    }

    function savePeople() {
        localStorage.setItem("people", JSON.stringify(people));
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
            modalKeyword.value = people[index].keyword || "";
            modalMessage.value = people[index].message || "";
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

    renderPeople();

    addButton.onclick = () => {
        openModal();
    };

    cancelButton.onclick = () => {
        closeModal();
    };

    savePersonButton.onclick = () => {
        const name = modalName.value.trim();
        const relation = modalRelation.value.trim();
        const keyword = modalKeyword.value.trim();
        const message = modalMessage.value.trim();

        if (name === "" || relation === "" || keyword === "") {
            alert("名前・関係・合言葉を入力してください");
            return;
        }

        if (editIndex === null) {
            people.push({
                name,
                relation,
                keyword,
                message,
                icon: "😊",
                code: generateCode()
            });

            showToast("✔ 追加しました");
        } else {
            people[editIndex].name = name;
            people[editIndex].relation = relation;
            people[editIndex].keyword = keyword;
            people[editIndex].message = message;

            showToast("✔ 更新しました");
        }

        savePeople();
        renderPeople();
        closeModal();
    };

    deletePersonButton.onclick = () => {
        if (editIndex === null) return;

        const isDelete = confirm(`${people[editIndex].name}さんを削除しますか？`);

        if (!isDelete) return;

        people.splice(editIndex, 1);

        savePeople();
        renderPeople();
        closeModal();

        showToast("✔ 削除しました");
    };

    saveButton.onclick = () => {
        localStorage.setItem("overallMessage", overallMessage.value);

        savePeople();
        showToast("✔ 保存しました");
    };
});