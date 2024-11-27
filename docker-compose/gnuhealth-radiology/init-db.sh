#!/bin/bash

set -e

# Create database and user for GNU Health server

psql -v ON_ERROR_STOP=1 --username "$PGUSER" --dbname "$PGDATABASE" <<-EOSQL
    CREATE USER ${GHDBUSER} WITH ENCRYPTED PASSWORD '${GHDBPASSWORD}' CREATEDB;
    CREATE DATABASE ${GHDATABASE} WITH OWNER ${GHDBUSER}
EOSQL

echo Database ${GHDATABASE} created for user ${GHDBUSER}

# Create demo database

psql -v ON_ERROR_STOP=1 --username "$PGUSER" --dbname "$PGDATABASE" <<-EOSQL
    CREATE DATABASE ghdemo44 WITH OWNER ${GHDBUSER}
EOSQL

cd /tmp
echo Downloading demo database
wget -qO- https://www.gnuhealth.org/downloads/postgres_dumps/gnuhealth-44-demo.sql.gz > gnuhealth_demo_database-44.sql.gz
gunzip -q gnuhealth_demo_database-44.sql.gz
echo Importing demo database
psql -q ghdemo44 ${GHDBUSER} < gnuhealth_demo_database-44.sql > /dev/null 2>&1
echo Demo database imported