# -*- coding: utf-8 -*-

def index():
    updatemenu()
    items = db(db.cross_table).select()
    response.view='default/cross.html'
    appendManageMenu()
    return {'table': get_index_table(items, 'cross')}

def cross():
    cross = Cross(request.args(0, cast = int))
    items = db(db.vertical_table.parent == cross.index).select()
    response.title = cross.header
    appendManageMenu(cross.title)
    return {'table': get_index_table(items, 'vertical')}

def vertical():
    tm = TimeMeter()     # for Debug
    vertical = Vertical(request.args(0, cast = int))
    response.title = vertical.header
    response.verticalmainmenu = appendVerticalMenu(vertical.cross)
    appendManageMenu(vertical.title)
    plints = db(db.plint_table.parent == vertical.index).select()
    tm.append('DB query')
    table = get_vertical_table(plints)    # <col span="10" class="coln">
    #response.timemeter = tm.show('Rendering table')
    return {'table': table}

def max():
    rows = db(db.plint_table).select()
    max = ''
    for row in rows:
        for i in xrange(0, 10):
            pairtitle = row(pairtitles[i])
            if len(pairtitle) > len(max):
                max = pairtitle
                plint = row.title
                cross = row.root.title
                vertical = row.parent.title
    return dict(max=max, length=len(max), plint=plint, root=cross, parent=vertical)

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
    response.verticalmainmenu = appendVerticalMenu(cross)
    #response.menu.append((cross.title, False, urlback))
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
    response.plintoutside = True
    response.view='default/edititem.html'
    response.files.append(URL('static','js/plintmain.js'))
    form = PFORM(vertical.header,
                 FTEXT(v=vertical.title, r=IS_NOT_EMPTY()),
                 FDEL(T('Delete vertical')),
                 FLABEL(B(T('Add plint'))),
                 FTEXT( n='child', v='M%1', h=T('%1 is a count variable')),
                 FTEXT(T('Count:'), 'count', '0', r=IS_INT_IN_RANGE(0)),
                 FCDATA(''),
                 FSTART(True),
                 BCOME(_COME_FROM_),
                 ANIME, FOK())
    if form.process().accepted:
        if form.vars.delete:
            vertical.delete()
            redirect_updatemenu(URL('cross', args=[vertical.cross.index]))
        else:
            vertical.update(form.vars)
            redirect_updatemenu(urlback)
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
    response.plintoutside = True
    response.pairoutside = True
    response.view='default/edititem.html'
    response.files.append(URL('static','js/plintmain.js'))
    form = PFORM(plint.header,
                 FLABEL(I(plint.modified_info)),
                 FTEXT(v=plint.title, r=IS_NOT_EMPTY()),
                 FDEL(T('Delete plint')),
                 FCDATA(plint.comdata),
                 FSTART(plint.start1),
                 BCOME(plint.outside_info[0]),
                 FCHECK(T('Cross entire plint:'), 'crossall', False, '', 'PlintCrossToggle(this)'),
                 DIV(TABLE(DIV(TABLE(TR(TD(_VERTICAL_), TD(_PLINT_), TD(_TITLE_)),
                                     TR(get_select(0), get_select(1),
                                        TEXTAREA('\n'.join(plint.get_pair_titles()), _name='pairtitles', _rows=str(_SIZE_-1), _wrap='off', _class='intotd'))),
                                     _class='sel_hide', _id='sel_cross_to')), _class='form-row'), ANIME, FOK())
    if form.process().accepted:
        if form.vars.delete:
            plint.delete()
        else:
            plint.update_comefrom(form.vars)
            #if bool(form.vars.crossall):
            #c=form.vars.crossall
            if form.vars.crossall:
                plint.update_crossing(form.vars)
        redirect(urlback)
    #return locals()
    return {'form': form}

