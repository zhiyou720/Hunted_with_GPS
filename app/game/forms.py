from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired


class GroupForm(FlaskForm):
    name = StringField('What is your group name?', validators=[DataRequired()])
    submit = SubmitField('Submit')
