# -*- coding: utf-8 -*-

from gluon.utils import web2py_uuid

def index():
    return dict()

def ajax_getindexdata():
    crosses = dict((r.id, dict(title=r.title, verticals=dict((w.id, dict(title=w.title)) for w in db(db.vertical_table.parent == r.id).select() )))  for r in db(db.cross_table).select())
    return dict(crosses=crosses, user=get_user_id())

def ajax_getverticaldata():
    #print request
    query = request.vars.search
    if query:
        #print query
        rows = search_plints(query)
        vertical_id = False
        title = ''
        header = T('Search result for "%s"') % query if rows else 'Too short query!'
    else:
        query = False
        vertical = Vertical(request.args(0, cast = int))
        vertical_id = vertical.index
        title = vertical.title
        header = vertical.header
        rows = db(db.plint_table.parent == vertical_id).select(orderby=db.plint_table.id)
    plints = []   #plints = {}
    for plint in rows:
        td = []
        for i in xrange(0, 10):
            pairtitle = plint(pairtitles[i])
            when = plint(pairfields[i][1])
            who = plint(pairfields[i][2])
            get_user_name(who)
            td.append((pairtitle,when,who))
        get_user_name(plint.modby)
        tr={'id':plint.id,
            'title':plint.title,
            'start1':int(plint.start1),
            'comdata':plint.comdata,
            'modon':plint.modon,
            'modby':plint.modby,
            'pairs':td}
        if query:
            tr['root'] = [plint.root, plint.root.title]
            tr['parent'] = [plint.parent, plint.parent.title]
        plints.append(tr)
    result = dict(header=header, query=query, plints=plints, users=users, vertical=vertical_id, title=title)
    if query and rows:
        formname = 'editfound'
        result['formname'] = 'editfound'
        result['formkey'] = formUUID(formname)
    result['user'] = get_user_id()
    return result

def getplintlist(rows): # rows to list convert
    return [(i.id,i.title,int(i.start1)) for i in rows]

def ajax_getplints():
    rows = db(db.plint_table.parent == request.args(0, cast = int)).select(db.plint_table.id, db.plint_table.title, db.plint_table.start1, orderby=db.plint_table.id)
    return dict(data=getplintlist(rows)) # for dict of tuples of tuples

@auth.requires_membership('managers')
def ajax_getpairdata():
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    formname = 'editpair'
    formkey = formUUID(formname)
    #print session
    result = dict(header=pair.header, address=pair.address, modinfo=pair.modified_info, title=pair.title, formkey=formkey, formname=formname)
    if (request.args(2) and test_query(pair.title) and request.args(2, cast=str) == 'chain'):
        result['chain'] = getchain(pair.title, True, '%s_%s' % (pair.index, pair.pair))
    return result

def getchain(q, exclude=False, pairId=''):
    queries = [db.plint_table[field] == q for field in pairtitles]
    query = reduce(lambda a, b: (a | b), queries)
    rows = db(query).select()
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



def formUUID(formname):
    formkey = web2py_uuid()
    keyname = '_formkey[%s]' % formname
    session[keyname] = list(session.get(keyname, []))[-9:] + [formkey]
    return formkey

def ajax_getCrossList():
    #return dict(crosses = db(db.cross_table).select().as_list())
    rows = db(db.cross_table).select()
    #crosses = [dict(id=0, title=_NOT_CROSSED_)] + [dict(id=i.id, title=i.title) for i in rows]
    items = [(0,_NOT_CROSSED_)] + [(i.id,i.title) for i in rows]
    return dict(items=items)

def ajax_getVerticalList():
    rows = db(db.vertical_table.parent == request.args(0, cast = int)).select()
    items = [(i.id,i.title) for i in rows]
    return dict(items=items)

def ajax_getPairList():
    vertical = Vertical(request.args(0, cast = int))
    plints = db(db.plint_table.parent == vertical.index).select()
    items = []
    pairs = []
    for plint in plints:
        get_user_name(plint.modby)
        items.append((plint.id,plint.title,int(plint.start1),plint.comdata,plint.modon,plint.modby))
        td = []
        for i in xrange(0, 10):
            pairtitle = plint(pairtitles[i])
            when = plint(pairfields[i][1])
            who = plint(pairfields[i][2])
            get_user_name(who)
            td.append((pairtitle,when,who))
        pairs.append(td)
    return dict(title=vertical.header,items=items, pairs=pairs, users=users)

def ajax_getLiveSearch():     # live AJAX search
    q = request.vars.likestr
    plints = search_plints(q)
    items = []
    for plint in plints:
        for field in pairtitles:
            word = plint[field]
            if q in word and word not in items:
                items.append(word)
    items.sort()
    return dict(search=[item for item in items])

def test_query(q):
    try: uq = unicode(q, 'utf-8')
    except: uq = q
    return len(uq) > 2

