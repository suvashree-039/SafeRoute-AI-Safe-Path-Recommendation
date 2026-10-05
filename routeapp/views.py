from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import os
import json
import math
import joblib
import networkx as nx
import requests
from pyproj import Transformer


# ============================================================
# ML MODEL
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "safepath",
    "safepath_random_forest.pkl"
)

model = joblib.load(MODEL_PATH)


# ============================================================
# ROUTING GRAPH
# ============================================================

GRAPH_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "safepath",
    "safepath_route_graph.pkl"
)

route_graph = joblib.load(GRAPH_PATH)
print("\n************ SAFEPATH GRAPH DEBUG ************", flush=True)
print("GRAPH TYPE:", type(route_graph), flush=True)
print("GRAPH NODES:", route_graph.number_of_nodes(), flush=True)
print("GRAPH EDGES:", route_graph.number_of_edges(), flush=True)
print("GRAPH DIRECTED:", route_graph.is_directed(), flush=True)
print("GRAPH MULTIGRAPH:", route_graph.is_multigraph(), flush=True)
print("**********************************************\n", flush=True)


# TEST ONE GRAPH EDGE
sample_u, sample_v = next(iter(route_graph.edges()))

sample_data = route_graph.get_edge_data(
    sample_u,
    sample_v
)

print("\n************ EDGE DEBUG ************", flush=True)
print("SAMPLE U:", sample_u, flush=True)
print("SAMPLE V:", sample_v, flush=True)
print("EDGE DATA:", sample_data, flush=True)
print("****************************************\n", flush=True)

# ============================================================
# COORDINATE TRANSFORMERS
# ============================================================

to_utm = Transformer.from_crs(
    "EPSG:4326",
    "EPSG:32645",
    always_xy=True
)

to_wgs84 = Transformer.from_crs(
    "EPSG:32645",
    "EPSG:4326",
    always_xy=True
)


# ============================================================
# HOME
# ============================================================

def home(request):
    return render(request, "index.html")


# ============================================================
# MODEL STATUS
# ============================================================

def model_status(request):
    return JsonResponse({
        "status": "success",
        "message": "SafePath ML model loaded successfully",
        "model": type(model).__name__,
        "classes": model.classes_.tolist()
    })


# ============================================================
# ROUTING GRAPH STATUS
# ============================================================

def route_graph_status(request):
    return JsonResponse({
        "status": "success",
        "message": "SafePath routing graph loaded successfully",
        "nodes": route_graph.number_of_nodes(),
        "edges": route_graph.number_of_edges()
    })


# ============================================================
# PARSE LOCATION
# ============================================================

def parse_location(location_text):

    try:

        if not location_text:
            return None

        location_text = location_text.strip()

        parts = location_text.split(",")

        if len(parts) == 2:

            lat = float(parts[0].strip())
            lon = float(parts[1].strip())

            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lat, lon

    except (ValueError, AttributeError):
        pass

    return None


# ============================================================
# PLACE NAME GEOCODING
# ============================================================

def geocode_place(place_name):
    try:
        if not place_name:
            return None

        place_name = place_name.strip()

        url = "https://nominatim.openstreetmap.org/search"

        params = {
            "q": place_name,
            "format": "json",
            "limit": 1,
            "countrycodes": "in"
        }

        headers = {
            "User-Agent": "SafePath-Django-Project/1.0 (SafeRoute educational project)"
        }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=20
        )

        print("GEOCODING STATUS:", response.status_code, flush=True)
        print("GEOCODING QUERY:", place_name, flush=True)

        response.raise_for_status()

        results = response.json()

        print("GEOCODING RESULTS:", results, flush=True)

        if not results:
            return None

        lat = float(results[0]["lat"])
        lon = float(results[0]["lon"])

        return lat, lon

    except requests.exceptions.RequestException as e:
        print("GEOCODING REQUEST ERROR:", str(e), flush=True)
        return None

    except Exception as e:
        print("GEOCODING ERROR:", str(e), flush=True)
        return None
# ============================================================
# FIND NEAREST GRAPH NODE
# ============================================================

def nearest_graph_node(lat, lon):

    x, y = to_utm.transform(lon, lat)

    nearest_node = None
    nearest_distance = float("inf")

    for node, data in route_graph.nodes(data=True):

        node_x = data.get("x")
        node_y = data.get("y")

        if node_x is None or node_y is None:
            continue

        distance = math.sqrt(
            (node_x - x) ** 2 +
            (node_y - y) ** 2
        )

        if distance < nearest_distance:

            nearest_distance = distance
            nearest_node = node

    return nearest_node


