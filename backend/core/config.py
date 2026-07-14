import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load standard .env file first
load_dotenv()

# Determine active environment: development, testing, production
ENV = os.getenv("ENV", "development").lower()

class Settings(BaseSettings):
    ENV: str = ENV
    PROJECT_NAME: str = "SmartHealth Nexus API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database Configuration
    DATABASE_URL: str = ""

    # Individual Database Connection details (useful for remote DBs using an API key/token)
    DB_HOST: str = ""
    DB_PORT: str = "5432"
    DB_USER: str = ""
    DB_API_KEY: str = ""
    DB_TOKEN: str = ""
    DB_NAME: str = ""
    DB_SSL_MODE: str = "require"

    def __init__(self, **values):
        super().__init__(**values)
        api_key_or_token = self.DB_API_KEY or self.DB_TOKEN
        if self.DB_HOST and self.DB_USER and api_key_or_token and self.DB_NAME:
            self.DATABASE_URL = (
                f"postgresql://{self.DB_USER}:{api_key_or_token}@"
                f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode={self.DB_SSL_MODE}"
            )
        elif not self.DATABASE_URL:
            env_db_url = os.getenv("DATABASE_URL")
            if env_db_url:
                self.DATABASE_URL = env_db_url
            else:
                self.DATABASE_URL = "sqlite:///./smarthealth_nexus.db"

    # JWT Authentication settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-district-key-smarthealth-nexus-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS configuration
    CORS_ORIGINS: list = [
        "http://localhost:5173",  # default Vite port
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Centralized log parameters
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "logs/smarthealth_nexus.log")
    LOG_MAX_BYTES: int = 5 * 1024 * 1024  # 5MB
    LOG_BACKUP_COUNT: int = 5

    class Config:
        # Load from .env.<env> if exists, otherwise fallback to system environments
        env_file = f".env.{ENV}"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
