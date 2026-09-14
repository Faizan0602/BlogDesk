from fastapi import FastAPI,Depends,HTTPException,Query,status
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session
from database import engine,SessionLocal
import models,schemas
from auth import create_token,hash_password,verify_password,verify_token
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from fastapi.security import OAuth2PasswordRequestForm
models.Base.metadata.create_all(bind=engine)


def ensure_development_schema():
    inspector = inspect(engine)

    if "blogs" not in inspector.get_table_names():
        return

    blog_columns = {column["name"] for column in inspector.get_columns("blogs")}

    if "user_id" not in blog_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE blogs ADD COLUMN user_id INTEGER REFERENCES users(id)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_blogs_user_id ON blogs (user_id)"))


ensure_development_schema()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  

#DB DEPENDENCY
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload.get("sub")

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID TOKEN"
        )

    user = db.query(models.User).filter(models.User.id == parsed_user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID TOKEN"
        )

    return user


#REGISTER API
@app.post("/register",response_model=schemas.UserResponse,status_code=status.HTTP_201_CREATED)
def register(user:schemas.UserCreate,db:Session=Depends(get_db)):
    existing_username = db.query(models.User).filter(func.lower(models.User.username) == user.username.lower()).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="USERNAME ALREADY EXISTS"
        )

    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="EMAIL ALREADY EXISTS"
        )

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


#LOGIN API
@app.post("/login", response_model=schemas.TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        func.lower(models.User.username) == form_data.username.lower()
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID USERNAME OR PASSWORD"
        )

    token = create_token(
        {
            "sub": str(user.id),
            "username": user.username
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/me",response_model=schemas.UserResponse)
def read_me(user:models.User=Depends(get_current_user)):
    return user
        
#HOME ROUTE 
@app.get("/")
def home():
    return{
        "message":"blog api running"
    }
    
#CREATE BLOG (PROTECTED)
@app.post("/blogs",response_model=schemas.BlogResponse)
def create_blog(blog:schemas.BlogCreate,db:Session=Depends(get_db),user:models.User=Depends(get_current_user)):
    new_blog=models.Blog(
        title=blog.title,
        content=blog.content,
        user_id=user.id
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    
    return new_blog
    
#READ ALL BLOGS 
@app.get("/blogs")
def get_blogs(page:int =1,
              limit:int=5,
              search:str=Query(default=""),
              db:Session=Depends(get_db),
              user:models.User=Depends(get_current_user)):
    query=db.query(models.Blog)
    
    #SEARCH LOGIC
    if search:
        query=query.filter(models.Blog.title.ilike(f"%{search}%"))
    
    #PAGINATION LOGIC   
    total=query.count()
    start=(page-1)*limit
    blogs=query.offset(start).limit(limit).all()
    
    return{
        "page":page,
        "limit":limit,
        "total":total,
        "data":blogs
    }

#READ BLOGS BASED ON ID 
@app.get("/blogs/{id}",response_model=schemas.BlogResponse)
def get_blog(id:int,db:Session=Depends(get_db),user:models.User=Depends(get_current_user)):
    blog=db.query(models.Blog).filter(models.Blog.id==id).first()
    
    if not blog:
        raise HTTPException(
            status_code=404,
            detail="BLOG NOT FOUND !"
        )
    return blog

#UPDATE BLOG API (PROTECTED)

@app.put("/blogs/{id}",response_model=schemas.BlogResponse)
def update_blog(id:int,blog:schemas.BlogCreate,db:Session=Depends(get_db),user:models.User=Depends(get_current_user)):
    existing_blog=db.query(models.Blog).filter(models.Blog.id==id).first()
    if not existing_blog:
            raise HTTPException(
                status_code=404,
                detail="BLOG NOT FOUND !"
            )
    if existing_blog.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="YOU ARE NOT ALLOWED TO MODIFY THIS BLOG"
        )

    existing_blog.title=blog.title
    existing_blog.content=blog.content
    
    db.commit()
    return existing_blog

#DELETE BLOG API  (PROTECTED)
 
@app.delete("/blogs/{id}")
def delete_blog(id:int,db:Session=Depends(get_db),user:models.User=Depends(get_current_user)):
    blog=db.query(models.Blog).filter(models.Blog.id==id).first()
    if not blog:
        raise HTTPException(
            status_code=404,
            detail="BLOG NOT FOUND"
        )
    if blog.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="YOU ARE NOT ALLOWED TO MODIFY THIS BLOG"
        )

    db.delete(blog)
    db.commit()
    return {
        "message":"BLOG DELETED SUCCESSFULLY"
    }
