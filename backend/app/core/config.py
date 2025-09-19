from pydantic_settings import BaseSettings
import os 

class Settings(BaseSettings):
    PROJECT_NAME: str = "FIT Fusion"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    class Config:
        env_file = ".env"

settings = Settings()

