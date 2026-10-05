/* =========================================================
   SAFEPATH - FRONTEND DATA
   ========================================================= */

const SafePathData = {

    /* =========================
       PROJECT STATISTICS
       ========================= */

    statistics: {

        totalRoadSegments: 15627,

        averageSafetyScore: 48.27,

        verySafe: 1285,

        safe: 6525,

        moderate: 5371,

        highRisk: 2446

    },


    /* =========================
       SAFETY CATEGORIES
       ========================= */

    safetyCategories: {

        "Very Safe": 1285,

        "Safe": 6525,

        "Moderate": 5371,

        "High Risk": 2446

    },


    /* =========================
       SAFETY SCORE RANGE
       ========================= */

    safetyRange: {

        minimum: 5.39,

        maximum: 80.58,

        average: 48.27

    },


    /* =========================
       ML INFORMATION
       ========================= */

    machineLearning: {

        algorithm: "Random Forest",

        trees: 100,

        trainingSplit: "80/20",

        features: 12,

        classes: 4,

        target: "Safety Category"

    },


    /* =========================
       SAFETY SCORE WEIGHTS
       ========================= */

    safetyWeights: {

        cctv: 30,

        streetLights: 30,

        police: 25,

        hospitals: 15

    },


    /* =========================
       CRIME CONTEXT
       ========================= */

    crimeContext: {

        source: "Odisha crime context",

        riskPercentage: 73.03,

        safetyPercentage: 26.97

    },


    /* =========================
       ROUTE INFORMATION
       ========================= */

    sampleRoute: {

        distanceKm: 1.45,

        averageSafety: 73.48,

        facilitySafety: 85.11,

        category: "Very Safe",

        routeQuality: "Excellent",

        improvement: 25.21

    },


    /* =========================
       COMMON PLACES
       ========================= */

    places: [

        "Bhubaneswar",

        "Cuttack",

        "Bhubaneswar Railway Station",

        "Biju Patnaik International Airport",

        "KIIT University",

        "NIELIT Bhubaneswar",

        "Kalinga Stadium",

        "Master Canteen",

        "Jaydev Vihar",

        "Patia",

        "Saheed Nagar",

        "Rasulgarh",

        "Chandrasekharpur",

        "Khandagiri",

        "Baramunda",

        "Old Town Bhubaneswar",

        "Cuttack Railway Station",

        "SCB Medical College Cuttack"

    ]

};


/* =========================
   GLOBAL ACCESS
   ========================= */

window.SafePathData = SafePathData;


console.log(
    "SafePath frontend data loaded successfully."
);