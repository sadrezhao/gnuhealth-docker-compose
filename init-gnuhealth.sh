#!/bin/bash

export TRYTOND_DATABASE_URI="postgresql://${GHDBUSER}:${GHDBPASSWORD}@gnuhealth-database:${POSTGRES_PORT}"

echo ${TRYTONPASSWORD} > ${TRYTONPASSFILE}

# Wait for database...
echo Waiting for database ${TRYTOND_DATABASE_URI}
while ! pg_isready -d ${TRYTOND_DATABASE_URI} -t 5; do
    sleep 1
done

#######################
# Init GNUHealth databases
#######################

cd /home/gnuhealth
source .gnuhealthrc

# Initialize database $GHDATABASE
echo Initializing database ${GHDATABASE}
python3 ${GNUHEALTH_DIR}/tryton/server/${TRYTOND}/bin/trytond-admin -c ${GNUHEALTH_DIR}/tryton/server/config/trytond.conf --all --database=${GHDATABASE} --email=${GHADMIN_EMAIL}

# Activate GNUHealth modules
echo Activating GNUHealth modules for database ${GHDATABASE}
python3 ${GNUHEALTH_DIR}/tryton/server/${TRYTOND}/bin/trytond-admin -c ${GNUHEALTH_DIR}/tryton/server/config/trytond.conf -d ${GHDATABASE} --activate-dependencies -u health health_lab

# Activate modules in demo database
echo Activating GNUHealth modules for database ghdemo44
python3 ${GNUHEALTH_DIR}/tryton/server/${TRYTOND}/bin/trytond-admin -c ${GNUHEALTH_DIR}/tryton/server/config/trytond.conf -d ghdemo44 --activate-dependencies

#######################
# Start GNUHealth
#######################

# Start GNUHealth server
echo Starting GNUHealth
nohup ./start_gnuhealth.sh &

sleep 3

# Start FHIR server
export PYTHONPATH=/usr/local/lib/python3.11/site-packages:/usr/local/lib/python3.11/lib-dynload:$PYTHONPATH
cd /home/gnuhealth/.local/lib/python3.11/site-packages/fhir_server
uwsgi server_uwsgi.ini
