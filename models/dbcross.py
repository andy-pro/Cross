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

db.define_table('plint_table',
                Field('root', db.cross_table),
                Field('parent', db.vertical_table),
                Field('title', default=''),
                Field('numeration_start_1', 'boolean', default=True),
                Field('come_from', 'reference plint_table', ondelete='SET NULL'),
                Field('common_data', default=''),
                Field('modified_on', 'date', default=request.now.date()),
                Field('modified_by', db.auth_user, default=auth.user),

                Field('pair_id_1', default=''),
                Field('loopback_id_1', 'boolean', default=False),
                Field('crossed_to_plint_id_1', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_1', default=''),
                Field('modified_on_id_1', 'date', default=request.now.date()),
                Field('modified_by_id_1', db.auth_user, default=auth.user),

                Field('pair_id_2', default=''),
                Field('loopback_id_2', 'boolean', default=False),
                Field('crossed_to_plint_id_2', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_2', default=''),
                Field('modified_on_id_2', 'date', default=request.now.date()),
                Field('modified_by_id_2', db.auth_user, default=auth.user),

                Field('pair_id_3', default=''),
                Field('loopback_id_3', 'boolean', default=False),
                Field('crossed_to_plint_id_3', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_3', default=''),
                Field('modified_on_id_3', 'date', default=request.now.date()),
                Field('modified_by_id_3', db.auth_user, default=auth.user),

                Field('pair_id_4', default=''),
                Field('loopback_id_4', 'boolean', default=False),
                Field('crossed_to_plint_id_4', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_4', default=''),
                Field('modified_on_id_4', 'date', default=request.now.date()),
                Field('modified_by_id_4', db.auth_user, default=auth.user),

                Field('pair_id_5', default=''),
                Field('loopback_id_5', 'boolean', default=False),
                Field('crossed_to_plint_id_5', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_5', default=''),
                Field('modified_on_id_5', 'date', default=request.now.date()),
                Field('modified_by_id_5', db.auth_user, default=auth.user),

                Field('pair_id_6', default=''),
                Field('loopback_id_6', 'boolean', default=False),
                Field('crossed_to_plint_id_6', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_6', default=''),
                Field('modified_on_id_6', 'date', default=request.now.date()),
                Field('modified_by_id_6', db.auth_user, default=auth.user),

                Field('pair_id_7', default=''),
                Field('loopback_id_7', 'boolean', default=False),
                Field('crossed_to_plint_id_7', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_7', default=''),
                Field('modified_on_id_7', 'date', default=request.now.date()),
                Field('modified_by_id_7', db.auth_user, default=auth.user),

                Field('pair_id_8', default=''),
                Field('loopback_id_8', 'boolean', default=False),
                Field('crossed_to_plint_id_8', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_8', default=''),
                Field('modified_on_id_8', 'date', default=request.now.date()),
                Field('modified_by_id_8', db.auth_user, default=auth.user),

                Field('pair_id_9', default=''),
                Field('loopback_id_9', 'boolean', default=False),
                Field('crossed_to_plint_id_9', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_9', default=''),
                Field('modified_on_id_9', 'date', default=request.now.date()),
                Field('modified_by_id_9', db.auth_user, default=auth.user),

                Field('pair_id_10', default=''),
                Field('loopback_id_10', 'boolean', default=False),
                Field('crossed_to_plint_id_10', 'reference plint_table', ondelete='SET NULL'),
                Field('crossed_to_pair_id_10', default=''),
                Field('modified_on_id_10', 'date', default=request.now.date()),
                Field('modified_by_id_10', db.auth_user, default=auth.user),
               )

db.define_table('menu_table',
                Field('menu', 'json')
               )
