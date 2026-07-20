from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Find project folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env
env_path = BASE_DIR / ".env"
load_dotenv(env_path)

# Read Mongo URI
MONGO_URI = os.getenv("MONGO_URI")

print("BASE_DIR =", BASE_DIR)
print("ENV PATH =", env_path)
print("FILE EXISTS =", env_path.exists())
print("Mongo URI =", MONGO_URI)

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Database
db = client["StudentDB"]

# Collections
students = db["students"]
interviews = db["ai interviews transcript"]