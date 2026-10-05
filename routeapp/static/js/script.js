/* =========================================================
   SAFEPATH - MAIN WEBSITE SCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       NAVIGATION
       ========================= */

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            this.classList.add("active");

        });

    });



    /* =========================
       TOAST MESSAGE
       ========================= */

    window.showToast = function (message) {

        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toastMessage");

        if (!toast) {
            return;
        }

        if (toastMessage) {
            toastMessage.textContent = message;
        }

        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);

    };


    /* =========================
       GET STARTED BUTTON
       ========================= */

    const getStartedButtons =
        document.querySelectorAll(".primary-btn, .get-started-btn");

    getStartedButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const href = this.getAttribute("href");

            if (!href) {
                showToast("Let's find a safer route!");
            }

        });

    });


    /* =========================
       SCROLL EFFECT
       ========================= */

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", function () {

        if (!navbar) {
            return;
        }

        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });


    /* =========================
       SMOOTH SCROLL
       ========================= */

    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {

        anchor.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =========================
       CURRENT YEAR
       ========================= */

    const yearElements =
        document.querySelectorAll(".current-year");

    yearElements.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

   


    console.log("SafePath main script loaded successfully.");

});

// ==========================================
// SAFEPATH MOBILE MENU
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navMenu = document.getElementById("navMenu");

    if (mobileMenuBtn && navMenu) {

        mobileMenuBtn.addEventListener("click", function () {

            navMenu.classList.toggle("mobile-open");

        });

    }

});