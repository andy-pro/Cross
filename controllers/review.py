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
    response.title = '%s %s %s %s' % (_CROSS_, parent.title, _VERTICAL_, vt)
    response.menu.append(gluon.contrib.simplejson.loads(parent.menu))
    response.menu.append((vt, False, ''))
    plints = db(db.plint_table.parent == rec_id).select()
    return {'plints': plints}

@auth.requires_login()
def plintmod():
    plint = Plint(request.args(0, cast = int))
    crossed_info = [0,0,0,0]
    urlback = URL('vertical', args=[plint.vertical.index])
    response.menu.append(gluon.contrib.simplejson.loads(plint.cross.menu))
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
    div_class = 'plint'    # form width in css
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
    response.view='review/plint.html'
    return locals()
