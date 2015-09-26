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
    return dict((r.id, dict(title=r.title, verticals=dict((w.id, dict(title=w.title)) for w in db(db.vertical_table.parent == r.id).select() )))  for r in db(db.cross_table).select())

def ajax_getverticaldata():
    #print request
    query = request.vars.search
    if query:
        #print query
        header = T('Search result for "%s"') % query
        rows = search_plints(query)
    else:
        query = False
        vertical = Vertical(request.args(0, cast = int))
        header = vertical.header
        rows = db(db.plint_table.parent == vertical.index).select()
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
    return dict(header=header, plints=plints, users=users, query=query)

def ajax_getplints():
    #rows = db(db.plint_table.parent == request.args(0, cast = int)).select(orderby=db.plint_table.id)
    rows = db(db.plint_table.parent == request.args(0, cast = int)).select(db.plint_table.id, db.plint_table.title, db.plint_table.start1, orderby=db.plint_table.id)
    #return dict((r.id, dict(title=r.title, start=int(r.start1))) for r in rows) # for dict of dicts
    return dict(data=[[r.id, r.title, int(r.start1)] for r in rows]) # for dict of tuples of tuples

@auth.requires_membership('managers')
def ajax_getpairdata():
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    formkey = web2py_uuid()
    formname = 'editpair'
    keyname = '_formkey[%s]' % formname
    session[keyname] = list(session.get(keyname, []))[-9:] + [formkey]
    #print session
    return dict(header=pair.header, modinfo=pair.modified_info, title=pair.title, formkey=formkey, formname=formname)

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

def ajax_getPlintList():
    rows = db(db.plint_table.parent == request.args(0, cast = int)).select()
    items = [(i.id,i.title,int(i.start1)) for i in rows]
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
    queries = [db.plint_table[field].contains(q, case_sensitive=False) for field in pairtitles]
    query = reduce(lambda a, b: (a | b), queries)
    return db(query).select()

def ajax_getEditPair():
    #for var in request.vars:
        #print var+':'+request.vars[var]

    status = True
    formname = request.vars.formname
    formkey = request.vars.formkey
    keyname = '_formkey[%s]' % formname
    formkeys = list(session.get(keyname, []))
    if formkey and formkeys and formkey in formkeys:  # check if user tampering with form and void CSRF
        session[keyname].remove(formkey)
    else:
        status = False

    if status:
        rec = request.vars.plint_this
        pid  = 'pid'+request.vars.pair_this
        db.plint_table[rec] = {pid : request.vars.title}
        quo = 'Database update success!'
    else:
        quo = 'Session expired!'
    #response.flash = quo
    #print session
    return dict(status=status)



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

def vertical_old():
    vertical = Vertical(request.args(0, cast = int))
    plints = db(db.plint_table.parent == vertical.index).select()
    table = get_vertical_table(plints)    # <col span="10" class="coln">
    back = A('Back', _href=URL('crosses'), cid=request.cid)
    return common(DIV(back, P(), vertical.title, table, back))

def vertical():
    vertical = Vertical(request.args(0, cast = int))
    plints = db(db.plint_table.parent == vertical.index).select()
    table = get_vertical_table(plints)    # <col span="10" class="coln">
    back = A('Back', _href=URL('crosses'), cid=request.cid)
    return common(DIV(back, P(), vertical.title, table, back))

