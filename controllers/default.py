# -*- coding: utf-8 -*-


def index():
    #updatemenu()
    items = db(db.cross_table).select()
    urlfunc = 'cross'
    response.view='default/cross.html'
    appendManageMenu()
    return locals()

def cross():
    cross = Cross(request.args(0, cast = int))
    items = db(db.vertical_table.parent == cross.index).select()
    urlfunc = 'vertical'
    response.title = cross.header
    appendManageMenu(cross.title)
    return locals()

def vertical():
    import time
    timestart = time.time()     # for Debug    
    vertical = Vertical(request.args(0, cast = int))
    response.title = vertical.header
    response.verticalmainmenu = appendVerticalMenu(vertical.cross)
    appendManageMenu(vertical.title)
    plints = db(db.plint_table.parent == vertical.index).select()
    return {'plints': plints, 'timestart': timestart}

@auth.requires_membership('managers')
def newcross():
    response.title = _NEW_CROSS_
    form = PFORM(_NEW_CROSS_, FTEXT(r=IS_NOT_EMPTY()), FOK())     
    if form.process().accepted:
        i = db.cross_table.update_or_insert(title=form.vars.title)
        redirect_updatemenu(URL('editcross', args = [i])) if i else redirect(URL('index'))
    response.view='default/newitem.html'
    return {'form': form}

@auth.requires_membership('managers')
def editcross():
    cross = Cross(request.args(0, cast = int))
    urlback = URL('cross', args=[cross.index])
    response.menu.append((cross.title, False, urlback))
    response.title = _EDIT_CROSS_ + ' ' + cross.title
    form = PFORM(cross.header,
                FTEXT(v=cross.title, r=IS_NOT_EMPTY()),
                FDEL(T('Delete cross')),
                FLABEL(B(T('Add vertical'))),
                FTEXT(n='child'),
                FOK())
    if form.process().accepted:
        if form.vars.delete:
            cross.delete()
            redirect_updatemenu(URL('index'))
        else:
            i = cross.update(form.vars.title, form.vars.child)
            redirect_updatemenu(URL('editvertical', args = [i])) if i else redirect_updatemenu(urlback)
    response.view='default/newitem.html'
    return {'form': form}    

@auth.requires_membership('managers')
def editvertical():
    vertical = Vertical(request.args(0, cast = int))
    urlback = URL('vertical', args=[vertical.index])
    response.verticalmainmenu = appendVerticalMenu(vertical.cross)
    response.menu.append((vertical.title, False, urlback))
    response.title = _EDIT_VERTICAL_ + ' ' + vertical.title
    response.outside_info = (0,0,0,0,0)
    form = PFORM(vertical.header,
                 FTEXT(v=vertical.title, r=IS_NOT_EMPTY()),
                 FDEL(T('Delete vertical')),
                 FLABEL(B(T('Add plint'))),
                 FTEXT( n='child', v='M%1', h=T('%1 is a count variable')),
                 FTEXT(T('Count:'), 'count', '0', r=IS_INT_IN_RANGE(0)),
                 FCDATA(''),
                 FSTART(True),
                 BCOME(_COME_FROM_),
                 FOK())    
    if form.process().accepted:
        if form.vars.delete:
            vertical.delete()
            redirect_updatemenu(URL('cross', args=[vertical.cross.index]))
        else:
            vertical.update(form.vars)
            redirect_updatemenu(urlback)        
    #response.view='default/editplint.html'
    return {'form': form}

