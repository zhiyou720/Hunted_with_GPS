FROM python:3.6-alpine

ENV FLASK_APP hunted.py
ENV FLASK_CONFIG production

RUN adduser -D hunted
USER hunted

WORKDIR /home/hunted

COPY requirements requirements
RUN python -m venv venv
USER root
RUN apk --update add \
        bash \
        python \
        python-dev \
        py-pip \
        gcc \
        zlib-dev \
        git \
        linux-headers \
        build-base \
        musl \
        musl-dev \
        memcached \
        libmemcached-dev
RUN venv/bin/pip install -r requirements/docker.txt
USER hunted


COPY app app
COPY migrations migrations
COPY hunted.py config.py boot.sh ./
USER root
RUN chmod 777 ./boot.sh
RUN chmod +x ./boot.sh
# php env
#FROM php:7.0-apache
#COPY ./ /var/www/html/

USER hunted
# run-time configuration
EXPOSE 5000
ENTRYPOINT ["./boot.sh"]