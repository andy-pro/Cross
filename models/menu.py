# -*- coding: utf-8 -*-
response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
cross_list = []
#cross_items = db(db.cross_table).select()
#for cross_item in cross_items:
for cross_item in db(db.cross_table).select():
    #================================calculating menu from database
    '''    idx = cross_item.id
    vertical_list = []
    #=================
    vertical_items = db(db.vertical_table.parent == idx).select()
    for vertical_item in vertical_items:
        vertical_list.append((vertical_item.title, False, URL('default', 'vertical', args=vertical_item.id)))
    #=================
    i = (cross_item.title, False, URL('default', 'cross', args=idx), vertical_list)
    a1 = gluon.contrib.simplejson.dumps(i)
    #cross_item.update_record(menu=a1)    # uncomment for update menu fields
    #i = gluon.contrib.simplejson.loads(a1)
    cross_list.append(i)
    #cross_list.append((cross_item.title, False, URL('default', 'cross', args=idx), vertical_list))
    '''
    #==================loading ready menu from fields of database
    cross_list.append(gluon.contrib.simplejson.loads(cross_item.menu))
    #------------------
response.menu = [
    (SPAN(B('CROSS',XML('&trade;&nbsp;')), _class='highlighted', _id='mainmenu'), True, URL('default', 'index'), []),#cross_list),
    #(T('Кросс'), False, '', cross_list)
]

#if auth.has_membership('managers'):
    #p = request.env.path_info.split('/')
    #response.flash = p[3]
    #functuple = 'index', 'cross', 'vertical'
    #if p[3] in functuple:
    #    response.menu.append((T('Manage'), False, URL('default', 'manage', args = p[3:])))
