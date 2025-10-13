from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Initialize the extension object here
bcrypt = Bcrypt()
mongo = PyMongo()
jwt = JWTManager()