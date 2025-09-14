from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FIT Fusion"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
