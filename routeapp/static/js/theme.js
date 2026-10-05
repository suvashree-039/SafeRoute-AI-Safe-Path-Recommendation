document.addEventListener("DOMContentLoaded", function () {

    const themeButton = document.getElementById("themeBtn");

    if (!themeButton) {
        console.log("Theme button not found");
        return;
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("safepath-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    updateIcon();

    // Theme button click
    themeButton.addEventListener("click", function () {

        document.body.classList.toggle("light-mode");

        const isLight =
            document.body.classList.contains("light-mode");

        localStorage.setItem(
            "safepath-theme",
            isLight ? "light" : "dark"
        );

        updateIcon();
    });

    function updateIcon() {

        const icon = themeButton.querySelector("i");

        if (!icon) {
            return;
        }

        if (document.body.classList.contains("light-mode")) {

            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");

        } else {

            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    }

});