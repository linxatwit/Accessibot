from flask import Flask, render_template, request, flash
from flask_mail import Mail, Message
import os

app = Flask(__name__)

# gmail configurations
# app.config['MAIL_SERVER']='smtp.gmail.com'
# app.config['MAIL_PORT'] = 465
# app.config['MAIL_USERNAME'] = environ.get('MAIL_USERNAME')
# app.config['MAIL_PASSWORD'] = environ.get('MAIL_PASSWORD')
# app.config['MAIL_USE_TLS'] = False
# app.config['MAIL_USE_SSL'] = True

app.config.update(dict(
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 465,
    MAIL_USE_TLS = False,
    MAIL_USE_SSL = True,
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME'),
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD'),
))

mail = Mail(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/documentation')
def documentation():
  return render_template('documentation.html')

@app.route('/commands')
def commands():
  return render_template('commands.html')

@app.route('/feedback', methods=["GET", "POST"])
def feedback():

  if request.method == 'POST':
    # User inputs from form
    inputs = {}
    inputs['discordTag'] = request.form['discordTag']
    inputs['categories'] = request.form['categories']
    inputs['description'] = request.form['description']

    subject = ""

    if inputs['categories'] == "bot":
      subject = "Bot Functionalities"
    if inputs['categories'] == "feedback":
      subject = "Feedback/Suggestions"
    if inputs['categories'] == "technical":
      subject = "Technical Issues"
    if inputs['categories'] == "ui":
      subject = "User Interface"
    if inputs['categories'] == "web":
      subject = "Website Support"
    if inputs['categories'] == "other":
      subject = "Other"

    msg = Message(subject,
                    sender="accessibotwebsite@accesibot.com",
                    recipients=["accessibotdiscord@gmail.com"])

    msg.html="""
    <h2 style="font-weight: normal">You have received a new feedback.</h2>

    <p style="font-size: 15px"><b>Discord Tag:</b> {}</p>
    <p style="font-size: 15px"><b>Message:</b> {}</p>
    """.format(inputs['discordTag'], inputs['description'])

    mail.send(msg)
    flash('Thank you for your feedback', 'success')
    return render_template('feedback.html')

  return render_template('feedback.html')

@app.errorhandler(404)
def page_not_found(e):
  return render_template('404.html'), 404

@app.errorhandler(500)
def page_not_found(e):
	return render_template("500.html"), 500

if __name__ == '__main__':
  app.secret_key = 'secret keyyyy'
  app.config['ENV'] = 'dev'  
  app.config['DEBUG'] = True
  app.run(threaded=True# Starts the site
		#host='0.0.0.0',  # EStablishes the host, required for replit to detect the site
		#port=random.randint(2000, 9000)  # Randomly select the port the machine hosts on.
	)