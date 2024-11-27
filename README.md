# GNUHealth docker compose with demo database

Note: If you experience network errors inside the applications, for example a gnuhealth server reporting that it cannot reach the database server although both servers seem to run fine, it sometimes help to restart _your machine_ (not just the containers).

# GNUHealth server with demo database

This setup consists of two containers, one for GNUHealth (https://www.gnuhealth.org/) with the FHIR server and the SAO web interface, and one for the postgres database server used by GNUHealth. The database data is persistently stored in the volume `gnuhealth-data`.

To start the containers run

```
docker compose up
```

in the directory `docker-compose/gnuhealth`.

The `.env` file contains important configuration parameters for GNUHealth and the database. If you modify them, you have to rebuild the containers. `GNUHEALTH_SAO_PORT` defines the port of GNUHealth's web client interface (default `http://localhost:8080`). All containers run in the network `vhp_network` by default.

Two GNUHealt databases are created: the demo database `ghdemo44` described in https://docs.gnuhealth.org/his/techguide/demodb.html (username `admin`, password `gnusolidario`), and an empty database with name `$GHDATABASE` and admin password `$TRYTONPASSWORD`, as defined in the `.env` file.

Note that it can take several minutes for the web interface to become available when you start the containers for the first time.
