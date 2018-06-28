from flask import redirect, url_for,render_template,session
from flask_login import login_required
from . import game
from .forms import GroupForm


@game.route('/map')
@login_required
def map():
    return render_template('game/map.html', name=session.get('name'))


@game.route('/group', methods=['GET', 'POST'])
@login_required
def group():
    form = GroupForm()
    session['name'] = form.name.data
    if form.name.data is None:
        return render_template('game/group.html', form=form)
    return render_template('game/map.html', name=form.name.data)
