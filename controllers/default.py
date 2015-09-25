# -*- coding: utf-8 -*-
import time

def makemenu():
    import json

    t1 = time.time()
    # ~ 20ms
    c_items = db(db.cross_table).select()
    #c_items = c_items[15:16]
    m = [None] * len(c_items)
    for i, cr in enumerate(c_items):
        j = cr.id
        v_items = db(db.vertical_table.parent == j).select()
        n = [None] * len(v_items)
        for k, vr in enumerate(v_items):
            n[k] = [vr.id, vr.title]
        m[i] = [j, cr.title, n]
    #data_json1 = json.dumps(m)
    data_json1 = gluon.contrib.simplejson.dumps(m)
    db.menu_table.truncate()
    db.menu_table.insert(menu = data_json1)
    t2 = time.time()
    d1 = '%f ms' % ((t2 - t1)*1000.0)

    t1 = time.time()
    m = [ [r.id, r.title, [ [w.id, w.title] for w in db(db.vertical_table.parent == r.id).select() ] ] for r in db(db.cross_table).select()]
    data_json2 = json.dumps(m)
    #data_json2 = gluon.contrib.simplejson.dumps(m)
    t2 = time.time()
    d2 = '%f ms' % ((t2 - t1)*1000.0)
    
    e = 'equ' if data_json1 == data_json2 else 'not equ'

    return {'menu1':data_json1, 'time1': d1, 'menu2':data_json2, 'time2': d2, 'a summary': e}

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
    parent = db.cross_table[rec.parent]
    vt = rec.title
    response.title = T('Cross %s, Vertical %s') % (parent.title, vt)
    response.menu.append(gluon.contrib.simplejson.loads(parent.menu))
    response.menu.append((vt, False, ''))
    view = request.vars.q
    if view == 'list':
        vertical_item = db.vertical_table(rec_id)
        plints = vertical_item.plints
        response.view='default/plints.html'
    else:
        if view == 'light':
            response.view='default/vlight.html'
        plints = db(db.plint_table.parent == rec_id).select()
    #response.view='default/vlight.html'    # remove
    return {'plints': plints}

