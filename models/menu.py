# -*- coding: utf-8 -*-

def makemenu():
    m = [ [r.id, r.title, [ [w.id, w.title] for w in db(db.vertical_table.parent == r.id).select() ] ] for r in db(db.cross_table).select()]
    db.menu_table.truncate()
    db.menu_table.insert(menu = gluon.contrib.simplejson.dumps(m))
    return

response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
response.menu = [(SPAN(B('CROSS',XML('&trade;&nbsp;')), _class='highlighted'), False, URL('index'))]
# <li> type parent of element with id='crossmainmenu' will be complemented by a dropdown menu
response.menu.append((SPAN(_CROSS_, _id='crossmainmenu'), False, URL('index')))
# rendering menu from db to template layout.html
menuarray = XML(db.menu_table[1].menu)
