from fastapi import APIRouter, Request, HTTPException, Header
from app.services.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.options("/test")
def preflight_test():
    # Respond to preflight without auth
    return {"status": "ok"}

@router.get("/test")
def test_auth(request: Request, authorization: str = Header(None)):
    """
    Test Supabase Auth by validating the user's access token.
    Expects header: Authorization: Bearer <access_token>
    """
    # Skip auth check for preflight just in case
    if request.method == "OPTIONS":
        return {"status": "ok"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        if user and user.user:
            return {"status": "ok", "user": user.user.email}
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
