# -*- coding: utf-8 -*-
from gluon.utils import web2py_uuid

def ajax_lexicon():
    return L

def http404():
    raise HTTP(404)

def index():
    return dict()

def ajax_index():
    #return dict(user=get_user_id(), crosses=dict((r.id, dict(title=r.title, verticals=dict((w.id, dict(title=w.title)) for w in db(db.vertical_table.parent == r.id).select() )))  for r in db(db.cross_table).select()))
    return {'user':get_user_id(), 'crosses':{r.id:{'title':r.title, 'verticals':{w.id:{'title':w.title} for w in db(db.vertical_table.parent == r.id).select()}} for r in db(db.cross_table).select()}}

def ajax_vertical():
    query = request.vars.search or False
    news = bool(request.vars.news)
    title = cross = ''
    if query:
        rows = search_plints(query)
        header = L._FNDRES_ % query if rows else '"%s" - %s' % (query, response.searchstatus)
    elif news:
        rows = db(db.plint_table).select(orderby=~db.plint_table.modon, limitby=(0, 20))
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
        if not request.edit_mode:   # in edit mode(see ajax_editvertical) pairs not needed,
            td = []
            old = plint.pmodon1
            idx = 0
            for i in xrange(0, 10):
                when = plint(pairfields[i][1])
                if news:
                    if when>old:    # searching newest pair
                        old = when
                        idx = i
                else:
                    pairtitle = plint(pairtitles[i])
                    who = plint(pairfields[i][2])
                    get_user_name(who)
                    td.append((pairtitle,when,who))
            if news:
                 td.append((plint(pairtitles[idx]),idx))
            tr['pairs'] = td
        if query or news:
            tr['root'] = (plint.root, plint.root.title)
            tr['parent'] = (plint.parent, plint.parent.title)
        plints.append(tr)
    return dict(user=get_user_id(), header=header, query=query, news=news, plints=plints, users=users, title=title, cross=cross)

def ajax_plints():
    return dict(data=[(i.id,i.title,int(i.start1)) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

def ajax_plintscd():    # add common data to response
    return dict(data=[(i.id,i.title,int(i.start1),i.comdata) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

@auth.requires_membership('managers')
def ajax_editcross():
    data = Cross(request.args(0, cast = int))
    return add_formkey(dict(header=data.header, title=data.title))

@auth.requires_membership('managers')
def ajax_editvertical():
    request.edit_mode = True;
    return add_formkey(ajax_vertical())

def comdict(data):
    return dict(header=data.header, address=data.address, modinfo=data.modified_info, title=data.title)

@auth.requires_membership('managers')
def ajax_editplint():
    data = Plint(request.args(0, cast = int))
    result = comdict(data)
    result.update(dict(pairtitles=('\n'.join(data.get_pair_titles())).rstrip(), start1=data.start1, comdata=data.comdata, vertical=data.vertical.index))
    return add_formkey(result)

@auth.requires_membership('managers')
def ajax_editpair():
    data = Pair(request.args(0, cast = int), request.args(1, cast = int))
    result = comdict(data)
    if (request.args(2) and test_query(data.title) and request.args(2, cast=str) == 'chain'):
        result['chain'] = getchain(data.title, True, '%s_%s' % (data.index, data.pair))
    result['vertical'] = data.plint.vertical.index
    return add_formkey(result)

@auth.requires_membership('managers')
def ajax_editfound():
    return add_formkey(ajax_vertical())

def add_formkey(data):
    s = request.function[5:]
    data.update(dict(formname=s, formkey=formUUID(s), user=get_user_id()))
    return data

def getchain(q, exclude=False, pairId=''):
    rows = search_plints(q)
    pairs = []
    for plint in rows:
        for i in xrange(0, 10):
            if plint(pairtitles[i]) ==q:
                if exclude:
                    if pairId == '%s_%s' % (plint.id, i+1):
                        exclude = False
                        continue
                pairs.append({'crossId':plint.root,
                              'verticalId':plint.parent,
                              'plintId':plint.id,
                              'pairId':i+1,
                              'title':plint['pid'+str(i+1)]})
    return pairs

def test_query(q):
    try: uq = unicode(q, 'utf-8')
    except: uq = q
    return len(uq) > 2

def search_plints(q, like=True):
    if q and test_query(q):
        if like:
            queries = [db.plint_table[field].contains(q, case_sensitive=True) for field in pairtitles]
        else:
            queries = [db.plint_table[field] == q for field in pairtitles]
        query = reduce(lambda a, b: (a | b), queries)
        result = db(query).select()
        response.searchstatus = 'OK' if result else 'not found!'
        return result
    else:
        response.searchstatus = 'too short query!'
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
    try:
        msg = ''
        formname = request.vars.formname
        formkey = request.vars.formkey
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
        if int(request.vars.user) != int(auth.user.id):
            msg = T('Access error!')
            raise
    except:
        return dict(status=False, details=msg if msg else T('Unexpected error!'))

    result = dict(status=True)
    if formname == 'editcross':
        # saveData from Edit Cross Controller
        cross = Cross(request.vars.cross)
        if request.vars.delete:
            cross.delete()
            result['location'] = '#'    # this will redirect to index/#
        else:
            vt = cross.update(request.vars)
            if vt: result['location'] = '#/editvertical/' + str(vt)
            request.vars.delete = bool(vt)
    elif formname == 'editvertical':
        # saveData from Edit Vertical Controller
        vertical = Vertical(request.vars.vertical)
        if request.vars.delete:
            vertical.delete()
            result['location'] = '#'    # this will redirect to index/#
        else:
            request.vars.delete = vertical.update(request.vars)
            result['location'] = '#/vertical/' + str(vertical.index)
    elif formname == 'editplint':
        plint = Plint(request.vars.plint)
        if request.vars.delete:
            plint.delete()
        else:
            request.vars.delete = plint.update(request.vars)
    elif formname == 'editpair' or formname == 'editfound':
        # saveData from Edit Found Controller, Edit Pair Controller
        if request.vars.chain: title = request.vars.title  # one title for all pairs, it's a chain
        idx = 0
        while(request.vars['cross_'+str(idx)] and idx < 1000):
            si = str(idx)
            idx += 1
            index = request.vars['plint_'+si]
            if (index):
                pid = request.vars['pair_'+si]
                if not request.vars.chain: # each pair has own title
                    title = request.vars['title_'+si]
                #print 'plint:%s pair:%s title:%s' % (index, pid, title)
                request.vars.delete = plint_update(index, {}, {pid : title})
    else:
        pass
    result['details'] = L._DB_UPD_ if request.vars.delete else L._NOCHANGE_
    return result

@auth.requires_membership('administrators')
#@auth.requires_membership('managers')
def restore():
    response.title = L._IMPORT_
    form = FORM(INPUT(_type='file', _name='fn'),
                INPUT(_type='submit', _class='pull-right btn-primary'))
    if form.process().accepted:
        try:
            f = form.vars.fn.file
            if f.name != None:  # is tmp file, txt
                f = import_from_txt1(f)
            db.import_from_csv_file(f, restore=True)
            msg = T('Database restored')
        except Exception as msg:
            pass
        session.flash = msg
        #redirect_updatemenu(URL('index'))
        redirect(URL('index'))
    response.view='default/dialog.html'
    return dict(form=form, title=L._IMPORT_)

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
