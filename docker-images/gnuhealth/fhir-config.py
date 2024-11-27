import os

class ProductionConfig(object):
    TRYTON_DATABASE = 'health'
    TRYTON_CONFIG = '/home/gnuhealth/gnuhealth/tryton/server/config/trytond.conf'
    SECRET_KEY = '123456789abcdefghijk'
    # SERVER_NAME = 'localhost'
    PREFERRED_URL_SCHEME='http'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_NAME = 'fhir'
    PERMANENT_SESSION_LIFETIME = 24*60*60 #seconds

    #Remember Me setup
    REMEMBER_COOKIE_NAME='fhir_remember_token'
    #REMEMBER_COOKIE_DURATION #default 1 year

class DebugConfig(object):
    DEBUG = True
    TRYTON_DATABASE = 'health'
    TRYTON_CONFIG = '/home/gnuhealth/gnuhealth/tryton/server/config/trytond.conf'
    SECRET_KEY = 'test'
    # SERVER_NAME = 'localhost'
    PREFERRED_URL_SCHEME='http'
    SESSION_COOKIE_NAME = 'fhir'
    REMEMBER_COOKIE_NAME='fhir_remember_token'