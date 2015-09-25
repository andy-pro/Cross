# -*- coding: utf-8 -*-
response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
cross_list = []
cross_items = db(db.cross_table).select()
for cross_item in cross_items:
    idx = cross_item.id
    vertical_list = []
    #vertical_items = db(db.vertical_table.cross_table == idx).select()
    #for vertical_item in vertical_items:
    #    vertical_list.append((vertical_item.title, False, URL('default', 'vertical', args=vertical_item.id)))
    cross_list.append((cross_item.title, False, URL('default', 'cross', args=idx), vertical_list))
response.menu = [
    (SPAN(B('CROSS',XML('&trade;&nbsp;')), _class='highlighted'), True, URL('default', 'index'), cross_list),
    #(T('Кросс'), False, '', cross_list)
]

if (request.function == 'cross'):
    idx = request.args(0, cast = int)
    response.menu.append((cross_list[idx-1][0], False, ''))

if (request.function == 'vertical'):
    vertical_item = db.vertical_table(request.args(0, cast = int))
    t = vertical_item.title
    idx = vertical_item.cross_table
    vertical_list = []
    vertical_items = db(db.vertical_table.cross_table == idx).select()
    for vertical_item in vertical_items:
        vertical_list.append((vertical_item.title, False, URL('default', 'vertical', args=vertical_item.id)))
    response.menu.append((cross_list[idx-1][0], False, '', vertical_list))
    response.menu.append((t, False, ''))

if auth.has_membership('managers'):
    p = request.env.path_info.split('/')
    #response.flash = p[3]
    functuple = 'index', 'cross', 'vertical'
    if p[3] in functuple:
        response.menu.append((T('Manage'), False, URL('default', 'manage', args = p[3:])))
