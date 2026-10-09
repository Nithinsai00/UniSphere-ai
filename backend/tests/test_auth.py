import pytest
from backend.app.security import hash_password, verify_password, create_access_token
import jwt
from backend.app.config import settings

def test_password_hashing():
    raw = "Hope@50"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPass", hashed) is False

def test_jwt_token_creation_and_decode():
    data = {"sub": "admin", "role": "admin", "user_id": 1}
    token = create_access_token(data)
    assert isinstance(token, str)
    
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "admin"
    assert payload["role"] == "admin"
    assert "exp" in payload
