# -*- coding: utf-8 -*-

def test():
    import time
    #rec=db.vertical_table(36)
    b=db(db.plint_table.pair_id_0.contains('Терно')).select()
    #b=db(db.plint_table.pair_id_0.like('БЗ%'),case_sensitive=False).select()
    return {'m1':b}

def index():
    #cross_items = db(db.cross_table).select(orderby = db.cross_table.id)
    items = db(db.cross_table).select()
    item_name = 'cross'
    some_data = ''#db.vertical_table(36).plints#cross_storage#session #request.vars    #response.menu
    #some_data=[1,2,3,4]
    #return dict(items = items, item_name = item_name, some_data=some_data)
    response.view='default/cross.html'
    return locals()

def cross():
    rec_id = request.args(0, cast = int)
    #cross_storage['cross'] = rec_id
    # 6 - cross_table
    # 7 - vertical_table
    # 8 - plint_table
    #items = db(db[db.tables[7]].parent == rec_id).select()
    #table_id=7
    #parent_id=rec_id
    #items = db(db[db.tables[table_id]].parent == parent_id).select()
    items = db(db.vertical_table.parent == rec_id).select()
    item_name = 'vertical'
    response.menu.append((db.cross_table[rec_id].title, False, ''))
    #response.flash='%d, %d' % (reccnt, reccnt/20)
    some_data = ''#str(cross_storage.cross)+'asdfghjhg'#cross_storage
    #return dict(items = items, item_name = item_name)#, some_data=some_data)
    return locals()

def vertical():
    #response.flash=response.vars
    rec_id = request.args(0, cast = int)
    rec = db.vertical_table[rec_id]
    response.menu.append(gluon.contrib.simplejson.loads(db.cross_table[rec.parent].menu))
    response.menu.append((rec.title, False, ''))
    view = request.vars.q
    if view == 'list':
        vertical_item = db.vertical_table(rec_id)
        plints = vertical_item.plints
        response.view='default/plints.html'
    else:
        if view == 'light':
            response.view='default/vlight.html'
        plints = db(db.plint_table.parent == rec_id).select()
    response.view='default/vlight.html'    # remove
    return {'plints': plints}

