# -*- coding: utf-8 -*-

db.define_table('cross_table',
                #Field('index', 'integer'),
                Field('title', requires = IS_NOT_EMPTY()),
               )

db.define_table('vertical_table',
                Field('cross_table', 'reference cross_table'),
                Field('title', requires = IS_NOT_EMPTY()),
               )

db.define_table('plint_table',
                Field('cross_table', 'reference cross_table',readable = False, writable = False),
                Field('vertical_table', 'reference vertical_table',readable = False, writable = False),
                Field('title', requires = IS_NOT_EMPTY()),
                Field('numeration_start_1', 'boolean', default = True),
                Field('come_from', 'reference plint_table'),
                Field('common_data'),
                Field('modified_on', 'date',readable = False, writable = False),
                Field('modified_by', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_0'),
                Field('loopback_id_0', 'boolean', default = False),
                Field('modified_on_id_0', 'date',readable = False, writable = False),
                Field('modified_by_id_0', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_1'),
                Field('loopback_id_1', 'boolean', default = False),
                Field('modified_on_id_1', 'date',readable = False, writable = False),
                Field('modified_by_id_1', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_2'),
                Field('loopback_id_2', 'boolean', default = False),
                Field('modified_on_id_2', 'date',readable = False, writable = False),
                Field('modified_by_id_2', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_3'),
                Field('loopback_id_3', 'boolean', default = False),
                Field('modified_on_id_3', 'date',readable = False, writable = False),
                Field('modified_by_id_3', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_4'),
                Field('loopback_id_4', 'boolean', default = False),
                Field('modified_on_id_4', 'date',readable = False, writable = False),
                Field('modified_by_id_4', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_5'),
                Field('loopback_id_5', 'boolean', default = False),
                Field('modified_on_id_5', 'date',readable = False, writable = False),
                Field('modified_by_id_5', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_6'),
                Field('loopback_id_6', 'boolean', default = False),
                Field('modified_on_id_6', 'date',readable = False, writable = False),
                Field('modified_by_id_6', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_7'),
                Field('loopback_id_7', 'boolean', default = False),
                Field('modified_on_id_7', 'date',readable = False, writable = False),
                Field('modified_by_id_7', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_8'),
                Field('loopback_id_8', 'boolean', default = False),
                Field('modified_on_id_8', 'date',readable = False, writable = False),
                Field('modified_by_id_8', 'reference auth_user',readable = False, writable = False),

                Field('pair_id_9'),
                Field('loopback_id_9', 'boolean', default = False),
                Field('modified_on_id_9', 'date',readable = False, writable = False),
                Field('modified_by_id_9', 'reference auth_user',readable = False, writable = False),
               )