# ============================================================
# SAFE ROUTE WEIGHT
# ============================================================

def safe_route_weight(u, v, data):

    # MultiGraph edge data is nested under the edge key
    if 0 in data and isinstance(data[0], dict):
        edge_data = data[0]
    else:
        edge_data = data

    distance = float(
        edge_data.get("road_length_m", 1)
    )

    safety = float(
        edge_data.get("safety_score", 50)
    )

    safety = max(
        1,
        min(100, safety)
    )

    # Safety-aware routing penalty
    safety_penalty = 1 + 2 * (1 - safety / 100)

    return distance * safety_penalty

# ============================================================
# CALCULATE SAFE ROUTE
# ============================================================

@csrf_exempt
def calculate_route(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "Only POST requests are allowed."
            },
            status=405
        )

    try:

        body = json.loads(
            request.body.decode("utf-8")
        )
        travel_time = body.get("travel_time", "morning")

        if isinstance(travel_time, dict):
            travel_time = travel_time.get("value", "morning")

        if travel_time not in ["morning", "noon", "evening", "night"]:
            travel_time = "morning"

        start_text = body.get("start", "")
        destination_text = body.get("destination", "")

        # ----------------------------------------------------
        # Parse locations
        # ----------------------------------------------------

        start = parse_location(start_text)

        if start is None:
            start = geocode_place(start_text)

        destination = parse_location(destination_text)

        if destination is None:
            destination = geocode_place(destination_text)

        # ----------------------------------------------------
        # DEBUG LOCATION
        # ----------------------------------------------------

        print("START LOCATION:", start, flush=True)
        print("DESTINATION LOCATION:", destination, flush=True)

        # ----------------------------------------------------
        # Validate
        # ----------------------------------------------------

        if start is None:
            return JsonResponse(
                {
                    "error":
                    "Invalid starting location. "
                    "Use latitude, longitude format "
                    "or enter a valid place name."
                },
                status=400
            )

        if destination is None:
            return JsonResponse(
                {
                    "error":
                    "Invalid destination. "
                    "Use latitude, longitude format "
                    "or enter a valid place name."
                },
                status=400
            )

        start_lat, start_lon = start
        dest_lat, dest_lon = destination

        # ----------------------------------------------------
        # Find nearest graph nodes
        # ----------------------------------------------------

        start_node = nearest_graph_node(
            start_lat,
            start_lon
        )

        destination_node = nearest_graph_node(
            dest_lat,
            dest_lon
        )

        print("\n************ SAFEPATH NODE DEBUG ************", flush=True)
        print(
            "START INPUT:",
            start_lat,
            start_lon,
            flush=True
        )
        print(
            "DESTINATION INPUT:",
            dest_lat,
            dest_lon,
            flush=True
        )
        print(
            "START NODE:",
            start_node,
            flush=True
        )
        print(
            "DESTINATION NODE:",
            destination_node,
            flush=True
        )

        if start_node is not None:
            start_data = route_graph.nodes[start_node]

            print(
                "START NODE XY:",
                start_data.get("x"),
                start_data.get("y"),
                flush=True
            )

        if destination_node is not None:
            destination_data = route_graph.nodes[destination_node]

            print(
                "DESTINATION NODE XY:",
                destination_data.get("x"),
                destination_data.get("y"),
                flush=True
            )

        print("**********************************************\n", flush=True)

        # ----------------------------------------------------
        # Check nodes
        # ----------------------------------------------------

        if start_node is None or destination_node is None:
            return JsonResponse(
                {
                    "error":
                    "Could not find suitable road nodes."
                },
                status=404
            )



        
        
        # ----------------------------------------------------
        # CALCULATE SHORTEST SAFE ROUTE
        # ----------------------------------------------------

    
        path = nx.shortest_path(
        route_graph,
        source=start_node,
        target=destination_node,
        weight=safe_route_weight
)

        # ----------------------------------------------------
        # PATH DEBUG
        # ----------------------------------------------------

        print("************ PATH DEBUG ************", flush=True)
        print("PATH FOUND:", path, flush=True)
        print("NUMBER OF NODES:", len(path), flush=True)
        print(
            "NUMBER OF SEGMENTS:",
            len(path) - 1,
            flush=True
        )
        print("************************************", flush=True)

        # ----------------------------------------------------
        # Route information
        # ----------------------------------------------------

        total_distance = 0
        safety_values = []
        route_coordinates = []

        # ----------------------------------------------------
        # Node coordinates
        # ----------------------------------------------------

        for node in path:

            node_data = route_graph.nodes[node]

            x = node_data.get("x")
            y = node_data.get("y")

            if x is not None and y is not None:

                lon, lat = to_wgs84.transform(
                    x,
                    y
                )

                route_coordinates.append(
                    [lat, lon]
                )

        # ----------------------------------------------------
        # Process route edges
        # ----------------------------------------------------

        for i in range(len(path) - 1):

            u = path[i]
            v = path[i + 1]

            edge_data = route_graph.get_edge_data(
                u,
                v
            )

            if edge_data is None:
                continue

            # Handle MultiGraph / normal Graph
            if isinstance(edge_data, dict):

                if "road_length_m" in edge_data:

                    data = edge_data

                else:

                    first_key = next(
                        iter(edge_data)
                    )

                    data = edge_data[first_key]

            else:
                continue

            distance = float(
                data.get(
                    "road_length_m",
                    0
                )
            )

            safety = float(
                data.get(
                    "safety_score",
                    50
                )
            )

            total_distance += distance

            safety_values.append(
                safety
            )

        # ----------------------------------------------------
        # FINAL ROUTE DEBUG
        # ----------------------------------------------------

        print("====================================", flush=True)
        print(
            "FINAL ROUTE DISTANCE DEBUG",
            flush=True
        )
        print(
            "Total distance meters:",
            total_distance,
            flush=True
        )
        print(
            "Total distance km:",
            total_distance / 1000,
            flush=True
        )
        print(
            "Number of route segments:",
            len(path) - 1,
            flush=True
        )
        print("====================================", flush=True)

        # ----------------------------------------------------
        # Average safety
        # ----------------------------------------------------

        if safety_values:

            average_safety = (
                sum(safety_values)
                / len(safety_values)
            )

        else:

            average_safety = 50

        average_safety = max(
            0,
            min(
                100,
                average_safety
            )
        )

        # ----------------------------------------------------
        # TIME-BASED SAFETY ADJUSTMENT
        # ----------------------------------------------------

        time_adjustments = {
            "morning": 5,
            "noon": 3,
            "evening": -3,
            "night": -7
        }

        average_safety += time_adjustments.get(
            travel_time,
            0
        )

        average_safety = max(
            0,
            min(100, average_safety)
        )
                

            

        # ----------------------------------------------------
        # Safety category
        # ----------------------------------------------------

        if average_safety >= 70:

            safety_category = "Very Safe"

        elif average_safety >= 50:

            safety_category = "Safe"

        elif average_safety >= 30:

            safety_category = "Moderate"

        else:

            safety_category = "High Risk"

        # ----------------------------------------------------
        # Route quality
        # ----------------------------------------------------

        if average_safety >= 70:

            route_quality = "Excellent"

        elif average_safety >= 50:

            route_quality = "Good"

        elif average_safety >= 30:

            route_quality = "Moderate"

        else:

            route_quality = "High Risk"

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return JsonResponse({

            "status": "success",

            "message":
                "Safe route calculated successfully",

            "start": [
                start_lat,
                start_lon
            ],

            "destination": [
                dest_lat,
                dest_lon
            ],

            "route_coordinates":
                route_coordinates,

            "distance_km":
                round(
                    total_distance / 1000,
                    3
                ),

            "safety_score":
                round(
                    average_safety,
                    2
                ),

            "safety_category":
                safety_category,

            "route_quality":
                route_quality,

            "number_of_nodes":
                len(path),

            "number_of_segments":
                len(path) - 1

        })

    except nx.NetworkXNoPath:

        return JsonResponse(
            {
                "error":
                "No route exists between the selected locations."
            },
            status=404
        )

    except Exception as e:

        print(
            "ROUTING ERROR:",
            str(e),
            flush=True
        )

        return JsonResponse(
            {
                "error": str(e)
            },
            status=500
        )

# ============================================================
# ROUTE PAGE
# ============================================================

def route_page(request):
    return render(request, "route.html")


#dashboard page
def dashboard(request):
    return render(request, "dashboard.html")

#emergency page
def emergency(request):
    return render(request, "emergency.html")

#safety-map page
def safety_map(request):
    return render(request, "safety-map.html")

# ============================================================
# SAFETY MAP GEOJSON DATA
# ============================================================

from django.http import JsonResponse
import json
from pathlib import Path


def safety_map_data(request):
    geojson_path = Path(__file__).resolve().parent.parent / "safepath" / "safepath_final_verified.geojson"

    with open(geojson_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return JsonResponse(data, safe=False)


# ============================================================
# ABOUT PAGE
# ============================================================

def about(request):
    return render(request, "about.html")



# ============================================================
# TEAM PAGE
# ============================================================

def team(request):
    return render(request, "team.html")