# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## Customize your APP title, subtitle and menus here
#########################################################################

response.logo = A(B('CROSS'), XML('&trade;&nbsp;'), _class="navbar-brand",_href=URL('default', 'index'), _id="cross-logo")
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
    (L._HOME_, False, URL('default', 'index#')),
    (L._NEWS_, False, URL('default', 'index#/vertical?news=true'))
]
#response.menu.append((T('Import DB'), False, URL('default', 'restore')))

if auth.has_membership('administrators'):
    response.toolsmenu = LI(A(L._TOOLS_, _href='#'),
        UL(LI(A(I(_class="glyphicon glyphicon-upload"), ' ', L._BACKUP_, _href=URL('default', 'backup'))),
        LI(A(I(_class="glyphicon glyphicon-download"), ' ', L._RESTORE_, _href=URL('default', 'restore', args=['csv']))), LI(_class="divider"),
        LI(A(I(_class="glyphicon glyphicon-import"), ' ', L._IMPORT_, _href=URL('default', 'restore'))),
        LI(A(I(_class="glyphicon glyphicon-warning-sign"), ' ', L._ADMIN_DB_, _href=URL('appadmin', 'index'))), LI(_class="divider"),
        LI(A(I(_class="glyphicon glyphicon-remove"), ' ', L._CLEAR_DB_, _href=URL('default', 'cleardb'))),
        _class="dropdown-menu"), _class="dropdown")
