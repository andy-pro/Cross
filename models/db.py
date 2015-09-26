# -*- coding: utf-8 -*-

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

## app configuration made easy. Look inside private/appconfig.ini
from gluon.contrib.appconfig import AppConfig
## once in production, remove reload=True to gain full speed
myconf = AppConfig(reload=True)

if not request.env.web2py_runtime_gae:
    ## if NOT running on Google App Engine use SQLite or other DB
    db = DAL(myconf.take('db.uri'), pool_size=myconf.take('db.pool_size', cast=int), check_reserved=['all'])
else:
    ## connect to Google BigTable (optional 'google:datastore://namespace')
    db = DAL('google:datastore+ndb')
    ## store sessions and tickets there
    session.connect(request, response, db=db)
    ## or store session in Memcache, Redis, etc.
    ## from gluon.contrib.memdb import MEMDB
    ## from google.appengine.api.memcache import Client
    ## session.connect(request, response, db = MEMDB(Client()))

## by default give a view/generic.extension to all actions from localhost
## none otherwise. a pattern can be 'controller/function.extension'
response.generic_patterns = ['*'] if request.is_local else []
## choose a style for forms
response.formstyle = myconf.take('forms.formstyle')  # or 'bootstrap3_stacked' or 'bootstrap2' or other
response.form_label_separator = myconf.take('forms.separator')


## (optional) optimize handling of static files
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'
## (optional) static assets folder versioning
# response.static_version = '0.0.0'
#########################################################################
## Here is sample code if you need for
## - email capabilities
## - authentication (registration, login, logout, ... )
## - authorization (role based authorization)
## - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
## - old style crud actions
## (more options discussed in gluon/tools.py)
#########################################################################

from gluon.tools import Auth, Service, PluginManager

auth = Auth(db)
service = Service()
plugins = PluginManager()

## create all tables needed by auth if not custom tables
auth.define_tables(username=False, signature=False)

## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' if request.is_local else myconf.take('smtp.server')
mail.settings.sender = myconf.take('smtp.sender')
mail.settings.login = myconf.take('smtp.login')

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

import gluon.contrib.simplejson

db.define_table('cross_table',
                Field('title', length=128)
               )

db.define_table('vertical_table',
                Field('parent', db.cross_table),
                Field('title', length=128)
               )

selfields = []
pairfields = []
pairtitles = ('pid','pmodon','pmodby')

for i in xrange(1, 11):
    fnames = [name+`i` for name in pairtitles]
    pairfields.append(fnames)
    selfields.append(Field(fnames[0], length=32, default=''))
    selfields.append(Field(fnames[1], length=16, default=str(request.now.date())))
    selfields.append(Field(fnames[2], db.auth_user, default=auth.user))

plintfields = ['title','start1','comdata','modon','modby']

db.define_table('plint_table',
                Field('root', db.cross_table),
                Field('parent', db.vertical_table),
                Field(plintfields[0], default=''),
                Field(plintfields[1], 'boolean', default=True),
                Field(plintfields[2], length=64, default=''),
                Field(plintfields[3], length=16, default=str(request.now.date())),
                Field(plintfields[4], db.auth_user, default=auth.user),
                *selfields
               )

pairtitles = [pairfields[z][0] for z in xrange(0, 10)]    # this fields contains pair titles
pairtitles.append(plintfields[2])
selfields = (('vertsel','cross_vert'), ('plintsel','cross_plint'), ('pairsel', 'cross_pair'), ('fromcrosssel','from_cross'), ('fromvertsel','from_vert'), ('fromplintsel','from_plint'))

db.define_table('menu_table',
                Field('menu', 'json')
               )

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
