# -*- coding: utf-8 -*-
from gluon.storage import Storage
import gluon.contrib.simplejson
cross_storage = Storage()

db.define_table('cross_table',
                Field('title', requires = IS_NOT_EMPTY()),
                Field('menu', 'json', readable = False, writable = False, requires = IS_JSON()),
               )

db.define_table('vertical_table',
                Field('parent', 'reference cross_table', requires = IS_IN_DB(db, 'cross_table.id', '%(title)s')),
                Field('title', requires = IS_NOT_EMPTY()),
                #Field('plints', 'list:reference plint_table', requires = IS_IN_DB(db, 'plint_table.id', multiple=True)),
               )

db.define_table('plint_table',
                Field('root', db.cross_table, readable = False, writable = False, requires = IS_IN_DB(db, 'cross_table.id', '%(title)s')),
                Field('parent', db.vertical_table, readable = False, writable = False),    # 'reference vertical_table'
                Field('title', requires = IS_NOT_EMPTY()),
                Field('numeration_start_1', 'boolean', default = True),
                Field('come_from', 'reference plint_table'),
                Field('common_data'),
                Field('modified_on', 'date', readable = False, writable = False),
                Field('modified_by', db.auth_user, readable = False, writable = False),

                Field('pair_id_0'),
                Field('loopback_id_0', 'boolean', default = False),
                Field('crossed_to_plint_id_0', 'reference plint_table'), #requires = IS_IN_DB(db, 'plint_table.id', '%(title)s')),
                Field('crossed_to_pair_id_0'), #requires = IS_INT_IN_RANGE(0, 10, error_message='Too small or too large!')),
                Field('modified_on_id_0', 'date', readable = False, writable = False),
                Field('modified_by_id_0', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_1'),
                Field('loopback_id_1', 'boolean', default = False),
                Field('crossed_to_plint_id_1', 'reference plint_table'),
                Field('crossed_to_pair_id_1'),
                Field('modified_on_id_1', 'date', readable = False, writable = False),
                Field('modified_by_id_1', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_2'),
                Field('loopback_id_2', 'boolean', default = False),
                Field('crossed_to_plint_id_2', 'reference plint_table'),
                Field('crossed_to_pair_id_2'),
                Field('modified_on_id_2', 'date', readable = False, writable = False),
                Field('modified_by_id_2', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_3'),
                Field('loopback_id_3', 'boolean', default = False),
                Field('crossed_to_plint_id_3', 'reference plint_table'),
                Field('crossed_to_pair_id_3'),
                Field('modified_on_id_3', 'date', readable = False, writable = False),
                Field('modified_by_id_3', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_4'),
                Field('loopback_id_4', 'boolean', default = False),
                Field('crossed_to_plint_id_4', 'reference plint_table'),
                Field('crossed_to_pair_id_4'),
                Field('modified_on_id_4', 'date', readable = False, writable = False),
                Field('modified_by_id_4', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_5'),
                Field('loopback_id_5', 'boolean', default = False),
                Field('crossed_to_plint_id_5', 'reference plint_table'),
                Field('crossed_to_pair_id_5'),
                Field('modified_on_id_5', 'date', readable = False, writable = False),
                Field('modified_by_id_5', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_6'),
                Field('loopback_id_6', 'boolean', default = False),
                Field('crossed_to_plint_id_6', 'reference plint_table'),
                Field('crossed_to_pair_id_6'),
                Field('modified_on_id_6', 'date', readable = False, writable = False),
                Field('modified_by_id_6', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_7'),
                Field('loopback_id_7', 'boolean', default = False),
                Field('crossed_to_plint_id_7', 'reference plint_table'),
                Field('crossed_to_pair_id_7'),
                Field('modified_on_id_7', 'date', readable = False, writable = False),
                Field('modified_by_id_7', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_8'),
                Field('loopback_id_8', 'boolean', default = False),
                Field('crossed_to_plint_id_8', 'reference plint_table'),
                Field('crossed_to_pair_id_8'),
                Field('modified_on_id_8', 'date', readable = False, writable = False),
                Field('modified_by_id_8', 'reference auth_user', readable = False, writable = False),

                Field('pair_id_9'),
                Field('loopback_id_9', 'boolean', default = False),
                Field('crossed_to_plint_id_9', 'reference plint_table'),
                Field('crossed_to_pair_id_9'),
                Field('modified_on_id_9', 'date', readable = False, writable = False),
                Field('modified_by_id_9', 'reference auth_user', readable = False, writable = False),
               )

def get_pair_crossed_info(plint, pair):
    lst = [0,0,0,0]
    if (plint > 0):
        lst[2] = int(plint)
        vert = db.vertical_table(plint.parent)
        lst[1] = int(vert)
        s1 = T('Crossed to ') + vert.title + ', ' + plint.title
        try:
            i = int(pair)
            if (i < 1) or (i > 10): raise Exception
            lst[3] = i
            s2 = int(pair) - (not(plint.numeration_start_1))
            lst[0] = s1 + ', ' + str(s2)
            return lst
        except Exception:
            lst[0] = s1
            return lst
    else:
        lst[0] = T('Not crossed.')
        return lst