@auth.requires_membership('managers')
def editplint():
    plint = Plint(request.args(0, cast = int))
    urlback = URL('vertical', args=[plint.vertical.index])
    response.verticalmainmenu = appendVerticalMenu(plint.cross)
    response.menu.append((plint.vertical.title, False, urlback))
    response.menu.append((plint.title, False, ''))
    response.title = plint.address
    response.crossed_info = (0,0,0,0)
    response.plintcrossindex = plint.cross.index
    response.outside_info = plint.outside_info
    form = PFORM(plint.header,
                 FLABEL(I(plint.modified_info)),
                 FTEXT(v=plint.title, r=IS_NOT_EMPTY()),
                 FDEL(T('Delete plint')),
                 FCDATA(plint.common_data),
                 FSTART(plint.numeration_start_1),
                 BCOME(plint.outside_info[0]),
                 FCHECK(T('Cross entire plint:'), 'crossall', False, '', 'PlintCrossToggle(this)'),
                 DIV(TABLE(DIV(TABLE(TR(TD(_VERTICAL_), TD(_PLINT_), TD(_TITLE_)),
                                     TR(get_select(0), get_select(1),
                                        TEXTAREA('\n'.join(plint.get_pair_titles()), _name='pairtitles', _rows='9', _wrap='off', _class='intotd'))),
                                     _class='sel_hide', _id='sel_cross_to')), _class='form-row'), FOK())    
    if form.process().accepted:
        if form.vars.delete:
            plint.delete()
        else:        
            plint.update_come_from(form.vars)
            if bool(form.vars.crossall):
                plint.update_crossing(form.vars)
        redirect(urlback)
    #return locals()
    return {'form': form}

@auth.requires_membership('managers')
def editpair():
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    urlback = URL('vertical', args=[pair.plint.vertical.index])
    response.verticalmainmenu = appendVerticalMenu(pair.plint.cross)
    response.menu.append((pair.plint.vertical.title, False, urlback))
    response.menu.append((pair.plint.title, False, URL('editplint', args=[pair.index])))
    response.title = pair.address
    response.crossed_info = pair.crossed_info
    response.plintcrossindex = pair.plint.cross.index
    form = PFORM(pair.header,
                 FLABEL(I(pair.modified_info)),
                 FTEXT(v=pair.title),
                 FCHECK(_LOOP_, 'loop', pair.loop),
                 FLABEL(B(_CROSS_TO_)),
                 FCHECK(_REPLACE_TITLE_, 'replace_title', True, T("Autofill 'Title' field")),
                 DIV(TABLE(TR(TD(_VERTICAL_), TD(_PLINT_), TD(_PAIR_)),
                           TR(get_select(0), get_select(1), get_select(2))), _class='form-row'),
                 FLABEL(pair.crossed_info[0]),
                 FOK())
    if form.process().accepted:
        pair.update(form.vars)
        redirect(urlback)
    return {'form': form}

@auth.requires_membership('administrators')
def backup():
    import gluon.contenttype
    import cStringIO
    stream=cStringIO.StringIO()
    #db(db.cross_table.id).select().export_to_csv_file(stream)
    db.export_to_csv_file(stream)
    response.headers['Content-Type'] = gluon.contenttype.contenttype('.csv')
    response.headers['Content-disposition'] = 'attachment; filename=dbcross-%s.csv' % request.now.date()
    return stream.getvalue()

@auth.requires_membership('administrators')
def restore():
    response.title = _NEW_CROSS_
    form = PFORM(T('Import database'),
                 DIV(INPUT(_type='file',_name='csvfile'), _class='form-row'),
                 DIV(INPUT(_type='submit',_value='Upload', _class='default'), _class='submit-row'))     
    if form.process().accepted:
        try:
            f = request.vars.csvfile.file
            for table in db.tables:
                db[table].truncate()
            #db.cross_table.truncate()
            #db.cross_table.import_from_csv_file(f)
            db.import_from_csv_file(form.vars.csvfile.file)
            m = T('Database restored')
        except:
            m = _ERROR_
        session.flash = m
        redirect_updatemenu(URL('index'))
    response.view='default/newitem.html'
    return {'form': form}    

def ajax_getPlintList():     # for AJAX request
    rows = db(db.plint_table.parent == int(request.vars.id)).select()
    plints = [[i.id, i.title, i.numeration_start_1] for i in rows]
    return gluon.contrib.simplejson.dumps({'plints': plints})

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/manage_users (requires membership in
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()

@auth.requires_login() 
def api():
    """
    this is example of API with access control
    WEB2PY provides Hypermedia API (Collection+JSON) Experimental
    """
    from gluon.contrib.hypermedia import Collection
    rules = {
        '<tablename>': {'GET':{},'POST':{},'PUT':{},'DELETE':{}},
        }
    return Collection(db).process(request,response,rules)
