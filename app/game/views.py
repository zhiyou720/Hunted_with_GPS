from flask import redirect, url_for,render_template
from flask_login import login_required
from . import game
from .forms import GroupForm


@game.route('/map', methods=['GET', 'POST'])
@login_required
def map(name):
    return render_template('game/map.html', name=name)


@game.route('/group', methods=['GET', 'POST'])
@login_required
def group():
    form = GroupForm()
    if form.name.data is not None:
        return render_template('game/map.html', name=form.name.data)
    return render_template('game/group.html', form=form)
