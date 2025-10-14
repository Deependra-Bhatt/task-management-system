from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, get_jwt_identity, get_jwt # Import necessary functions

# --- JWT BLACKLIST SETUP ---
# Global set to store revoked token JTIs (used for blacklisting)
BLACKLIST = set()

# Initialize the extension objects
bcrypt = Bcrypt()
mongo = PyMongo()
jwt = JWTManager()


# --- JWT CALLBACKS ---
# This function is called by Flask-JWT-Extended before every protected endpoint
@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    """Checks if the token's JTI (unique ID) is in the global blocklist."""
    jti = jwt_payload["jti"]
    return jti in BLACKLIST