FROM python:3.6-alpine

ENV FLASK_APP hunted.py
ENV FLASK_CONFIG production

RUN adduser -D hunted
USER hunted

WORKDIR /home/hunted

COPY requirements requirements
RUN python -m venv venv
RUN venv/bin/pip install -r requirements/docker.txt

COPY app app
COPY migrations migrations
COPY hunted.py config.py boot.sh ./

# run-time configuration
EXPOSE 5000
ENTRYPOINT ["./boot.sh"]