# -*- coding: utf-8 -*-
from gluon.utils import web2py_uuid

def ajax_lexicon():
    return L

def error():
    response.view='default/error.html'
    errors = (403,'Access denied'), (404,'Not found'), (500,'Internal server error')
    res = dict(x='', msg='Unknown error')
    try:
        error = request.args(0, cast = int)
    except:
        return res
    for x, msg in errors:
        if error==x:
            return dict(x=x, msg=msg)
    return res

def index():
    return dict()

def ajax_index():
    return {'crosses':{r.id:{'title':r.title, 'verticals':{w.id:{'title':w.title} for w in db(db.vertical_table.parent == r.id).select()}} for r in db(db.cross_table).select()}}

def ajax_vertical():
    query = request.vars.search or False
    #print query
    news = bool(request.vars.news)
    title = cross = ''
    if query:
        rows = search_plints(query)
        header = L._FNDRES_ % query if rows else '"%s" - %s' % (query, response.searchstatus)
    elif news:
        rows = db(db.plint_table).select(orderby=~db.plint_table.modon, limitby=(0, 50))
        header = L._LAST_MOD_
    else:
        vertical = Vertical(request.args(0, cast = int))
        title = vertical.title
        header = vertical.header
        cross = vertical.cross.title
        rows = db(db.plint_table.parent == vertical.index).select(orderby=db.plint_table.id)
    plints = []   #plints = {}
    for plint in rows:
        who = plint.modby
        get_user_name(who)
        tr={'id':plint.id,
            'title':plint.title,
            'start1':int(plint.start1),
            'comdata':plint.comdata,
            'modon':plint.modon,
            'modby':who.id}
        td = []
        old = plint.pmodon1
        idx = 0
        for i in xrange(0, 10):
            pairtitle = plint(pairtitles[i])
            when = plint(pairfields[i][1])
            if news:
                if when>old:    # searching newest pair
                    old = when
                    idx = i
            elif request.edit_mode:   # in edit mode(see ajax_editvertical) pairs whenwho not needed
                td.append(pairtitle)
            else:
                who = plint(pairfields[i][2])
                get_user_name(who)
                td.append((pairtitle,when,who))
        if news:
             td.append((plint(pairtitles[idx]),idx))
        tr['pairs'] = td
        if query or news: add_root(tr, plint)
        plints.append(tr)
    return dict(header=header, query=query, news=news, plints=plints, users=users, vertical=title, cross=cross)

