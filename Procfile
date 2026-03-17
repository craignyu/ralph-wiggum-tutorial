# Procfile - Production server configuration
#
# Used by platforms like Heroku, Railway, or render.com
# Defines the command to start the web server in production

web: gunicorn "src.app:create_app()" --bind 0.0.0.0:$PORT
