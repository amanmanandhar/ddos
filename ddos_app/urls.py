from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("log_request/", views.LogRequestView.as_view(), name="log_request"),
    path("traffic_stats/", views.TrafficStatsView.as_view(), name="traffic_stats"),
    path("blocked_ips/", views.BlockedIPsView.as_view(), name="blocked_ips"),
]
