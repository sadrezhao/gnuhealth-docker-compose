FROM python:3.11

ARG GNUHEALTH_SAO_PORT=8092
ARG GNUHEALTH_WEBDEV_PORT=8086
ARG GNUHEALTH_FHIR_PORT=8020

RUN apt-get update
RUN apt-get -y install --no-install-recommends vim wget npm uwsgi uwsgi-plugin-python3 python3-pip postgresql-client
RUN pip3 install psycopg2 pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg pyjpegls pylibjpeg-rle
RUN pip3 install pyorthanc

RUN adduser gnuhealth
USER gnuhealth

# Install gnuhealth
WORKDIR /home/gnuhealth
COPY gnuhealth-radiology.tar.gz /home/gnuhealth/gnuhealth-radiology.tar.gz
RUN tar -xzvf gnuhealth-radiology.tar.gz
RUN rm /home/gnuhealth/gnuhealth-radiology.tar.gz

WORKDIR /home/gnuhealth/gnuhealth-4.4.1
RUN wget -qO- https://ftp.gnu.org/gnu/health/gnuhealth-setup-latest.tar.gz | tar -xzvf -
# COPY gnuhealth-setup-latest.tar.gz /home/gnuhealth/gnuhealth-4.4.1/gnuhealth-setup-latest.tar.gz
# RUN tar -xzvf gnuhealth-setup-latest.tar.gz
RUN bash ./gnuhealth-setup install
# RUN rm /home/gnuhealth/gnuhealth-4.4.1/gnuhealth-setup-latest.tar.gz

# Write gnuhealth configuration file
RUN echo "[database]\n\
path = /home/gnuhealth/attach\n\
\n\
[web]\n\
listen = *:${GNUHEALTH_SAO_PORT}\n\
root=/home/gnuhealth/sao\n\
\n\
[webdav]\n\
listen = *:${GNUHEALTH_WEBDAV_PORT}\n\
ssl_webdav = False\n" > /home/gnuhealth/gnuhealth/tryton/server/config/trytond.conf

# Install sao
WORKDIR /home/gnuhealth
RUN wget -qO- https://downloads.tryton.org/6.0/tryton-sao-6.0.45.tgz | tar -xzvf -
RUN mv package sao
WORKDIR /home/gnuhealth/sao
RUN npm install --production --legacy-peer-deps

# Custom sao widget for radiology
COPY custom.js /home/gnuhealth/sao/custom.js

WORKDIR /home/gnuhealth

# Install FHIR server
RUN pip3 install --upgrade --user gnuhealth-fhir-server
COPY fhir-config.py /home/gnuhealth/.local/lib/python3.11/site-packages/fhir_server/config.py

# Write FHIR server configuration file
RUN echo "[uwsgi]\n\
master = true\n\
processes = 5\n\
plugins = python3\n\
http-socket=0.0.0.0:${GNUHEALTH_FHIR_PORT}\n\
module=fhir_uwsgi:app\n\
logto = /tmp/fhir_server.log\n" > /home/gnuhealth/.local/lib/python3.11/site-packages/fhir_server/server_uwsgi.ini

EXPOSE ${GNUHEALTH_SAO_PORT}
EXPOSE ${GNUHEALTH_WEBDAV_PORT}
EXPOSE ${GNUHEALTH_FHIR_PORT}

# Define environment variable
ENV NAME=GNUHealth_Fhir_Server
