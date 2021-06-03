from flask import Flask, render_template
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/documentation')
def documentation():
  return render_template('documentation.html')

if __name__ == '__main__':
  app.run( # Starts the site
		host='0.0.0.0',  # EStablishes the host, required for replit to detect the site
		port=random.randint(2000, 9000)  # Randomly select the port the machine hosts on.
	)