@auth.requires_login()
def plintmod():
    rec_id = request.args(0, cast = int)
    rec = db.plint_table[rec_id]
    vertical_id = rec.parent
    cross_id = rec.root
    rectitle = rec.title
    crossed_info = [0,0,0,0]
    outside_info = [0,0,0,0]
    fromplint_id = rec.come_from
    if rec.come_from:
        outside_info[1] = fromplint_id.root
        outside_info[2] = fromplint_id.parent
        outside_info[3] = rec.com_from
    urlback = URL('vertical', args=[vertical_id])
    response.menu.append(gluon.contrib.simplejson.loads(db.cross_table[vertical_id.parent].menu))
    response.menu.append((vertical_id.title, False, urlback))
    response.menu.append((rectitle, False, ''))
    ptitle = T('Cross %s, Vertical %s, Plint %s') % (db.cross_table(cross_id).title, db.vertical_table(vertical_id).title,  rectitle)
    pstatus1 = I('%s %s, %s %s' % (T('Last modified on'), rec.modified_on, rec.modified_by.first_name, rec.modified_by.last_name))
    verticals = db(db.vertical_table.parent == cross_id).select()
    vlist = XML(','.join(["['%s','%s','']" % (i.id, i.title) for i in verticals]))
    crosses = db(db.cross_table).select()
    clist = XML(','.join(["['%s','%s','']" % (i.id, i.title) for i in crosses]))
    form=FORM(TABLE(TR(TD(B(ptitle), _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(pstatus1, _colspan=3)),
                    TR(TD(T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = rectitle, requires=IS_NOT_EMPTY()), _colspan=3)),
                    TR(TD(T('Common data:'), XML('&nbsp;&nbsp;'), INPUT(_name='common_data', _value = rec.common_data), _colspan=3)),
                    TR(TD(T('Numeration start 1:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='loop', value=rec.numeration_start_1), _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(B(T('Come from:')))),
                    TR(TD('Cross:'), TD('Vertical:'), TD('Plint:')),
                    TR(TD(SELECT([], _id='fromcrosssel', _name='fromcross_vert', _size=15)),
                       TD(SELECT([], _id='fromvertsel', _name='fromcross_plint', _size=15)),
                       TD(SELECT([], _id='fromplintsel', _name='fromcross_pair', _size=15)),
                      ),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(B(T('Cross entire plint:')), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='crossall', value=False, _onclick='PlintCrossToggle(this)'), _colspan=3)),
                    TR(TD(DIV(TABLE(TR(TD('Vertical:'), TD('Plint:')),
                                    TR(TD(SELECT([], _id='vertsel', _name='cross_vert', _size=15)),
                                       TD(SELECT([], _id='plintsel', _name='cross_plint', _size=15)))
                                   ),
                              _class='sel_hide', _id='sel_cross_to'), _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(), TD(), TD(INPUT(_type='submit'))),
              _class='plintset'))
    div_class = 'plint'    # form width in css
    #form = SQLFORM(db.plint_table, record = idx, fields=['title', 'come_from', 'common_data', 'numeration_start_1'], labels = {'title': T('Plint  title'), 'come_from': T('Come from'), 'common_data': T('Common data'), 'numeration_start_1': T('Numeration start 1')}, showid = False).process()
    if form.accepted:
        #session.flash = T("Saved!")
        #db(db.plint_table.id == (idx)).update(modified_date = request.now.date(), modified_by = auth.user)
        #db.plint_table[rec_id] = {'modified_date': request.now.date(), 'modified_by': auth.user}
        #redirect(request.env.http_referer)    # request.env.http_referer give absolut URL, not working!
        #redirect(URL('vertical', args=[db.plint_table[rec_id].vertical_table]))
        pass
    response.view='default/plint.html'
    return locals()

@auth.requires_login()
def pairmod():
    rec_id = request.args(0, cast = int)
    rec = db.plint_table(rec_id)
    pair_id = request.args(1, cast = int)
    f_pair_title = 'pair_id_%d' % pair_id
    f_pair_loop = 'loopback_id_%d' % pair_id
    f_crosstoplint = 'crossed_to_plint_id_%d' % pair_id
    f_crosstopair = 'crossed_to_pair_id_%d' % pair_id
    f_mod_on = 'modified_on_id_%d' % pair_id
    f_mod_by = 'modified_by_id_%d' % pair_id
    vertical_id = rec.parent
    cross_id = rec.root
    rectitle = rec.title
    crossed_info = get_pair_crossed_info(rec(f_crosstoplint), rec(f_crosstopair))
    urlback = URL('vertical', args=[vertical_id])
    response.menu.append(gluon.contrib.simplejson.loads(db.cross_table[vertical_id.parent].menu))
    response.menu.append((vertical_id.title, False, urlback))
    response.menu.append((rectitle, False, URL('plintmod', args=[rec_id])))
    ptitle = T('Cross %s, Vertical %s, Plint %s, Pair %s') % (db.cross_table(cross_id).title, db.vertical_table(vertical_id).title,  rectitle, pair_id)
    pstatus1 = I('%s %s, %s %s' % (T('Last modified on'), rec(f_mod_on), rec(f_mod_by).first_name, rec(f_mod_by).last_name))
    verticals = db(db.vertical_table.parent == cross_id).select()
    vlist = XML(','.join(["['%s','%s','']" % (i.id, i.title) for i in verticals]))
    form=FORM(TABLE(TR(TD(B(ptitle), _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(pstatus1, _colspan=3)),
                    TR(TD(T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = rec(f_pair_title), requires=IS_NOT_EMPTY()), _colspan=3)),
                    TR(TD(T('Loop:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='loop', value=rec(f_pair_loop)))),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(B(T('Cross to:')))),
                    TR(TD('Vertical:'), TD('Plint:'), TD('Pair:')),
                    TR(TD(SELECT([], _id='vertsel', _name='cross_vert', _size=15)),
                       TD(SELECT([], _id='plintsel', _name='cross_plint', _size=15)),
                       TD(SELECT([], _id='pairsel', _name='cross_pair', _size=15)),
                      ),
                    TR(TD(crossed_info[0], _colspan=2)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(), TD(), TD(INPUT(_type='submit'))),
              _class='plintset'))
    div_class = 'pair'    # form width in css
    if form.process().accepted:
        #response.flash=form.vars
        if (form.vars.cross_plint == '') or (form.vars.cross_plint == '0'): form.vars.cross_plint = None
        #if (form.vars.cross_pair == '') or (form.vars.cross_pair == '0'): form.vars.cross_pair = None # is a string Field
        #rec.update_record(**dict(form.vars))
        db.plint_table[rec_id] = {f_pair_title: form.vars.title, f_pair_loop: form.vars.loop, f_crosstoplint: form.vars.cross_plint, f_crosstopair: form.vars.cross_pair, f_mod_on: request.now.date(), f_mod_by: auth.user}
        redirect(urlback)
        #response.flash=form.vars
    #return dict(ptitle=ptitle, form=form, vert_i=0, plint_i=0)
    #return dict(form=form, vtitle_list=XML(vtitle_list), vid_list=XML(vid_list), ptitle=ptitle)
    response.view='default/plint.html'
    return locals()

def getinstancelist():
    import json
    parent = request.vars.parent
    rec_id = int(request.vars.id)
    if parent == 'vertical':
        #items = db(db[db.tables[table_id]].parent == rec_id).select()    #table_id = 6 - cross_table, 7 - vertical_table, 8 - plint_table
        rows = db(db.plint_table.parent == rec_id).select()
        items = [[i.id, i.title, i.numeration_start_1] for i in rows]
    elif parent == 'cross':
        rows = db(db.vertical_table.parent == rec_id).select()
        items = [[i.id, i.title] for i in rows]    
    return json.dumps({'instances': items})

def ajaxquery():
    import json
    rec_id = request.vars.vertical_id
    vertical_item = db.vertical_table(rec_id)
    plints = db(db.plint_table.vertical_table == rec_id).select()
    pid_list = []
    ptitle_list = []
    for i in plints:
        pid_list.append(i.id)
        ptitle_list.append(i.title)
    plint_list = XML(''.join(["'%s'" % (i.title) for i in plints]))
    return json.dumps({'vertical_id': rec_id, 'pid_list': pid_list, 'ptitle_list': ptitle_list})

@auth.requires_membership('managers')
def manage():
    u = request.url
    #p = .split('/')
    #func = p[4]
    #if func == 'index':
    #    mydb = db.cross_table
    #if func == 'cross':
    #    idx = p[5]
        #mydb = db(db.vertical_table.cross_table == idx).select()
        #tablegrid = SQLFORM.grid(db.vertical_table.cross_table == idx).select()
        #mydb = db.vertical_table.cross_table == idx
    #mydb = db.vertical_table
    #return dict(tablegrid=SQLFORM.smartgrid(mydb))
    #return dict(tablegrid=SQLFORM.grid(mydb))
    return dict(u=u, tablegrid=SQLFORM.smartgrid(db.cross_table))

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