def search_plints(q):
    if q == None: q = ''
    if test_query(q):
        #queries = [db.plint_table[field].contains(q, case_sensitive=False) for field in pairtitles]
        queries = [db.plint_table[field].contains(q, case_sensitive=True) for field in pairtitles]
        query = reduce(lambda a, b: (a | b), queries)
        return db(query).select()
    else:
        return []

@auth.requires_membership('managers')
def ajax_getupdate():
    #for var in request.vars:
        #print var+':'+request.vars[var]

    formname = request.vars.formname
    formkey = request.vars.formkey
    keyname = '_formkey[%s]' % formname
    formkeys = list(session.get(keyname, []))
    if formkey and formkeys and formkey in formkeys:  # check if user tampering with form and void CSRF
        session[keyname].remove(formkey)
    else:
        #response.flash = 'Session expired!'
        return dict(status=False)
    if not auth.user:
        #response.flash = 'UNAUTHORIZED!'
        return dict(status=False)

    sep = False
    if formname == 'editpair':
        title = request.vars.title  # one title for all pairs
    elif formname == 'editfound':
        sep = True
    idx = 0
    while(request.vars['cross_'+str(idx)] and idx < 1000):
        si = str(idx)
        idx += 1
        rec = 'plint_'+si
        if (request.vars[rec]):
            rec = request.vars[rec]
            pid = request.vars['pair_'+si]
            if sep: # each pair has own title
                title = request.vars['title_'+si]
            #print 'plint:%s pair:%s title:%s' % (rec, pid, title)
            db.plint_table[rec] = {'pid'+pid : title,
                                   'pmodon'+pid : request.now.date(),
                                   'pmodby'+pid : auth.user}

    #response.flash = 'Database update success!'
    return dict(status=True)



    ## for AJAX request
    #def crossdata():
        #data = {}
        #tm = TimeMeter()     # for Debug
        #try:
            #dbId = request.args[0]
            #if dbId == 'crosses':
            #else:
                #itemId = request.args(1, cast = int)
                #if dbId == 'cross':
                    #cross = Cross(itemId)
                    #data['title'] = cross.header
                    #data['verticals'] = db(db.vertical_table.parent == cross.index).select(db.vertical_table.id, db.vertical_table.title).as_list()
                #elif dbId == 'vertical':
                        #vertical = Vertical(itemId)
                        #data['title'] = vertical.header
                        #data['plints'] = db(db.plint_table.parent == vertical.index).select().as_list()
                        ##print data
            #data['time'] = tm.show('DB query')
        #except:
            #data = 'Bad request'



def cross():
    cross = Cross(request.args(0, cast = int))
    verticals = db(db.vertical_table.parent == cross.index).select()
    back = A('Back', _href=URL('crosses'), cid=request.cid)
    return DIV(back, P(), cross.title, verticals, back)


def ask():
    form=SQLFORM.factory(
        Field('your_email',requires=IS_EMAIL()),
        Field('question',requires=IS_NOT_EMPTY()))
    if form.process().accepted:
        print "ok is cid"
        print request.cid
        if mail.send(to='admin@example.com',
                  subject='from %s' % form.vars.your_email,
                  message = form.vars.question):
            response.flash = 'Thank you'
            response.js = "jQuery('#%s').hide()" % request.cid
        else:
            form.errors.your_email = "Unable to send the email"
        return "ask rec"
    response.view='default/dialog.html'
    return dict(form=form, title="Ask question")

def common(div):
    if request.env.http_web2py_component_location:
        return div
    else:
        response.view='default/common.html'
        return dict(div=div)

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

@auth.requires_membership('administrators')
#@auth.requires_membership('managers')
def restore():
    response.title = _RESTORE_
    form = FORM(INPUT(_type='file', _name='fn'),
                INPUT(_type='submit', _class='pull-right btn-primary'))
    if form.process().accepted:
        try:
            f = form.vars.fn.file
            if f.name != None:  # is tmp file, txt
                f = import_from_txt1(f)
            db.import_from_csv_file(f, restore=True)
            m = T('Database restored')
        except Exception as m:
            pass
        session.flash = m
        #redirect_updatemenu(URL('index'))
        redirect(URL('index'))
    response.view='default/dialog.html'
    return dict(form=form, title=_RESTORE_)

def pindex():
    return dict()

def auxiliary1():
    form=SQLFORM.factory(Field('name'))
    if form.accepts(request.vars): return "Hello %s" % form.vars.name
    return form
def auxiliary2():
    form=SQLFORM.factory(Field('name'))
    if form.accepts(request.vars): return "Hello %s" % form.vars.name
    return form
def auxiliary3():
    form=SQLFORM.factory(Field('name'))
    if form.accepts(request.vars): return "Hello %s" % form.vars.name
    return form
def auxiliary4():

    ma = DIV(A('qu-qu',_href=URL('chmo'), cid=request.cid), _id='testw2p')
    return ma

def chmo():
    return 'QU_QU'
