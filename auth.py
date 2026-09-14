from jose import jwt,JWTError
from datetime import datetime,timedelta,timezone
from fastapi import HTTPException,Depends,status
from fastapi.security import OAuth2PasswordBearer
import bcrypt
from config import JWT_ALGORITHM,JWT_EXPIRE_MINUTES,JWT_SECRET_KEY

oauth2_schema=OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

#token create
def create_token(data:dict):
    to_encode=data.copy()
    
    expire=datetime.now(timezone.utc)+timedelta(minutes=JWT_EXPIRE_MINUTES)
    
    to_encode.update({"exp":expire})
    
    return jwt.encode(to_encode,JWT_SECRET_KEY,algorithm=JWT_ALGORITHM)

def verify_token(token:str=Depends(oauth2_schema)):
    try:
        payload=jwt.decode(token,JWT_SECRET_KEY,algorithms=[JWT_ALGORITHM])

        if not payload.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="INVALID TOKEN"
            )

        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID TOKEN"
        )