def ajax_plints():
    return dict(data=[(i.id,i.title,int(i.start1)) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

def ajax_plintscd():    # add common data to response
    return dict(data=[(i.id,i.title,int(i.start1),i.comdata) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

@auth.requires_membership('managers')
def ajax_editcross():
    if request.vars.new:
        result = dict(header=L._NEW_CROSS_, new=True)
    else:
        data = Cross(request.args(0, cast = int))
        result = dict(header=data.header, title=data.title)
    return add_formkey(result)

@auth.requires_membership('managers')
def ajax_editvertical():
    request.edit_mode = True;
    return add_formkey(ajax_vertical())

def comdict(data):
    return dict(header=data.header, address=data.address, modinfo=data.modified_info, title=data.title, vertical=data.vertical.title, verticalId=data.vertical.index)

@auth.requires_membership('managers')
def ajax_editplint():
    data = Plint(request.args(0, cast = int))
    result = comdict(data)
    result.update(dict(pairtitles=('\n'.join(data.get_pair_titles())).rstrip(), start1=data.start1, comdata=data.comdata))
    return add_formkey(result)

@auth.requires_membership('managers')
def ajax_editpair():
    request.exclude = True
    return ajax_chain()

def ajax_chain():
    data = Pair(request.args(0, cast = int), request.args(1, cast = int))
    result = comdict(data)
    result['chain'] = getchain(data.title, request.exclude, '%s_%s' % (data.index, data.pair)) if (request.args(2) and test_query(data.title) and request.args(2, cast=str) == 'chain') else []
    return add_formkey(result)

@auth.requires_membership('managers')
def ajax_editfound():
    return add_formkey(ajax_vertical())

def add_formkey(data):
    s = request.function[5:]
    data.update(dict(formname=s, formkey=formUUID(s)))
    return data

def getchain(q, exclude=False, pairId=''):
    rows = search_plints(q, False)
    pairs = []
    for plint in rows:
        for i in xrange(0, 10):
            if plint(pairtitles[i]) == q:
                if exclude:
                    if pairId == '%s_%s' % (plint.id, i+1):
                        exclude = False
                        continue
                tr = {'plintId':plint.id, 'pairId':i+1, 'plint':plint.title, 'start1':int(plint.start1)}
                add_root(tr, plint)
                pairs.append(tr)
    return pairs

def test_query(q):
    try: uq = unicode(q, 'utf-8')
    except: uq = q
    return len(uq) > 2

def add_root(tr, plint):
    tr['cross'] = plint.root.title
    tr['crossId'] = plint.root
    tr['vertical'] = plint.parent.title
    tr['verticalId'] = plint.parent

def search_plints(q, like=True):
    if q and test_query(q):
        if like:
            queries = [db.plint_table[field].contains(q, case_sensitive=True) for field in pairtitles]
        else:
            queries = [db.plint_table[field] == q for field in pairtitles]
        query = reduce(lambda a, b: (a | b), queries)
        result = db(query).select()
        response.searchstatus = 'OK' if result else T('not found!')
        return result
    else:
        response.searchstatus = L._TOOSHORT_
        return []

def ajax_livesearch():     # live AJAX search
    q = request.vars.search
    plints = search_plints(q)
    items = []
    for plint in plints:
        for field in pairtitles:
            word = plint[field]
            if q in word and word not in items:
                items.append(word)
    items.sort()
    return dict(search=[item for item in items])

def formUUID(formname):
    formkey = web2py_uuid()
    keyname = '_formkey[%s]' % formname
    session[keyname] = list(session.get(keyname, []))[-9:] + [formkey]
    return formkey


@auth.requires_membership('managers')
def ajax_update():
    vars = request.vars
    try:
        msg = ''
        formname = vars.formname
        formkey = vars.formkey
        keyname = '_formkey[%s]' % formname
        formkeys = list(session.get(keyname, []))
        if formkey and formkeys and formkey in formkeys:  # check if user tampering with form and void CSRF
            session[keyname].remove(formkey)
        else:
            msg = T('Session expired!')
            raise   # usage of 'raise Exception(value)' calls 'TypeError ... is not JSON serializable' error
        if not auth.user:
            msg = T('UNAUTHORIZED!')
            raise
        if int(vars.user) != int(auth.user.id):
            msg = T('Access error!')
            raise
    except:
        return dict(status=False, details=msg if msg else T('Unexpected error!'))

    result = dict(status=True)
    if formname == 'editcross':
        # saveData from Edit Cross Controller
        if vars.new:
            idx = db.cross_table.update_or_insert(title=vars.title)
            vars.delete = bool(idx)
            if idx: result['location'] = '#/editcross/'+str(idx)
        else:
            cross = Cross(vars.cross)
            if vars.delete:
                cross.delete()
                result['location'] = '#'    # this will redirect to home page index/#
            else:
                vt = cross.update(vars)
                if vt: result['location'] = '#/editvertical/' + str(vt)
                vars.delete = bool(vt)
    elif formname == 'editvertical':
        # saveData from Edit Vertical Controller
        vertical = Vertical(vars.vertical)
        if vars.delete:
            vertical.delete()
            result['location'] = '#'
        else:
            vars.delete = vertical.update(vars)
            result['location'] = '#/vertical/' + str(vertical.index)
    elif formname == 'editplint':
        plint = Plint(vars.plint)
        if vars.delete:
            plint.delete()
        else:
            vars.delete = plint.update(vars)
    elif formname == 'editpair' or formname == 'editfound':
        # saveData from Edit Found Controller, Edit Pair Controller
        if vars.chain: title = vars.title  # one title for all pairs, it's a chain
        idx = 0
        while(vars['cross_'+str(idx)] and idx < 1000):
            si = str(idx)
            idx += 1
            index = vars['plint_'+si]
            if (index):
                pid = vars['pair_'+si]
                if not vars.chain: # each pair has own title
                    title = vars['title_'+si]
                #print 'plint:%s pair:%s title:%s' % (index, pid, title)
                vars.delete = plint_update(index, {}, {pid : title})
    else:
        pass
    result['details'] = L._DB_UPD_ if vars.delete else L._NOCHANGE_
    return result

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
#@auth.requires_membership('managers')
def restore():
    response.title = L._IMPORT_
    form = FORM(INPUT(_type='file', _name='fn'),
                INPUT(_type='submit', _class='pull-right btn-primary'))
    if form.process().accepted:
        try:
            f = form.vars.fn.file
            print f.name
            if f.name != None:  # is tmp file, txt
                if request.vars.mode != 'csv': f = import_from_txt1(f)
                if f:
                    db.import_from_csv_file(f, restore=True)
                    msg = T('Database restored')
            else:
                msg = L._ERROR_
        except Exception as msg:
            pass
        session.flash = msg
        redirect(URL('default', 'index'))
    response.view='default/user.html'
    return dict(form=form)

@auth.requires_membership('administrators')
def cleardb():
    db.plint_table.truncate()
    db.vertical_table.truncate()
    db.cross_table.truncate()
    session.flash = T('Database cleared')
    redirect(URL('index'))

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
