document.addEventListener("DOMContentLoaded", () => {
    const openLetterButton = document.getElementById("openLetterButton");
    const letterIntro = document.getElementById("letterIntro");
    const letterContent = document.getElementById("letterContent");

    const viewOverallMessage =
        document.getElementById("viewOverallMessage");

    const viewPersonMessages =
        document.getElementById("viewPersonMessages");

    const savedRecipient =
        sessionStorage.getItem("viewRecipient");

    if (!savedRecipient) {
        alert("閲覧情報がありません。閲覧コードを入力してください。");
        location.href = "/receive.html";
        return;
    }

    const recipient = JSON.parse(savedRecipient);

    viewOverallMessage.textContent =
        recipient.overallMessage ||
        "全体へのメッセージは登録されていません。";

    viewPersonMessages.innerHTML = "";

    const card = document.createElement("div");
    card.className = "person-letter-card";

    card.innerHTML = `
        <h3>${recipient.name}さんへ</h3>
        <p>${
            recipient.message ||
            "あなた宛ての個別メッセージは登録されていません。"
        }</p>
    `;

    viewPersonMessages.appendChild(card);

    openLetterButton.onclick = () => {
        letterIntro.style.display = "none";
        letterContent.classList.add("show");
    };
});