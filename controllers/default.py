# -*- coding: utf-8 -*-

def index():
    #cross_items = db(db.cross_table).select(orderby = db.cross_table.id)
    items = db(db.cross_table).select()
    item_name = 'cross'
    some_data = ''    #response.menu
    return dict(items = items, item_name = item_name, some_data=some_data)

def cross():
    rec_id = request.args(0, cast = int)
    # 6 - cross_table
    # 7 - vertical_table
    # 8 - plint_table
    #items = db(db[db.tables[7]].parent == rec_id).select()
    table_id=7
    parent_id=rec_id
    items = db(db[db.tables[table_id]].parent == parent_id).select()
    #items = db(db.vertical_table.parent == rec_id).select()
    item_name = 'vertical'
    response.view='default/index.html'
    #response.flash='%d, %d' % (reccnt, reccnt/20)
    some_data = ''
    return dict(items = items, item_name = item_name, some_data=some_data)

def vertical():
    rec_id = request.args(0, cast = int)
    vertical_item = db.vertical_table(rec_id)
    cross_item = vertical_item.parent
    #response.flash=type(cross_item)
    plints = db(db.plint_table.parent == rec_id).select()
    return locals()

@auth.requires_login()
def plintmod():
    idx = request.args(0, cast = int)
    rec = db.plint_table[idx]
    vertical_item = rec.vertical_table
    cross_item = rec.cross_table
    vertical_items = db(db.cross_table == cross_item).select()
    lst_vert = []
    lst_plint = []
    for i in vertical_items:
        lst_vert.append(i.title)
    form=FORM(TABLE(TR(TD(T('Title: ')), TD(INPUT(_name='name', _value = rec.title, requires=IS_NOT_EMPTY()))),
                    TR(TD(T('Numeration start 1')), TD(INPUT(_type='checkbox', _name='start', _value=rec.numeration_start_1))),
                    TR(TD(T('Crossed to:')), TD()),
                    TR(TD('Vertical:'), TD(SELECT(lst_vert, _class='test', _id='vselect'))),
                    TR(TD('Plint:'), TD(SELECT(lst_plint, _class='test', _id='pselect'))),
                    TR(TD(), TD(INPUT(_type='submit'))),
               ))
    
    
    
    #form = SQLFORM(db.plint_table, record = idx, fields=['title', 'come_from', 'common_data', 'numeration_start_1'], labels = {'title': T('Plint  title'), 'come_from': T('Come from'), 'common_data': T('Common data'), 'numeration_start_1': T('Numeration start 1')}, showid = False).process()
    if form.accepted:
        #session.flash = T("Saved!")
        #db(db.plint_table.id == (idx)).update(modified_date = request.now.date(), modified_by = auth.user)
        db.plint_table[idx] = {'modified_date': request.now.date(), 'modified_by': auth.user}
        #redirect(request.env.http_referer)    # request.env.http_referer give absolut URL, not working!
        redirect(URL('vertical', args=[db.plint_table[idx].vertical_table]))
    return locals()

@auth.requires_login()
def pairmod():
    rec_id = request.args(0, cast = int)
    pair_id = request.args(1, cast = int)
    f_pair_title = 'pair_id_%d' % pair_id
    f_pair_loop = 'loopback_id_%d' % pair_id
    f_crosstovert = 'crossed_to_vertical_id_%d' % pair_id
    f_crosstoplint = 'crossed_to_plint_id_%d' % pair_id
    f_crosstopair = 'crossed_to_pair_id_%d' % pair_id
    f_mod_on = 'modified_on_id_%d' % pair_id
    f_mod_by = 'modified_by_id_%d' % pair_id
    rec = db.plint_table(rec_id)    # read only?
    vertical_id = rec.parent
    cross_id = rec.root
    crossed_vert_id = rec(f_crosstovert)
    ptitle = DIV(T('Cross %s, Vertical %s, Plint %s, Pair %s') % (db.cross_table(cross_id).title, db.vertical_table(vertical_id).title,  rec.title, pair_id), BR(), I('%s %s, %s %s' % (T('Last modified on'), rec(f_mod_on), rec(f_mod_by).first_name, rec(f_mod_by).last_name)), HR(), get_pair_crossed_info(rec_id, pair_id))
    #verticals = db(db.vertical_table.parent == cross_id).select()
    #vid_list = XML(','.join(["'%s'" % (i.id) for i in verticals]))
    #vtitle_list = XML(','.join(["'%s'" % (i.title) for i in verticals]))
    form=FORM(TABLE(TR(TD(T('Title: ')), TD(INPUT(_name='title', _value = rec(f_pair_title)))),
                    TR(TD(T('Loop')), TD(INPUT(_type='checkbox', _class='boolean', _name='loop', value=rec(f_pair_loop)))),
                    TR(TD(HR(), _colspan='2')),
                    TR(TD(T('Crossed to:')), TD()),
                    TR(TD('Vertical:'), TD(SELECT([], _id='vselect', _name='cross_vert'))),
                    TR(TD('Plint:'), TD(SELECT([], _id='pselect'))),
                    TR(TD(), TD(INPUT(_type='submit'))),
               ))
    if form.process().accepted:
        if int(form.vars.cross_vert) == 0:
            form.vars.cross_vert = None
        #rec.update_record(**dict(form.vars))
        db.plint_table[rec_id] = {f_pair_title: form.vars.title, f_pair_loop: form.vars.loop, f_crosstovert: form.vars.cross_vert, f_mod_on: request.now.date(), f_mod_by: auth.user}
        redirect(URL('vertical', args=[vertical_id]))
        #response.flash=form.vars
    #return dict(ptitle=ptitle, form=form, vert_i=0, plint_i=0)
    #return dict(form=form, vtitle_list=XML(vtitle_list), vid_list=XML(vid_list), ptitle=ptitle)
    return locals()

def getfellowlist():
    import json
    parent_id = int(request.vars.parent_id)
    table_id = int(request.vars.table_id)   # 6 - cross_table, 7 - vertical_table, 8 - plint_table
    items = db(db[db.tables[table_id]].parent == parent_id).select()
    fid_list = []
    ftitle_list = []
    for i in items:
        fid_list.append(i.id)
        ftitle_list.append(i.title)
    return json.dumps({'fid_list': fid_list, 'ftitle_list': ftitle_list})

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
