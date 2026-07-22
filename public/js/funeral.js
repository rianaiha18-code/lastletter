document.addEventListener("DOMContentLoaded", async () => {

    await checkLogin();

    const saveButton = document.getElementById("saveFuneralButton");
    const toast = document.getElementById("toast");

    const ceremonyType = document.getElementById("ceremonyType");
    const funeralScale = document.getElementById("funeralScale");
    const funeralPhoto = document.getElementById("funeralPhoto");
    const coffinItems = document.getElementById("coffinItems");
    const bgmSong = document.getElementById("bgmSong");
    const bgmArtist = document.getElementById("bgmArtist");
    const bgmReason = document.getElementById("bgmReason");
    const ashesDestination = document.getElementById("ashesDestination");
    const keepItems = document.getElementById("keepItems");
    const discardItems = document.getElementById("discardItems");
    const familyMessage = document.getElementById("familyMessage");
    const photoInput = document.getElementById("funeralPhoto");
    const photoPreview = document.getElementById("photoPreview");

    if (!saveButton) {
        console.error("保存ボタンが見つかりません");
        return;
    }

    function showToast(text) {
        if (!toast) {
            alert(text);
            return;
        }

        toast.textContent = text;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    async function loadFuneralRequest() {
        try {
            const response = await fetch("/api/funeral-request");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            if (!data.funeralRequest) return;

            const saved = data.funeralRequest;

            if (ceremonyType) ceremonyType.value = saved.ceremonyType || "";
            if (funeralScale) funeralScale.value = saved.funeralScale || "";
            if (coffinItems) coffinItems.value = saved.coffinItems || "";
            if (bgmSong) bgmSong.value = saved.bgmSong || "";
            if (bgmArtist) bgmArtist.value = saved.bgmArtist || "";
            if (bgmReason) bgmReason.value = saved.bgmReason || "";
            if (ashesDestination) ashesDestination.value = saved.ashesDestination || "";
            if (keepItems) keepItems.value = saved.keepItems || "";
            if (discardItems) discardItems.value = saved.discardItems || "";
            if (familyMessage) familyMessage.value = saved.familyMessage || "";
        } catch (error) {
            console.error("葬儀リクエスト取得エラー:", error);
            showToast("読み込みに失敗しました");
        }
    }

    saveButton.onclick = async () => {
        try {
            const selectedPhoto =
                funeralPhoto && funeralPhoto.files.length > 0
                    ? funeralPhoto.files[0].name
                    : "";

            const response = await fetch("/api/funeral-request", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ceremonyType: ceremonyType?.value || "",
                    funeralScale: funeralScale?.value || "",
                    funeralPhoto: selectedPhoto,
                    coffinItems: coffinItems?.value || "",
                    bgmSong: bgmSong?.value || "",
                    bgmArtist: bgmArtist?.value || "",
                    bgmReason: bgmReason?.value || "",
                    ashesDestination: ashesDestination?.value || "",
                    keepItems: keepItems?.value || "",
                    discardItems: discardItems?.value || "",
                    familyMessage: familyMessage?.value || ""
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "保存に失敗しました");
            }

            showToast("✔ 葬儀リクエストを保存しました");
        } catch (error) {
            console.error("葬儀リクエスト保存エラー:", error);
            showToast(error.message || "保存に失敗しました");
        }
    };
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        if (!file) return;

        photoPreview.src = URL.createObjectURL(file);
        photoPreview.style.display = "block";
    });
    loadFuneralRequest();
});