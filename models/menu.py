# -*- coding: utf-8 -*-

def updatemenu():
    m = [ [r.id, r.title, [ [w.id, w.title] for w in db(db.vertical_table.parent == r.id).select() ] ] for r in db(db.cross_table).select()]
    db.menu_table.truncate()
    db.menu_table.insert(menu = gluon.contrib.simplejson.dumps(m))

def redirect_updatemenu(url):
    updatemenu()
    return redirect(url)

def appendVerticalMenu(cross):
    response.menu.append((SPAN(cross.title, _id='verticalmainmenu'), False, URL('cross', args = [cross.index])))
    return cross.index

def appendManageMenu(m=''):
    if auth.has_membership('managers'):
        response.menu.append(m and (_EDIT_ + m, False, URL('edit'+request.function , args = request.args)) or (_NEW_CROSS_, False, URL('newcross')))
    else:
        if m:
            response.menu.append((m, False, ''))

response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
response.menu = [(SPAN(B('CROSS',XML('&trade;&nbsp;')), _class='highlighted'), False, URL('index'))]
# <li> type parent of element with id='crossmainmenu' will be complemented by a dropdown menu
response.menu.append((SPAN(_CROSS_, _id='crossmainmenu'), False, URL('index')))
# rendering menu from db to template layout.html
menuarray = XML(db.menu_table[1].menu)

if auth.has_membership('administrators'):
    response.toolsmenu = UL(LI(A(T('Tools'), _href='#'),
                               UL(LI(A(_BACKUP_, _href=URL('default', 'backup')), _class="dropdown"),
                                  LI(_class="divider"),
                                  LI(A(_RESTORE_, _href=URL('default', 'restore')), _class="dropdown"),
                                  _class="dropdown-menu"),
                               _class="dropdown"), _class="nav pull-right")
