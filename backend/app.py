from flask import Flask, request, jsonify
from flask_cors import CORS
from services.git_service import GitService
from services.ai_service import AIService
import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing) allows Next.js frontend (running on a different port) to call this API
CORS(app)

