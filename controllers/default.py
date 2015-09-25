# -*- coding: utf-8 -*-

def index():
    #cross_items = db(db.cross_table).select(orderby = db.cross_table.id)
    items = db(db.cross_table).select()
    item_name = 'cross'
    return locals()

def cross():
    idx = request.args(0, cast = int)
    cross_item = db.cross_table(idx)
    items = db(db.vertical_table.cross_table == idx).select()
    item_name = 'vertical'
    response.view='default/index.html'
    #response.flash='%d, %d' % (reccnt, reccnt/20)
    return dict(items = items, item_name = item_name)

def vertical():
    idx = request.args(0, cast = int)
    vertical_item = db.vertical_table(idx)
    cross_item = vertical_item.cross_table
    #response.flash=type(cross_item)
    plints = db(db.plint_table.vertical_table == idx).select()
    return locals()

@auth.requires_login()
def plintmod():
    idx = request.args(0, cast = int)
    form = SQLFORM(db.plint_table, record = idx, fields=['title', 'come_from', 'common_data', 'numeration_start_1']).process()
    if form.accepted:
        #session.flash = T("Saved!")
        #db(db.plint_table.id == (idx)).update(modified_date = request.now.date(), modified_by = auth.user)
        db.plint_table[idx] = {'modified_date': request.now.date(), 'modified_by': auth.user}
        #redirect(request.env.http_referer)    # request.env.http_referer give absolut URL, not working!
        redirect(URL('vertical', args=[db.plint_table[idx].vertical_table]))
    return locals()

@auth.requires_login()
def pairmod():
    idx = request.args(0, cast = int)
    pair_idx = request.args(1, cast = int)
    form = SQLFORM(db.plint_table, record = idx, fields=['pair_id_%d' % pair_idx, 'loopback_id_%d' % pair_idx]).process()
    if form.accepted:
        db.plint_table[idx] = {'modified_date_id_%d' % pair_idx: request.now.date(), 'modified_by_id_%d' % pair_idx: auth.user}
        redirect(URL('vertical', args=[db.plint_table[idx].vertical_table]))
    return locals()

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
