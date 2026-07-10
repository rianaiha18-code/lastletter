document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveFuneralButton");
    const toast = document.getElementById("toast");

    const inputs = document.querySelectorAll(
        ".funeral-form input, .funeral-form select, .funeral-form textarea"
    );

    // 保存済みデータを読み込む
    const savedData = JSON.parse(localStorage.getItem("funeralRequest")) || {};

    inputs.forEach((input, index) => {
        if (savedData[index] !== undefined) {
            input.value = savedData[index];
        }
    });

    saveButton.onclick = () => {
        const funeralData = {};

        inputs.forEach((input, index) => {
            funeralData[index] = input.value;
        });

        localStorage.setItem("funeralRequest", JSON.stringify(funeralData));

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    };
});