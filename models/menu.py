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
if db(db.menu_table).count():
    menuarray = XML(db.menu_table[1].menu)
else:
    menuarray = '[]'

if auth.has_membership('administrators'):
    response.toolsmenu = UL(LI(A(T('Tools'), _href='#'),
    UL(LI(A(I(_class="icon icon-upload"), _BACKUP_, _href=URL('default', 'backup')), _class="dropdown"),
LI(_class="divider"),
LI(A(I(_class="icon icon-download"), _RESTORE_, _href=URL('default', 'restore', args=['csv'])), _class="dropdown"),
LI(_class="divider"),
#LI(A(I(_class="icon icon-edit"), ' Import from txt', _href=URL('default', 'restore', vars=dict(mode='txt'))), _class="dropdown"),
LI(A(I(_class="icon icon-edit"), ' Import from txt', _href=URL('default', 'restore', args=['txt'])), _class="dropdown"),
LI(_class="divider"),
LI(A(I(_class="icon icon-remove"), ' Clear database', _href=URL('default', 'cleardb')), _class="dropdown"),
_class="dropdown-menu"), _class="dropdown"), _class="nav pull-right")

_q = request.get_vars.q if request.get_vars.q else ''
response.searchform = UL(LI(FORM(INPUT(_id="searchinput", _name="q", _value=_q, _class="input-medium search-query", _autocomplete="off", _oninput="getPairTitles(this.value)"),
                                 INPUT(_type="submit", _class="btn btn-inverse", _value=_SEARCH_),
                                 DIV(_id="ajaxpairresults"),
                                 _method="GET", _action=URL('search'))), _class="nav pull-right")
