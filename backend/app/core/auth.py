# backend/app/core/auth.py
import jwt
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.core.config import settings

security = HTTPBearer()

JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
jwks_client = None

def get_jwks():
    global jwks_client
    if jwks_client is None:
        response = requests.get(JWKS_URL)
        if response.status_code != 200:
            raise Exception("Failed to fetch JWKS keys")
        jwks_client = response.json()
    return jwks_client

def get_current_user(token: str = Depends(security)):
    """
    Validate Supabase JWT and extract user info.
    """
    try:
        jwks = get_jwks()
        header = jwt.get_unverified_header(token.credentials)
        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid JWT header")

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(
            token.credentials,
            public_key,
            algorithms=["RS256"],
            audience=settings.SUPABASE_URL,
        )
        return {"id": payload["sub"], "email": payload.get("email")}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
