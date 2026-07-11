async function checkLogin() {

    try {

        const response = await fetch("/api/me");

        if (!response.ok) {
            location.href = "/auth/login.html";
            return null;
        }

        const data = await response.json();

        return data;

    } catch (error) {

        location.href = "/auth/login.html";
        return null;

    }

}