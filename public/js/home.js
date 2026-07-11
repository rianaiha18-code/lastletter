document.addEventListener("DOMContentLoaded", async () => {
    const user = await checkLogin();

    if (!user) {
        return;
    }

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    if (!welcomeMessage) {
        console.error("welcomeMessageが見つかりません");
        return;
    }

    const hour = new Date().getHours();

    let greeting = "こんにちは";

    if (hour < 11) {
        greeting = "おはようございます";
    } else if (hour >= 18) {
        greeting = "こんばんは";
    }

    welcomeMessage.textContent =
        `${greeting}、${user.username}さん`;
});