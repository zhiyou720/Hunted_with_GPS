import os
from app import create_app, db
from app.models import User, Role
from flask_migrate import Migrate, upgrade
from flask_socketio import SocketIO, send

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
migrate = Migrate(app, db)
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)
    send(message, broadcast=True)


@app.shell_context_processor
def make_shell_contest():
    return dict(db=db, User=User, Role=Role)


@app.cli.command()
def test():
    """Run the unit tests."""
    import unittest
    tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2).run(tests)


@app.cli.command()
def deploy():
    """Run deployment tasks."""
    # migrate database to latest revision
    upgrade()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 33507))
    socketio.run(app, host='0.0.0.0', port=port)






