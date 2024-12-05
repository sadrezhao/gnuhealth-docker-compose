# GNUHealth server with demo database

This setup consists of two containers, one for GNUHealth (https://www.gnuhealth.org/) with the FHIR server and the SAO web interface, and one for the postgres database server used by GNUHealth. The database data is persistently stored in the volume `gnuhealth-data`.

To start the containers run

```
docker compose up
```

To stop the containers run

```
docker compose down
```

in the directory `docker-compose/gnuhealth`.

The `.env` file contains important configuration parameters for GNUHealth and the database. If you modify them, you have to rebuild the containers. `GNUHEALTH_SAO_PORT` defines the port of GNUHealth's web client interface (default `http://localhost:8080`). All containers run in the network `vhp_network` by default.

Two GNUHealt databases are created: the demo database `ghdemo44` described in https://docs.gnuhealth.org/his/techguide/demodb.html (username `admin`, password `gnusolidario`), and an empty database with name `$GHDATABASE` and admin password `$TRYTONPASSWORD`, as defined in the `.env` file.

# GNUHealth server with demo database and integrated Orthanc server

This setup consists of three containers, one for GNUHealth (https://www.gnuhealth.org/) with the FHIR server and the SAO web interface, one for the postgres database server used by GNUHealth, and one for the Orthanc server. The postgres data is persistently stored in the volume `gnuhealth-data`. The Orthanc data is persistently stored in the volume `orthanc-db`.

To start the containers run

```
docker compose up
```

To stop the containers run

```
docker compose down
```

in the directory `docker-compose/gnuhealth-radiology-localhost`.

Two GNUHealt databases are created: the demo database `ghdemo44` described in https://docs.gnuhealth.org/his/techguide/demodb.html (username `admin`, password `gnusolidario`), and an empty database with name `$GHDATABASE` and admin password `$TRYTONPASSWORD`, as defined in the `.env` file.

The web interface of Orthanc is reachable under http://localhost:8888/ with username `orthanc` and password `orthanc`. However, when you add the Orthanc server as a radiology server inside GNUHealth, you have to use the URL http://localhost:8042/.

Note that it can take several minutes for the web interface to become available when you start the containers for the first time.
