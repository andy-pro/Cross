# -*- coding: utf-8 -*-
from gluon.storage import Storage
import gluon.contrib.simplejson
cross_storage = Storage()

db.define_table('cross_table',
                Field('title')
               )

db.define_table('vertical_table',
                Field('parent', db.cross_table),
                Field('title'),
               )

fields = []
for i in xrange(1, 11):
    fields.append(Field('pair_id_%i' % i, default=''))
    fields.append(Field('loopback_id_%i' % i, 'boolean', default=False))
    fields.append(Field('crossed_to_plint_id_%i' % i, 'reference plint_table', ondelete='SET NULL'))
    fields.append(Field('crossed_to_pair_id_%i' % i, default=''))
    fields.append(Field('modified_on_id_%i' % i, 'date', default=request.now.date()))
    fields.append(Field('modified_by_id_%i' % i, db.auth_user, default=auth.user))

db.define_table('plint_table',
                Field('root', db.cross_table),
                Field('parent', db.vertical_table),
                Field('title', default=''),
                Field('numeration_start_1', 'boolean', default=True),
                Field('come_from', 'reference plint_table', ondelete='SET NULL'),
                Field('common_data', default=''),
                Field('modified_on', 'date', default=request.now.date()),
                Field('modified_by', db.auth_user, default=auth.user),                
                *fields                
               )

db.define_table('menu_table',
                Field('menu', 'json')
               )
