# backend/app/services/supabase_client.py
from supabase import create_client, Client
from app.core.config import settings

"""
Supabase client instance to be shared across all services.

Use this instead of creating separate clients in each service.
"""

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)
