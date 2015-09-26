# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## Customize your APP title, subtitle and menus here
#########################################################################

response.logo = A(B('CROSS'), XML('&trade;&nbsp;'), _class="navbar-brand",_href=URL('index'), _id="cross-logo")
response.title = request.application.replace('_',' ').title()
response.subtitle = ''

## read more at http://dev.w3.org/html5/markup/meta.name.html
response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
response.meta.description = 'a cool new app'
response.meta.keywords = 'web2py, python, framework'
response.meta.generator = 'Web2py Web Framework'

## your http://google.com/analytics id
response.google_analytics_id = None

#########################################################################
## this is the main application menu add/remove items as required
#########################################################################

response.menu = [
    (T('Home'), False, URL('index#'), [])
]
response.menu.append((T('Import DB'), False, URL('default', 'restore')))


def updatemainarray():
    return [ [r.id, r.title, [ [w.id, w.title] for w in db(db.vertical.parent == r.id).select() ] ] for r in db(db.cross).select()]

#mainarray=XML(simplejson.dumps(updatemainarray()))

def redirect_updatemenu(url):
    updatemainarray()
    return redirect(url)
