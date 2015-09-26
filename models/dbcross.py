# -*- coding: utf-8 -*-
import gluon.contrib.simplejson

db.define_table('cross_table',
                Field('title')
               )

db.define_table('vertical_table',
                Field('parent', db.cross_table),
                Field('title'),
               )

selfields = []
pairfields = []
pairtitles = ('pid','ptopl','ptopr','pmodon','pmodby','ploop')

for i in xrange(1, 11):
    fnames = [name+`i` for name in pairtitles]
    pairfields.append(fnames)
    selfields.append(Field(fnames[0], default=''))
    selfields.append(Field(fnames[1], 'integer', default=0))
    selfields.append(Field(fnames[2], 'integer', default=0))
    selfields.append(Field(fnames[3], 'date', default=request.now.date()))
    selfields.append(Field(fnames[4], db.auth_user, default=auth.user))
    selfields.append(Field(fnames[5], 'boolean', default=False))

plintfields = ['title','start1','comdata','comefrom','modon','modby']

db.define_table('plint_table',
                Field('root', db.cross_table),
                Field('parent', db.vertical_table),
                Field(plintfields[0], default=''),
                Field(plintfields[1], 'boolean', default=True),
                Field(plintfields[2], default=''),
                Field(plintfields[3], 'integer', default=0),
                Field(plintfields[4], 'date', default=request.now.date()),
                Field(plintfields[5], db.auth_user, default=auth.user),
                *selfields
               )

pairtitles = [pairfields[z][0] for z in xrange(0, 10)]    # this fields contains pair titles
pairtitles.append(plintfields[2])
selfields = (('vertsel','cross_vert'), ('plintsel','cross_plint'), ('pairsel', 'cross_pair'), ('fromcrosssel','from_cross'), ('fromvertsel','from_vert'), ('fromplintsel','from_plint'))

db.define_table('menu_table',
                Field('menu', 'json')
               )
