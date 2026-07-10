document.addEventListener("DOMContentLoaded", () => {
    const requestButton = document.getElementById("requestButton");
    const viewCode = document.getElementById("viewCode");
    const viewKeyword = document.getElementById("viewKeyword");
    const toast = document.getElementById("toast");

    requestButton.onclick = () => {
        const inputCode = viewCode.value.trim();
        const inputKeyword = viewKeyword.value.trim();

        if (!inputCode || !inputKeyword) {
            alert("閲覧コードと合言葉を入力してください");
            return;
        }

        const people = JSON.parse(localStorage.getItem("people")) || [];

        const targetPerson = people.find(person =>
            person.code === inputCode &&
            person.keyword === inputKeyword
        );

        if (!targetPerson) {
            alert("閲覧コードまたは合言葉が違います");
            return;
        }

        localStorage.setItem("viewTargetCode", inputCode);

        toast.classList.add("show");

        setTimeout(() => {
            location.href = "/view.html";
        }, 1200);
    };
});