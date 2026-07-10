document.addEventListener("DOMContentLoaded", () => {
    const openLetterButton = document.getElementById("openLetterButton");
    const letterIntro = document.getElementById("letterIntro");
    const letterContent = document.getElementById("letterContent");

    const viewOverallMessage = document.getElementById("viewOverallMessage");
    const viewPersonMessages = document.getElementById("viewPersonMessages");

    const overallMessage = localStorage.getItem("overallMessage") || "まだメッセージは登録されていません。";
    const people = JSON.parse(localStorage.getItem("people")) || [];
    const targetCode = localStorage.getItem("viewTargetCode");

    const targetPerson = people.find(person => person.code === targetCode);

    viewOverallMessage.textContent = overallMessage;

    viewPersonMessages.innerHTML = "";

    if (targetPerson && targetPerson.message) {
        const card = document.createElement("div");
        card.className = "person-letter-card";

        card.innerHTML = `
            <h3>${targetPerson.name}さんへ</h3>
            <p>${targetPerson.message}</p>
        `;

        viewPersonMessages.appendChild(card);
    } else {
        viewPersonMessages.innerHTML = `
            <div class="person-letter-card">
                <p>あなた宛ての個別メッセージは登録されていません。</p>
            </div>
        `;
    }

    openLetterButton.onclick = () => {
        letterIntro.style.display = "none";
        letterContent.classList.add("show");
    };
});