@auth.requires_membership('managers')
def editpair():
    print request
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    urlback = URL('vertical', args=[pair.plint.vertical.index])
    response.verticalmainmenu = appendVerticalMenu(pair.plint.cross)
    response.menu.append((pair.plint.vertical.title, False, urlback))
    response.menu.append((pair.plint.title, False, URL('editplint', args=[pair.index])))
    response.title = pair.address
    response.crossed_info = pair.crossed_info
    response.plintcrossindex = pair.plint.cross.index
    response.pairoutside = True
    response.view='default/edititem.html'
    response.files.append(URL('static','js/plintmain.js'))
    form = PFORM(pair.header,
                 FLABEL(I(pair.modified_info)),
                 FTEXT(v=pair.title),
                 FCHECK(_LOOP_, 'loop', pair.loop),
                 FLABEL(B(_CROSS_TO_)),
                 FCHECK(_REPLACE_TITLE_, 'replace_title', True, T("Autofill 'Title' field")),
                 DIV(TABLE(TR(TD(_VERTICAL_), TD(_PLINT_), TD(_PAIR_)),
                           TR(get_select(0), get_select(1), get_select(2))), _class='form-row'),
                 FLABEL(pair.crossed_info[0]),
                 ANIME, FOK())
    if form.process().accepted:
        pair.update(form.vars)
        redirect(urlback)
    return {'form': form}