#@auth.requires_membership('managers')
def editpair():
    pair = Pair(request.args(0, cast = int), request.args(1, cast = int))
    crossId = pair.plint.cross.index
    verticalId = pair.plint.vertical.index
    plintId = pair.index
    pairId = pair.pair
    urlback = URL('vertical', args=[verticalId])
    #response.verticalmainmenu = appendVerticalMenu(pair.plint.cross)
    #response.menu.append((pair.plint.vertical.title, False, urlback))
    #response.menu.append((pair.plint.title, False, URL('editplint', args=[pair.index])))
    response.title = pair.address
    response.plintcrossindex = crossId
    ##response.pairoutside = True
    #response.view='default/edititem.html'
    #response.files.append(URL('static','js/plintmain.js'))
    '''form = PFORM(pair.header,
                 FLABEL(I(pair.modified_info)),
                 FTEXT(v=pair.title),
                 FCHECK(_REPLACE_TITLE_, 'replace_title', True, T("Autofill 'Title' field")),
                 DIV(TABLE(TR(TD(_VERTICAL_), TD(_PLINT_), TD(_PAIR_)),
                           TR(get_select(0), get_select(1), get_select(2))), _class='form-row'),
                 AJAXANIME, FOK())'''
    #form = BSFORM(FTEXT(v=pair.title), get_add_panel(), get_chain(), get_select_chain(), FOKCANCEL(urlback))
    chain = []
    chain.append(dict(crossId=crossId, verticalId=verticalId, plintId=plintId, pairId=pairId))
    #chain.append(dict(crossId=8, verticalId=60, plintId=787, pairId=9))
    #chain.append(dict(crossId=8, verticalId=61, plintId=810, pairId=8))
    #chain.append(dict(crossId=8, verticalId=62, plintId=829, pairId=7))
    #chain.append(dict(crossId=8, verticalId=63, plintId=839, pairId=6))
    #chain.append(dict(crossId=8, verticalId=64, plintId=852, pairId=5))
    #chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    #chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    #chain.append(dict(crossId=6, verticalId=47, plintId=840, pairId=4))    # empty vertical
    #chain.append(dict(crossId=8, verticalId=67, plintId=840, pairId=4))
    #chain.append(dict(crossId=8, verticalId=63, plintId=840, pairId=4))
    #chain.append(dict(crossId=0, verticalId=0, plintId=0, pairId=0))
    #chain.append(dict(crossId=22, verticalId=0, plintId=0, pairId=0))       # empty cross
    #chain.append(dict(crossId=4, verticalId=44, plintId=650, pairId=3))
    form = BSFORM(FTEXT(v=pair.title), get_add_panel(), get_chain(chain), FOKCANCEL(urlback))
    if form.process().accepted:
        pass
        #pair.update(form.vars)
        #redirect(urlback)
    response.view='default/editdialog.html'
    #print session
    return dict(form=form, title=pair.header)
    #return dict(form=form, title="title")



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
        #comefrom = get_plint_outside_info(plint)
        s1 = _COMMON_DATA_ + str(plint.comdata)
        who = get_user_name(plint.modby)
        a_attr['_title'] = _PLINT_+' %s\n%s\n%s\n%s' % (plint.title, plint.modon, who, s1)
        a_attr['_href'] = _href=URL('editplint', args = [plint.id])
        td.append(TD(A(plint.title, **a_attr), _class="colv1"))
        for i in xrange(0, 10):
            a_attr = {}
            td_attr = {}
            pairtitle = plint(pairtitles[i])
            start = i+dx+1
            tdcl = ''
            if pairtitle:
                when = plint(pairfields[i][1])
                who = get_user_name(plint(pairfields[i][2]))
                #crossedto = get_pair_crossed_info(plint(pairfields[i][1]), plint(pairfields[i][2]))
                a_attr['_title'] = '%s\n%s\n%s' % (pairtitle, when, who)
                if request.get_vars.q and request.get_vars.q in pairtitle:
                    tdcl = 'finded'
                    #if crossedto[2] and crossedto[3]:
                        #a_attr['_id'] = 'p%im%i' % (crossedto[3], crossedto[2])
                #if plint(pairfields[i][5]):
                    #tdcl += ' loop'
                if tdcl:
                    td_attr = {'_class': tdcl}
            a_attr['_href'] = _href=URL('editpair', args = [plint.id, i+1])
            #a_attr['cid'] = request.cid
            td.append(TD(A(XML('<sup>%s&nbsp;&nbsp;</sup>%s' % (start, pairtitle)), cid = request.cid, **a_attr), **td_attr))
        tdcl = 'commondata'
        if request.get_vars.q and request.get_vars.q in plint.comdata:
            tdcl += ' cdfinded'
        td.append(TD(plint.comdata, _class=tdcl, _style="border-left: 2px solid #ccc;"))
        tr.append(TR(td))
    return TABLE(tr, _class='cross')
