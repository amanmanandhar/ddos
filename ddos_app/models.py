from django.db import models

class TrafficLog(models.Model):
    ip_address = models.GenericIPAddressField()
    requests = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

class BlockedIP(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    blocked_at = models.DateTimeField(auto_now_add=True)
