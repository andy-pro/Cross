# -*- coding: utf-8 -*-

def index():
    items = db(db.cross_table).select()
    item_name = 'cross'
    response.view='review/cross.html'
    return locals()

def cross():
    rec_id = request.args(0, cast = int)
    items = db(db.vertical_table.parent == rec_id).select()
    item_name = 'vertical'
    response.menu.append((db.cross_table[rec_id].title, False, ''))
    return locals()

def vertical():
    rec_id = request.args(0, cast = int)
    rec = db.vertical_table[rec_id]
    parent = db.cross_table[rec.parent]
    vt = rec.title
    ct = parent.title
    response.title = '%s %s %s %s' % (_CROSS_, ct, _VERTICAL_, vt)
    verticalmainmenu = appendVerticalMenu(parent)
    response.menu.append((vt, False, ''))
    plints = db(db.plint_table.parent == rec_id).select()
    return {'plints': plints, 'verticalmainmenu': verticalmainmenu}

@auth.requires_login()
def plintmod():
    plint = Plint(request.args(0, cast = int))
    urlback = URL('vertical', args=[plint.vertical.id])
    verticalmainmenu = appendVerticalMenu(plint.cross)
    response.menu.append((plint.vertical.title, False, urlback))
    response.menu.append((plint.title, False, ''))
    response.title = plint.address
    form=FORM(UL(B(plint.header), HR(), I(plint.modified_info),
              (T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = plint.title, requires=IS_NOT_EMPTY())),
              (T('Common data:'), XML('&nbsp;&nbsp;'), INPUT(_name='common_data', _value = plint.common_data)),
              (T('Numeration start 1:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='numeration_start_1', value=plint.numeration_start_1)),
               HR(), B(plint.outside_info['title']),
               (T('Raplace common data:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='replace_common_data', value=True))),
              TABLE(TR(TD('Cross:'), TD('Vertical:'), TD('Plint:')),
                    TR(TD(SELECT([], _id='fromcrosssel', _name='from_cross', _size=_SIZE_)),
                       TD(SELECT([], _id='fromvertsel', _name='from_vert', _size=_SIZE_)),
                       TD(SELECT([], _id='fromplintsel', _name='from_plint', _size=_SIZE_))),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(B(T('Cross entire plint:')), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='crossall', value=False, _onclick='PlintCrossToggle(this)'), _colspan=3)),
                    TR(TD(DIV(TABLE(TR(TD('Vertical:'), TD('Plint:')),
                                    TR(TD(SELECT([], _id='vertsel', _name='cross_vert', _size=_SIZE_)),
                                       TD(SELECT([], _id='plintsel', _name='cross_plint', _size=_SIZE_)))
                                   ),
                              _class='sel_hide', _id='sel_cross_to'), _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(), TD(), TD(INPUT(_type='submit'))),
              _class='plintset'))
    if form.process().accepted:
        vars = (form.vars.title,
                bool(form.vars.numeration_start_1),
                form.vars.common_data,
                form.vars.from_plint,
                request.now.date(),
                auth.user,
                bool(form.vars.replace_common_data))
        plint.update(vars)
        redirect(urlback)
    #response.view='review/plint.html'
    #return locals()
    return {'plint': plint, 'form': form, 'crossed_info': [0,0,0,0], 'plintcrossindex': plint.cross.id, 'verticalmainmenu': verticalmainmenu}

@auth.requires_login()
def pairmod():
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    urlback = URL('vertical', args=[pair.plint.vertical.id])
    verticalmainmenu = appendVerticalMenu(pair.plint.cross)
    response.menu.append((pair.plint.vertical.title, False, urlback))
    response.menu.append((pair.plint.title, False, URL('plintmod', args=[pair.index])))
    response.title = pair.address
    form=FORM(UL(B(pair.header), HR(), I(pair.plint.modified_info),
              (T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = pair.title, requires=IS_NOT_EMPTY())),
              (T('Loop:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='loop', value=pair.loop)),
              HR(), B(T('Cross to:'))),
              TABLE(TR(TD('Vertical:'), TD('Plint:'), TD('Pair:')),
                    TR(TD(SELECT([], _id='vertsel', _name='cross_vert', _size=_SIZE_)),
                       TD(SELECT([], _id='plintsel', _name='cross_plint', _size=_SIZE_)),
                       TD(SELECT([], _id='pairsel', _name='cross_pair', _size=_SIZE_))),
                    TR(TD(pair.crossed_info[0], _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(), TD(), TD(INPUT(_type='submit'))),
              _class='plintset'))
    if form.process().accepted:
        vars = (form.vars.title,
                form.vars.cross_plint,
                form.vars.cross_pair,
                request.now.date(),
                auth.user,                
                bool(form.vars.loop))
        pair.update(vars)
        redirect(urlback)
    #response.view='review/plint.html'
    #return locals()
    return {'form': form, 'crossed_info': pair.crossed_info, 'plintcrossindex': pair.plint.cross.id, 'verticalmainmenu': verticalmainmenu}

def getPlintList():     # for AJAX request
    rows = db(db.plint_table.parent == int(request.vars.id)).select()
    plints = [[i.id, i.title, i.numeration_start_1] for i in rows]
    return gluon.contrib.simplejson.dumps({'plints': plints})

def appendVerticalMenu(cross):
    ci = cross.id
    response.menu.append((SPAN(cross.title, _id='verticalmainmenu'), False, URL('cross', args = [ci])))
    return ci
