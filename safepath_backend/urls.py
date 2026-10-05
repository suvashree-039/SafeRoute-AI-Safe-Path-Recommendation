from django.contrib import admin
from django.urls import path

from routeapp.views import (
    home,
    route_page,
    model_status,
    route_graph_status,
    calculate_route,
    dashboard,
    emergency,
    safety_map,
    safety_map_data,
    about,
    team
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home),
    path("route/", route_page),
    path("dashboard/", dashboard),
    path("emergency/", emergency),
    path("safety-map/", safety_map),
    path("about/", about),
    path("safety-map-data/", safety_map_data),
    path("model-status/", model_status),
    path("route-graph-status/", route_graph_status),
    path("calculate-route/", calculate_route),
    path("team/", team),

]