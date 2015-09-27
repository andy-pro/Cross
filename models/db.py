# -*- coding: utf-8 -*-

## if SSL/HTTPS is properly configured and you want all HTTP requests to
## be redirected to HTTPS, uncomment the line below:
# request.requires_https()

## app configuration made easy. Look inside private/appconfig.ini
from gluon.contrib.appconfig import AppConfig
## once in production, remove reload=True to gain full speed
myconf = AppConfig(reload=True)

db = DAL(myconf.take('db.uri'), pool_size=myconf.take('db.pool_size', cast=int), check_reserved=['all'])

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

from gluon.contrib import simplejson

db.define_table('cross_table',
                Field('title', length=40)
               )

db.define_table('vertical_table',
                Field('parent', db.cross_table),
                Field('title', length=40)
               )

selfields = []
pairfields = []     # this list contain [pid1, pmodon1, pmodby1], [pid2, pmodon2, pmodby2], ...
pairtitles = ('pid','pmodon','pmodby')

# КДП 0В M10/1 max title "БЗ 287 ТЛГ пер контроль льотного поля вишка"
for i in xrange(1, 11):
    fnames = [name+`i` for name in pairtitles]
    pairfields.append(fnames)
    selfields.append(Field(fnames[0], length=80, default=''))
    selfields.append(Field(fnames[1], 'date', default=request.now.date()))
    selfields.append(Field(fnames[2], db.auth_user, default=auth.user))

plintfields = ['title','start1','comdata','modon','modby']

db.define_table('plint_table',
                Field('root', db.cross_table),
                Field('parent', db.vertical_table),
                Field(plintfields[0], length=40, default=''),
                Field(plintfields[1], 'boolean', default=True),
                Field(plintfields[2], length=40, default=''),
                Field(plintfields[3], 'date', default=request.now.date()),
                Field(plintfields[4], db.auth_user, default=auth.user),
                *selfields
               )

pairtitles = [pairfields[z][0] for z in xrange(0, 10)]
pairtitles.append(plintfields[2])    # this list contain pid1, pid2,..., pid10, comdata
pfset1 = [db.plint_table.id, db.plint_table.title, db.plint_table.start1, db.plint_table.comdata]

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
