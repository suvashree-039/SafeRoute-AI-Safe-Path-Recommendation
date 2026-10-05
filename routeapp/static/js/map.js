/* =========================================================
   SAFEPATH - SAFETY MAP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const mapElement = document.getElementById("safetyMap");

    if (!mapElement) {
        console.log("Safety map element not found.");
        return;
    }

    /* =========================
       CREATE MAP
       ========================= */

    const map = L.map("safetyMap").setView(
        [20.2961, 85.8245],
        13
    );


    /* =========================
       ESRI STREET MAP
       ========================= */

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
            attribution:
                "Tiles &copy; Esri &mdash; OpenStreetMap contributors",
            maxZoom: 19
        }
    ).addTo(map);


    /* =========================
       SAFETY COLORS
       ========================= */

    function getSafetyColor(score) {

        score = Number(score);

        if (score >= 70) {
            return "#16a34a";       // Very Safe
        }

        if (score >= 50) {
            return "#22c55e";       // Safe
        }

        if (score >= 30) {
            return "#f59e0b";       // Moderate
        }

        return "#ef4444";           // High Risk
    }


    /* =========================
       SAFETY CATEGORY
       ========================= */

    function getSafetyCategory(score) {

        score = Number(score);

        if (score >= 70) {
            return "Very Safe";
        }

        if (score >= 50) {
            return "Safe";
        }

        if (score >= 30) {
            return "Moderate";
        }

        return "High Risk";
    }


    /* =========================
       LOAD ROAD DATA
       ========================= */

    fetch("/safety-map-data/")
        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Unable to load safety map data."
                );
            }

            return response.json();

        })
        .then(function (geojson) {

            console.log(
                "Safety map data loaded:",
                geojson
            );


            /* =========================
               ROAD LAYER
               ========================= */

            const roadLayer = L.geoJSON(
                geojson,
                {

                    style: function (feature) {

                        const score =
                            feature.properties.safety_score || 0;

                        return {
                            color: getSafetyColor(score),
                            weight: 3,
                            opacity: 0.85
                        };

                    },


                    onEachFeature:
                        function (feature, layer) {

                            const p =
                                feature.properties || {};

                            const score =
                                Number(
                                    p.safety_score || 0
                                );

                            const category =
                                p.safety_category ||
                                getSafetyCategory(score);


                            /* =========================
                               POPUP
                               ========================= */

                            const popup = `
                                <div style="
                                    min-width:220px;
                                    font-family:Arial,sans-serif;
                                ">

                                    <h3 style="
                                        margin:0 0 10px;
                                    ">
                                        🛡️ SafePath Road
                                    </h3>

                                    <b>Road ID:</b>
                                    ${p.road_id ?? "N/A"}
                                    <br><br>

                                    <b>Safety Score:</b>
                                    ${score.toFixed(2)}
                                    <br><br>

                                    <b>Category:</b>
                                    ${category}
                                    <br><br>

                                    <b>Road Length:</b>
                                    ${Number(
                                        p.road_length_m || 0
                                    ).toFixed(2)} m
                                    <br><br>

                                    <b>Nearest Hospital:</b>
                                    ${Number(
                                        p.nearest_hospital_distance_m || 0
                                    ).toFixed(2)} m
                                    <br><br>

                                    <b>Nearest Police:</b>
                                    ${Number(
                                        p.nearest_police_distance_m || 0
                                    ).toFixed(2)} m
                                    <br><br>

                                    <b>Nearest CCTV:</b>
                                    ${Number(
                                        p.nearest_cctv_distance_m || 0
                                    ).toFixed(2)} m
                                    <br><br>

                                    <b>Nearest Street Light:</b>
                                    ${Number(
                                        p.nearest_street_light_distance_m || 0
                                    ).toFixed(2)} m

                                </div>
                            `;

                            layer.bindPopup(popup);


                            /* =========================
                               HOVER EFFECT
                               ========================= */

                            layer.on(
                                "mouseover",
                                function () {

                                    this.setStyle({
                                        weight: 6,
                                        opacity: 1
                                    });

                                }
                            );


                            layer.on(
                                "mouseout",
                                function () {

                                    this.setStyle({
                                        weight: 3,
                                        opacity: 0.85
                                    });

                                }
                            );

                        }

                }
            ).addTo(map);


            /* =========================
               FIT MAP TO ROADS
               ========================= */

            if (roadLayer.getBounds().isValid()) {

                map.fitBounds(
                    roadLayer.getBounds(),
                    {
                        padding: [20, 20]
                    }
                );

            }

        })
        .catch(function (error) {

            console.error(
                "Safety map error:",
                error
            );

        });


    /* =========================
       MAP CONTROLS
       ========================= */

    L.control.scale({
        imperial: false
    }).addTo(map);


    console.log(
        "SafePath Safety Map initialized."
    );

});