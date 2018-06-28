# from datetime import datetime
# from flask import render_template, session, redirect, url_for, current_app
# from . import main
# from .forms import NameForm
# from .. import db
# from ..models import User
# from ..email import send_email
#
#
# @main.route('/', methods=['GET', 'POST'])
# def index():
#     form = NameForm()
#     if form.validate_on_submit():
#         user = User.query.filter_by(username=form.name.data).first()
#         if user is None:
#             user = User(username=form.name.data)
#             db.session.add(user)
#             db.session.commit()
#             session['known'] = False
#             if current_app.config['HUNTED_ADMIN']:
#                 send_email(current_app.config['HUNTED_ADMIN'], 'New User', 'mail/new_user', user=user)
#         else:
#             session['known'] = True
#         session['name'] = form.name.data
#         form.name.data = ''
#         return redirect(url_for('.index'))
#         # if old_name is not None and old_name != form.name.data:
#         #     flash('Looks like you have changed your name!')
#         # session['name'] = form.name.data
#     return render_template('index.html', current_time=datetime.utcnow(), name=session.get('name'), form=form,
#                            known=session.get('known', False))


from flask import render_template
from . import main


@main.route('/')
def index():
    return render_template('index.html')
