# backend/app/core/auth.py
import os
import logging
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.core.config import settings

security = HTTPBearer()
logger = logging.getLogger(__name__)

# === CONFIG NORMALIZATION ===
SUPABASE_URL = (settings.SUPABASE_URL or "").rstrip("/")
ISSUER = f"{SUPABASE_URL}/auth/v1"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"

# NOTE: SUPABASE_URL MUST look like: https://<project-ref>.supabase.co
#       (No trailing slash, no /auth/v1 suffix; we add /auth/v1 ourselves.)

# JWKS client (handles EC/ES256 and RSA/RS256)
_jwk_client = PyJWKClient(JWKS_URL)

# Optional: enable one-time noisy logging in dev (set DEBUG_AUTH=1)
DEBUG_AUTH = os.getenv("DEBUG_AUTH") == "1"

def _diagnose_token(jwt_token: str):
    """Log header/claims without verifying, to pinpoint mismatches quickly."""
    try:
        header = jwt.get_unverified_header(jwt_token)
        claims = jwt.decode(jwt_token, options={"verify_signature": False})
        logger.warning(
            "AUTH DIAG: token.alg=%s kid=%s | iss=%s aud=%s sub=%s exp=%s",
            header.get("alg"), header.get("kid"),
            claims.get("iss"), claims.get("aud"),
            claims.get("sub"), claims.get("exp"),
        )
        logger.warning("AUTH DIAG: expected ISSUER=%s | JWKS_URL=%s", ISSUER, JWKS_URL)
    except Exception as e:
        logger.warning("AUTH DIAG: failed to inspect JWT: %s", e)

def get_current_user(token = Depends(security)):
    """
    Validate Supabase JWT (ES256 or RS256) and extract user info.
    """
    jwt_token = token.credentials
    try:
        if DEBUG_AUTH:
            _diagnose_token(jwt_token)

        # 1) Get the correct signing key (handles EC & RSA; selects by kid)
        signing_key = _jwk_client.get_signing_key_from_jwt(jwt_token)

        # 2) Verify signature + issuer. (Don't force audience unless you want to.)
        payload = jwt.decode(
            jwt_token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            issuer=ISSUER,                  # must exactly match token `iss`
            options={"verify_aud": False},  # flip to audience="authenticated" if you want to enforce it
            # audience="authenticated",
        )

        return {"id": payload["sub"], "email": payload.get("email")}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidIssuerError as e:
        # Issuer mismatch (most common): SUPABASE_URL wrong (extra path/slash/domain)
        msg = "Invalid token (iss mismatch)"
        if DEBUG_AUTH:
            msg += f" | expected={ISSUER}"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
    except jwt.PyJWKClientError as e:
        # Could not fetch JWKS or kid not found in keys (wrong JWKS URL or stale cache)
        msg = "Invalid token (jwks)"
        if DEBUG_AUTH:
            msg += f" | {e} | jwks={JWKS_URL}"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
    except jwt.InvalidSignatureError as e:
        msg = "Invalid token (signature)"
        if DEBUG_AUTH:
            msg += f" | {e}"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
    except jwt.InvalidTokenError as e:
        msg = "Invalid token"
        if DEBUG_AUTH:
            msg += f" | {e}"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
    except Exception as e:
        msg = "Invalid or expired token"
        if DEBUG_AUTH:
            msg += f" | unexpected: {e}"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