@auth.requires_membership('administrators')
def backup():
    import gluon.contenttype
    import cStringIO
    stream=cStringIO.StringIO()
    print >> stream, 'TABLE cross_table'
    db(db.cross_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nTABLE vertical_table'
    db(db.vertical_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nTABLE plint_table'
    db(db.plint_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nEND'
    #db.export_to_csv_file(stream)  # all tables
    response.headers['Content-Type'] = gluon.contenttype.contenttype('.csv')
    response.headers['Content-disposition'] = 'attachment; filename=dbcross-%s.csv' % request.now.date()
    return stream.getvalue()

@auth.requires_membership('administrators')
def restore():
    m = request.args(0)
    response.title = _RESTORE_
    form = PFORM(T('Import database from '+m),
                 #DIV(INPUT(_type='file',_name=request.vars.mode), _class='form-row'),
                 DIV(INPUT(_type='file',_name=m), _class='form-row'),
                 DIV(INPUT(_type='submit',_value='Upload', _class='pull-right'), _class='submit-row'))
    if form.process().accepted:
        try:
            if form.vars.csv != None:
                csvfile = form.vars.csv.file
                print type(csvfile)
            elif form.vars.txt != None:
                txtfile = form.vars.txt.file
                csvfile = import_from_txt1(txtfile)
            if csvfile:
                db.import_from_csv_file(csvfile, restore=True)
                m = T('Database restored')
        except:
            m = _ERROR_
        session.flash = m
        redirect_updatemenu(URL('index'))
    response.view='default/newitem.html'
    return {'form': form}
'''
@auth.requires_membership('administrators')
def restorecsv():
    form = restoreview('csv')
    if form.process().accepted:
        try:
            db.import_from_csv_file(form.vars.csv.file, restore=True)
            m = T('Database restored')
        except:
            m = _ERROR_
        session.flash = m
        redirect_updatemenu(URL('index'))
    return {'form': form}

@auth.requires_membership('administrators')
def restoretxt():
    form = restoreview('txt')
    if form.process().accepted:
        try:
            csvfile = convert_txt_to_db(form.vars.txt.file)
            db.import_from_csv_file(csvfile, restore=True)
            m = T('Database restored')
        except:
            m = _ERROR_
        session.flash = m
        redirect_updatemenu(URL('index'))
    return {'form': form}

def restoreview(f):
    response.title = _RESTORE_
    response.view = 'default/newitem.html'
    form = PFORM(T('Import database'),
                 DIV(INPUT(_type='file', _name=f, _class='form-row')),
                 DIV(INPUT(_type='submit',_value='Upload', _class='pull-right'), _class='submit-row'))
    return form
'''
@auth.requires_membership('administrators')
def cleardb():
    db.cross_table.truncate()
    db.vertical_table.truncate()
    db.plint_table.truncate()
    session.flash = 'Database cleared'
    redirect_updatemenu(URL('index'))

def search():
    tm = TimeMeter()     # for Debug
    q = request.get_vars.q
    if q == None:
        q = ''
    try:
        uq = unicode(q, 'utf-8')
    except:
        uq = q
    if len(uq) > 2:
        response.title = T('Search result for "%s"') % q
        plints = search_plints(q)
    else:
        response.flash = 'Too short query!'
        plints = []
    response.view='default/vertical.html'
    tm.append('DB query')
    table = get_vertical_table(plints, parents=True)
    #response.timemeter = tm.show('Rendering table')
    if plints:
        response.files.append(URL('static','js/drawpull.js'))
        response.drawpull = True
    return {'table': table}

def ajax_getPairData():     # for AJAX search
    q = request.vars.likestr
    plints = search_plints(q)
    items = []
    for plint in plints:
        for field in pairtitles:
            word = plint[field]
            if q in word and word not in items:
                items.append(word)
    items.sort()
    w = [DIV(A(item, _class="ajaxresult", _href="#")) for item in items]
    return TAG[''](*w)

def ajax_getPlintList():     # for AJAX plint list
    rows = db(db.plint_table.parent == int(request.vars.id)).select()
    plints = [[i.id, i.title, i.start1] for i in rows]
    return gluon.contrib.simplejson.dumps({'plints': plints})

def search_plints(q):
    queries = [db.plint_table[field].contains(q, case_sensitive=False) for field in pairtitles]
    query = reduce(lambda a, b: (a | b), queries)
    return db(query).select()

def get_index_table(items, f):
    rec = len(items)
    if rec == 0: row = 1
    elif rec > 20: row = 4 + (rec-10)/10
    else: row = rec
    col = int(rec / row)
    if rec < row: row = rec
    tr = []
    for j in range(0, row):
        td = []
        for k in range(0, col + 1):
            idx = k * row + j
            if idx < rec: a = TD(A(items[idx].title, _href = URL(f, args = items[idx].id)), _class='colc1')
            else: a = ''
            td.append(a)
        tr.append(TR(td))
    return TABLE(tr, _class='table table-condensed')

def get_vertical_table(plints, parents=False):
    tr = []
    #a_attr = {'_data-toggle': 'tooltip', '_data-placement': 'bottom' }
    for plint in plints:
        a_attr = {}
        td = []
        if parents:
            s1 = plint.root.title
            td.append(TD(A(s1, _href=URL('cross', args = [plint.root]), _title=_CROSS_+' '+s1), _class="colv0"))
            s1 = plint.parent.title
            td.append(TD(A(s1, _href=URL('vertical', args = [plint.parent]), _title=_VERTICAL_+' '+s1), _class="colv1"))
        dx = 0 if plint.start1 else -1
        comefrom = get_plint_outside_info(plint)
        s1 = _COMMON_DATA_ + str(plint.comdata)
        who = get_user_name(plint.modby)
        a_attr['_title'] = _PLINT_+' %s\n%s\n%s\n%s\n%s' % (plint.title, plint.modon, who, s1, comefrom[0])
        a_attr['_href'] = _href=URL('editplint', args = [plint.id])
        td.append(TD(A(plint.title, **a_attr), _class="colv1"))
        for i in xrange(0, 10):
            a_attr = {}
            td_attr = {}
            pairtitle = plint(pairtitles[i])
            start = i+dx+1
            tdcl = ''
            if pairtitle:
                when = plint(pairfields[i][3])
                who = get_user_name(plint(pairfields[i][4]))
                crossedto = get_pair_crossed_info(plint(pairfields[i][1]), plint(pairfields[i][2]))
                a_attr['_title'] = '%s\n%s\n%s\n%s' % (pairtitle, when, who, crossedto[0])
                if request.get_vars.q and request.get_vars.q in pairtitle:
                    tdcl = 'finded'
                    if crossedto[2] and crossedto[3]:
                        a_attr['_id'] = 'p%im%i' % (crossedto[3], crossedto[2])
                if plint(pairfields[i][5]):
                    tdcl += ' loop'
                if tdcl:
                    td_attr = {'_class': tdcl}
            a_attr['_href'] = _href=URL('editpair', args = [plint.id, i+1])
            td.append(TD(A(XML('<sup>%s&nbsp;&nbsp;</sup>%s' % (start, pairtitle)), **a_attr), **td_attr))
        tdcl = 'commondata'
        if request.get_vars.q and request.get_vars.q in plint.comdata:
            tdcl += ' cdfinded'
        td.append(TD(plint.comdata, _class=tdcl, _style="border-left: 2px solid #ccc;"))
        tr.append(TR(td))
    return TABLE(tr, _class='cross')

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
