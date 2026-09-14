from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from config import DATABASE_URL

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required.")

engine = create_engine(DATABASE_URL)

SessionLocal=sessionmaker(bind=engine)

Base=declarative_base()