@auth.requires_login()
def plintmod():
    plint = Plint(request.args(0, cast = int))
    crossed_info = [0,0,0,0]
    urlback = URL('vertical', args=[plint.vertical.index])
    response.menu.append(gluon.contrib.simplejson.loads(plint.cross.menu))
    response.menu.append((plint.vertical.title, False, urlback))
    response.menu.append((plint.title, False, ''))
    response.title = plint.address
    form=FORM(UL(B(plint.header), HR(), I(plint.modified_info),
              (T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = plint.title, requires=IS_NOT_EMPTY())),
              (T('Common data:'), XML('&nbsp;&nbsp;'), INPUT(_name='common_data', _value = plint.common_data)),
              (T('Numeration start 1:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='numeration_start_1', value=plint.numeration_start_1)),
               HR(), B(plint.outside_info['title']),
               (T('Raplace common data:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='replace_common_data', value=False))),
              TABLE(TR(TD('Cross:'), TD('Vertical:'), TD('Plint:')),
                    TR(TD(SELECT([], _id='fromcrosssel', _name='from_cross', _size=15)),
                       TD(SELECT([], _id='fromvertsel', _name='from_vert', _size=15)),
                       TD(SELECT([], _id='fromplintsel', _name='from_plint', _size=15))),
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
    if form.process().accepted:
        dict1 = {'modified_on': request.now.date(), 'modified_by': auth.user}
        cd_en = bool(form.vars.replace_common_data)
        outplint = db.plint_table[form.vars.from_plint]
        if outplint:
            dict1['come_from'] = plint.index
            # update new remote plint
            db.plint_table[outplint.id] = dict1
            if cd_en:
                form.vars.common_data = get_plint_info(outplint)
                db.plint_table[outplint.id] = {'common_data': plint.address}

        # update this plint
        db.plint_table[plint.index] = {'title': form.vars.title, 'common_data': form.vars.common_data, 'numeration_start_1': bool(form.vars.numeration_start_1)}
        dict1['come_from'] = outplint
        db.plint_table[plint.index] = dict1

        # remove old outside connection
        oldoutplint = db.plint_table[plint.come_from]
        # if connection existed and now connecting to new plint
        if oldoutplint and (oldoutplint.id != outplint.id):
            if oldoutplint.come_from == plint.index:
                dict1['come_from'] = None  # remove connection
                if cd_en:
                    dict1['common_data'] = ''
                # update old remote plint
                db.plint_table[oldoutplint.id] = dict1

        redirect(urlback)
    response.view='default/plint.html'
    return locals()

@auth.requires_login()
def pairmod():
    rec_id = request.args(0, cast = int)
    pair_id = request.args(1, cast = int)
    rec = db.plint_table(rec_id)
    cross_id = rec.root
    vertical_id = rec.parent
    rectitle = rec.title
    dx = 1 if rec.numeration_start_1 else 0
    #f_pair_title = 'pair_id_%d' % pair_id  #0
    #f_crosstoplint = 'crossed_to_plint_id_%d' % pair_id  #1
    #f_crosstopair = 'crossed_to_pair_id_%d' % pair_id  #2
    #f_mod_on = 'modified_on_id_%d' % pair_id  #3
    #f_mod_by = 'modified_by_id_%d' % pair_id  #4
    #f_pair_loop = 'loopback_id_%d' % pair_id  #5
    fp = get_pair_fields(pair_id)  # edited pair fields
    toplintold = rec(fp[1])
    topairold = rec(fp[2])
    crossed_info = get_pair_crossed_info(toplintold, topairold)
    urlback = URL('vertical', args=[vertical_id])
    response.menu.append(gluon.contrib.simplejson.loads(cross_id.menu))
    response.menu.append((vertical_id.title, False, urlback))
    response.menu.append((rectitle, False, URL('plintmod', args=[rec_id])))
    ptitle = T('Cross %s, Vertical %s, Plint %s, Pair %s') % (cross_id.title, vertical_id.title,  rectitle, pair_id + dx)
    response.title = ptitle
    pstatus1 = I('%s %s, %s %s' % (T('Last modified on'), rec(fp[3]), rec(fp[4]).first_name, rec(fp[4]).last_name))
    form=FORM(UL(B(ptitle), HR(), pstatus1,
              (T('Title:'), XML('&nbsp;&nbsp;'), INPUT(_name='title', _value = rec(fp[0]), requires=IS_NOT_EMPTY())),
              (T('Loop:'), XML('&nbsp;&nbsp;'), INPUT(_type='checkbox', _class='boolean', _name='loop', value=rec(fp[5]))),
              HR(), B(T('Cross to:'))),
              TABLE(TR(TD('Vertical:'), TD('Plint:'), TD('Pair:')),
                    TR(TD(SELECT([], _id='vertsel', _name='cross_vert', _size=15)),
                       TD(SELECT([], _id='plintsel', _name='cross_plint', _size=15)),
                       TD(SELECT([], _id='pairsel', _name='cross_pair', _size=15))),
                    TR(TD(crossed_info[0], _colspan=3)),
                    TR(TD(HR(), _colspan=3)),
                    TR(TD(), TD(), TD(INPUT(_type='submit'))),
              _class='plintset'))
    div_class = 'pair'    # form width in css
    if form.process().accepted:
        try:
            toplint = int(form.vars.cross_plint)  # cross to new plint
            topair = int(form.vars.cross_pair)  # cross to new pair
        except:
            toplint = None
            topair = ''
        if (toplint > 0):
            # get fieldset tuple of destination plint
            fd = get_pair_fields(topair - 1)  # new pair fields, value from <select> 1-10, pair_id 0-9 ==> topair-1
            # update to new plint crossing data
            db.plint_table[toplint] = dict(zip(fd[0:5], (form.vars.title, rec, pair_id+1, request.now.date(), auth.user)))  # pair_id+1 - convert to <select> value
        db.plint_table[rec_id] = dict(zip(fp, (form.vars.title, toplint, topair, request.now.date(), auth.user, bool(form.vars.loop))))
        # remove old connection
        if toplintold > 0:
            toplintold = int(toplintold)
            topairold = int(topairold)
            if not((toplintold==toplint) and (topairold==topair)):
                fo = get_pair_fields(topairold - 1)
                db.plint_table[toplintold] = dict(zip(fo[0:5], ('- - -', None, '', request.now.date(), auth.user)))
        redirect(urlback)
    response.view='default/plint.html'
    return locals()

def getPlintList():
    rows = db(db.plint_table.parent == int(request.vars.id)).select()
    plints = [[i.id, i.title, i.numeration_start_1] for i in rows]
    return gluon.contrib.simplejson.dumps({'plints': plints})

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
