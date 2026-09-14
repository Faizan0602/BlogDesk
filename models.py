from sqlalchemy import Column,DateTime,ForeignKey,Integer,String,Text,func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    blogs = relationship("Blog", back_populates="owner")

#Blog Table 

class Blog(Base):
    __tablename__="blogs"
    
    id = Column(Integer,primary_key=True,index=True)
    title=Column(String)
    content=Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    owner = relationship("User", back_populates="blogs")
    
