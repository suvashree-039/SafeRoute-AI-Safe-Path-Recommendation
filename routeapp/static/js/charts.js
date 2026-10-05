/* =========================================================
   SAFEPATH - DASHBOARD CHARTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       CATEGORY DATA
       ========================= */

    const categoryData = {
        "Very Safe": 1285,
        "Safe": 6525,
        "Moderate": 5371,
        "High Risk": 2446
    };


    /* =========================
       CREATE CATEGORY CHART
       ========================= */

    const categoryChart =
        document.getElementById("categoryChart");

    if (categoryChart && typeof Chart !== "undefined") {

        new Chart(categoryChart, {

            type: "bar",

            data: {
                labels: Object.keys(categoryData),

                datasets: [{
                    label: "Road Segments",
                    data: Object.values(categoryData),
                    borderWidth: 1
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    },

                    tooltip: {
                        enabled: true
                    }

                },

                scales: {

                    y: {
                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }
                    }

                }

            }

        });

    }


    /* =========================
       SAFETY SCORE CHART
       ========================= */

    const safetyChart =
        document.getElementById("safetyChart");

    if (safetyChart && typeof Chart !== "undefined") {

        new Chart(safetyChart, {

            type: "doughnut",

            data: {

                labels: [
                    "Very Safe",
                    "Safe",
                    "Moderate",
                    "High Risk"
                ],

                datasets: [{

                    data: [
                        1285,
                        6525,
                        5371,
                        2446
                    ],

                    borderWidth: 1

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        });

    }


    /* =========================
       SAFETY SCORE DISTRIBUTION
       ========================= */

    const scoreChart =
        document.getElementById("scoreChart");

    if (scoreChart && typeof Chart !== "undefined") {

        new Chart(scoreChart, {

            type: "bar",

            data: {

                labels: [
                    "0–20",
                    "20–30",
                    "30–40",
                    "40–50",
                    "50–60",
                    "60–70",
                    "70–80",
                    "80–100"
                ],

                datasets: [{

                    label: "Road Segments",

                    data: [
                        0,
                        2446,
                        2500,
                        3000,
                        4000,
                        1650,
                        1285,
                        746
                    ],

                    borderWidth: 1

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        });

    }


    console.log(
        "SafePath dashboard charts loaded."
    );

});