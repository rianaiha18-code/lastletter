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
    
    let currentPhotoUrl = "";

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
            currentPhotoUrl = saved.funeralPhoto || saved.photo || "";

            if (
    currentPhotoUrl &&
    /^https?:\/\//.test(currentPhotoUrl) &&
    photoPreview
) {
    photoPreview.src = currentPhotoUrl;
    photoPreview.hidden = false;
} else if (photoPreview) {
    currentPhotoUrl = "";
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
}

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
    const originalButtonText = saveButton.textContent;

    try {
        saveButton.disabled = true;
        saveButton.textContent = "保存中...";

        let photoUrl = currentPhotoUrl;

        const selectedFile =
            funeralPhoto && funeralPhoto.files.length > 0
                ? funeralPhoto.files[0]
                : null;

        // 新しい写真が選択されている場合だけCloudinaryへアップロード
        if (selectedFile) {
            saveButton.textContent = "画像をアップロード中...";
            photoUrl = await uploadFuneralPhoto(selectedFile);
        }

        saveButton.textContent = "保存中...";

        const response = await fetch("/api/funeral-request", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ceremonyType: ceremonyType?.value || "",
                funeralScale: funeralScale?.value || "",

                // ファイル名ではなくCloudinaryのURLを保存
                funeralPhoto: photoUrl || "",

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

        currentPhotoUrl = photoUrl || "";

        showToast("✔ 葬儀リクエストを保存しました");

    } catch (error) {
        console.error("葬儀リクエスト保存エラー:", error);
        showToast(error.message || "保存に失敗しました");

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = originalButtonText;
    }
};
if (photoInput && photoPreview) {
    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];

        if (!file) {
            photoPreview.removeAttribute("src");
            photoPreview.hidden = true;
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("画像ファイルを選択してください");
            photoInput.value = "";
            photoPreview.removeAttribute("src");
            photoPreview.hidden = true;
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        photoPreview.src = previewUrl;
        photoPreview.hidden = false;

        photoPreview.onload = () => {
            URL.revokeObjectURL(previewUrl);
        };
    });
}
    async function uploadFuneralPhoto(file) {
    if (!file) {
        return null;
    }

    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch("/api/funeral-photo", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "画像のアップロードに失敗しました");
    }

    return data.photoUrl;
}
    loadFuneralRequest();
});