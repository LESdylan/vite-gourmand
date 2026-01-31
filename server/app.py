from fastapi import FastAPI
from sqlalchemy import create_engine
from pymongo import MongoClient

app = FastAPI()

engine = create_engine("postgresql://user:")