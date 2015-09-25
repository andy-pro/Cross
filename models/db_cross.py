# -*- coding: utf-8 -*-

db.define_table('cross_table',
                Field('title', requires = IS_NOT_EMPTY()),
               )

db.define_table('vertical_table',
                Field('parent', 'reference cross_table'),
                Field('title', requires = IS_NOT_EMPTY()),
               )

db.define_table('plint_table',
                Field('root', db.cross_table, readable = False, writable = False),    # reference cross_table
                Field('parent', db.vertical_table, readable = False, writable = False),    # 'reference vertical_table'
                Field('title', requires = IS_NOT_EMPTY()),
                Field('numeration_start_1', 'boolean', default = True),
                Field('come_from', 'reference plint_table'),
                Field('common_data'),
                Field('modified_on', 'date', readable = False, writable = False),
                Field('modified_by', db.auth_user, readable = False, writable = False),

                Field('pair_id_0'),
                Field('loopback_id_0', 'boolean', default = False),
                Field('crossed_to_vertical_id_0', 'reference vertical_table'), #requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_0', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_0', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_0', 'date', readable = False, writable = False),
                Field('modified_by_id_0', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_1'),
                Field('loopback_id_1', 'boolean', default = False),
                Field('crossed_to_vertical_id_1', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_1', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_1', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_1', 'date', readable = False, writable = False),
                Field('modified_by_id_1', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_2'),
                Field('loopback_id_2', 'boolean', default = False),
                Field('crossed_to_vertical_id_2', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_2', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_2', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_2', 'date', readable = False, writable = False),
                Field('modified_by_id_2', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_3'),
                Field('loopback_id_3', 'boolean', default = False),
                Field('crossed_to_vertical_id_3', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_3', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_3', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_3', 'date', readable = False, writable = False),
                Field('modified_by_id_3', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_4'),
                Field('loopback_id_4', 'boolean', default = False),
                Field('crossed_to_vertical_id_4', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_4', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_4', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_4', 'date', readable = False, writable = False),
                Field('modified_by_id_4', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_5'),
                Field('loopback_id_5', 'boolean', default = False),
                Field('crossed_to_vertical_id_5', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_5', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_5', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_5', 'date', readable = False, writable = False),
                Field('modified_by_id_5', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_6'),
                Field('loopback_id_6', 'boolean', default = False),
                Field('crossed_to_vertical_id_6', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_6', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_6', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_6', 'date', readable = False, writable = False),
                Field('modified_by_id_6', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_7'),
                Field('loopback_id_7', 'boolean', default = False),
                Field('crossed_to_vertical_id_7', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_7', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_7', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_7', 'date', readable = False, writable = False),
                Field('modified_by_id_7', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_8'),
                Field('loopback_id_8', 'boolean', default = False),
                Field('crossed_to_vertical_id_8', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_8', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_8', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_8', 'date', readable = False, writable = False),
                Field('modified_by_id_8', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_9'),
                Field('loopback_id_9', 'boolean', default = False),
                Field('crossed_to_vertical_id_9', 'reference vertical_table', requires = IS_IN_DB(db, 'vertical_table.id', '%(title)s')),
                Field('crossed_to_plint_id_9', 'reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_9', requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_9', 'date', readable = False, writable = False),
                Field('modified_by_id_9', 'reference auth_user', readable = False, writable = False),
               )

def get_pair_crossed_info(rec_id, pair_id):
    rec = db.plint_table(rec_id)
    f_crosstovert = 'crossed_to_vertical_id_%d' % pair_id
    f_crosstoplint = 'crossed_to_plint_id_%d' % pair_id
    f_crosstopair = 'crossed_to_pair_id_%d' % pair_id
    try:
        sx = T('Not crossed.')
        s1 = db.vertical_table(rec(f_crosstovert)).title
        sx = T('Crossed to ') + s1
        s1 = db.plint_table(rec(f_crosstoplint)).title
        sx += ', ' + s1
        s1 = rec(f_crosstopair)
        sx += ', ' + s1
        return sx
    except Exception:
        return sx

def helperFunction(a):
    return a*a
