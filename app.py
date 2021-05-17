from flask import Flask

# Blueprints
from base.base import base_bp

app = Flask(__name__)
app.register_blueprint(base_bp)

if __name__ == '__main__':
    app.run(threaded=True)