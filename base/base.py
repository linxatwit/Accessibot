from flask import Blueprint, render_template, request, session, redirect, url_for

# Define our blueprint with routes
base_bp = Blueprint('base_bp', __name__,
    template_folder='templates',
    static_folder='static')

@base_bp.route('/')
def index():
    return render_template('base.html')