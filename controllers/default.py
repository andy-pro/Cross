# -*- coding: utf-8 -*-

from gluon.utils import web2py_uuid

def index():
    #updatemenu()
    #response.headers['web2py-component-content'] = 'replace'
    #print request.vars
    #print 'args=', request.args
    #print 'vars=', request.vars
    #print request
    #print session
    #print web2py_uuid()
    return dict()

def crosses2():
    return DIV(_id="crosshome")

def demo():
    return dict()

def demo2():
    cid = 'ajax_container'
    #btns = [INPUT('Click to load content %i' % i,**{'_type':'button','_class':'load_content btn-primary','data-url':URL('otherthing%i' % i),'data-target':cid}) for i in xrange(5)]
    btns = [INPUT(**{'_value':'Click to load content %i' % i, '_type':'button','_class':'load_content btn btn-primary','_data-url':URL('otherthing%i' % i),'_data-target':cid}) for i in xrange(1,5)]
    div = DIV('<!-- CONTENT COMES HERE -->', _id=cid)
    script = '''
    $(function () {
       $('.load_content').on('click', function (e) {
            elem = $(this); // elem = $(e.target)
            url = elem.attr("data-url");
            target = elem.attr("data-target");
            web2py_ajax_page("GET", url, "", target);
            return false; // e.preventDefault()
          });
    })
    '''
    #response.js =  "jQuery('#wert').get(0).reload()"
    #return dict(div=DIV(btns, div))
    return dict(btns=DIV(btns), content=div, script=SCRIPT(script))
    #return dict(btns=DIV(btns), content=div)


def otherthing1():
    return '<h4>Hello 1</h4>'
def otherthing2():
    return '<h4>Hello 2</h4>'
def otherthing3():
    return '<h4>Hello 3</h4>'
def otherthing4():
    return '<h4>Hello 4</h4>'

'''
    tm = TimeMeter()     # for Debug
    #updatemenu()
    crosses = db(db.cross_table).select()
    #response.view='default/cross.html'
    #appendManageMenu()
    #table = DIV([DIV(item.title, _class='col-md-3 well') for item in items])
    table = []
    for cross in crosses:
        verticals = db(db.vertical_table.parent == cross.id).select()
        lst = ', '.join('<a href="%s">%s</a>' % (URL('vertical', args=vertical.id), vertical.title) for vertical in verticals)
        #table.append(DIV(DIV(DIV(A(B(cross.title), _href=URL('editcross', args=cross.id)), _class='panel-heading'), DIV(XML(lst), _class='panel-body'), _class="panel panel-info"), _class='col-lg-4'))
        table.append(DIV(DIV(DIV(A(B(cross.title), _href=URL('vertical', args=cross.id), cid=request.cid), _class='panel-heading'), DIV(XML(lst), _class='panel-body'), _class="panel panel-info"), _class='col-lg-4'))
    response.timemeter = tm.show('Rendering table')
    return {'table': DIV(table)}

    idx = request.args[0]
    cross=db.cross_table[idx]
    return dict(cross=cross, idx=idx)
    '''
def crosses():
    crosses = db(db.cross_table).select()
    table = []
    for cross in crosses:
        verticals = db(db.vertical_table.parent == cross.id).select()
        #lst = ', '.join('<a href="%s">%s</a>' % (URL('vertical', args=vertical.id), vertical.title) for vertical in verticals)
        lst = (A(vertical.title, _href=URL('vertical', args=vertical.id), cid=request.cid)+', ' for vertical in verticals)
        table.append(DIV(DIV(DIV(A(B(cross.title), _href=URL('cross', args=cross.id), cid=request.cid), _class='panel-heading'), DIV(*lst, _class='panel-body'), _class="panel panel-info"), _class='col-lg-4'))
    return DIV(table)

def ajax_getindexdata():
    #return dict((r.id, dict(title=r.title, verticals=dict((w.id, w.title) for w in db(db.vertical_table.parent == r.id).select() )))  for r in db(db.cross_table).select())
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
    plints = {}
    for plint in rows:
        td = []
        for i in xrange(0, 10):
            pairtitle = plint(pairtitles[i])
            when = plint(pairfields[i][1])
            who = plint(pairfields[i][2])
            get_user_name(who)
            td.append((pairtitle,when,who))
        get_user_name(plint.modby)
        plints[plint.id] = dict(title=plint.title,
                                start=int(plint.start1),
                                comdata=plint.comdata,
                                modon=plint.modon,
                                modby=plint.modby,
                                pairs=td)
        if query:
            plints[plint.id]['root'] = [plint.root, plint.root.title]
            plints[plint.id]['parent'] = [plint.parent, plint.parent.title]

    result = dict(header=header, query=query, plints=plints, users=users, vertical=vertical_id, title=title)
    if query and rows:
        formname = 'editfound'
        result['formname'] = 'editfound'
        result['formkey'] = formUUID(formname)
    result['user'] = get_user_id()
    return result

def getplintlist(rows):
    return [(i.id,i.title,int(i.start1)) for i in rows]

#def ajax_getPlintList():
    #rows = db(db.plint_table.parent == request.args(0, cast = int)).select()
    #return dict(items=getplintlist(rows))

#def ajax_getplints():
    ##rows = db(db.plint_table.parent == request.args(0, cast = int)).select(orderby=db.plint_table.id)
    #rows = db(db.plint_table.parent == request.args(0, cast = int)).select(db.plint_table.id, db.plint_table.title, db.plint_table.start1, orderby=db.plint_table.id)
    ##return dict((r.id, dict(title=r.title, start=int(r.start1))) for r in rows) # for dict of dicts
    #return dict(data=[[r.id, r.title, int(r.start1)] for r in rows]) # for dict of tuples of tuples
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
    if (request.args(2) and request.args(2, cast=str) == 'chain'):
        result['chain'] = getplintlist(search_plints(pair.title))
    return result

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

def search_plints(q):
    if q == None:
        q = ''
    try:
        uq = unicode(q, 'utf-8')
    except:
        uq = q
    if len(uq) > 2:
        queries = [db.plint_table[field].contains(q, case_sensitive=False) for field in pairtitles]
        query = reduce(lambda a, b: (a | b), queries)
        return db(query).select()
    else:
        return []

@auth.requires_membership('managers')
def ajax_getEditPair():
    #for var in request.vars:
        #print var+':'+request.vars[var]

    formname = request.vars.formname
    formkey = request.vars.formkey
    keyname = '_formkey[%s]' % formname
    formkeys = list(session.get(keyname, []))
    if formkey and formkeys and formkey in formkeys:  # check if user tampering with form and void CSRF
        session[keyname].remove(formkey)
    else:
        response.flash = 'Session expired!'
        return dict(status=False)
    if not auth.user:
        response.flash = 'UNAUTHORIZED!'
        return dict(status=False)

    sep = False
    if formname == 'editpair':
        title = request.vars.title
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
            if sep:
                title = request.vars['title_'+si]
            #print 'plint:%s pair:%s title:%s' % (rec, pid, title)
            db.plint_table[rec] = {'pid'+pid : title,
                                   'pmodon'+pid : request.now.date(),
                                   'pmodby'+pid : auth.user}

    response.flash = 'Database update success!'
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
