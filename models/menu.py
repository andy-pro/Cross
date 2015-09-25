# -*- coding: utf-8 -*-
response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
response.menu = [
    (SPAN(B('CROSS',XML('&trade;&nbsp;')), _class='highlighted'), False, URL('default', 'index'))
]
response.menu.append((T('Cross'), False, ''))
menuarray = XML(db.menu_table[1].menu)
