# -*- coding: utf-8 -*-

def lexicon():
    return dict(
    _ADD_LINK_ = T('Add link to chain'),
    _ADD_CABLE_ = T('Add cable'),
    _ADMIN_DB_ = T('Direct edit DB'),
    _BACK_ = T('Back'),
    _BACKUP_ = T('Backup DB'),
    _BTNBACK_ = btnBack,
    _CABLES_ = T('Cables'),
    _CANCEL_ = T('Cancel'),
    _CHAIN_ = T('Edit chain'),
    _CLEAR_DB_ = T('Clear DB'),
    _COMMON_DATA_ = T('Common data'),
    _COLOR_ = T('Color'),
    _COUNT_ = T('Count'),
    _CROSS_ = T('Cross'),
    _DB_UPD_ = T('Database update success!'),
    _DEL_ = T('Delete '),
    _DETAILS_ = T('Details'),
    _EDIT_CROSS_ = T('Edit cross'),
    _EDIT_PAIR_ = T('Edit pair'),
    _EDIT_PLINT_ = T('Edit plint'),
    _EDIT_VERT_ = T('Edit vertical'),
    _EDITOR_ = T('Editor'),
    _ERROR_ = T('Error'),
    _IMPORT_ = T('Import DB'),
    _FIND_ = T('Find'),
    _FNDRES_ = T('Found results for "%s"'),
    _FOLLOW_ = T('Follow'),
    _FOR_ALL_ = T('Apply for all'),
    _FOUND_ = T('Found: '),
    _HELP_ = T('Help'),
    _HOME_ = T('Home'),
    _LAST_MOD_ = T('Last modified'),
    _MERGE_ = T('Merge through'),
    _MERGE_DB_ = T('Merge DB'),
    _NEW_CROSS_ = T('New cross'),
    _NEWPL_ = T('New plint'),
    _NEWS_ = T('News'),
    _NOCHANGE_ = T('No changes'),
    _NOT_CROSSED_ = T('Not crossed'),
    _OLDPL_ = T('Existing plint'),
    _PAIR_ = T('Pair'),
    _PAIR_T_ = T('Pair titles'),
    _PLINT_ = T('Plint'),
    _PLINT_T_ = T('Plint title'),
    _REPLACE_ = T('Replace'),
    _RESTORE_ = T('Restore DB'),
    _REM_CD_ = T('Replace remote common data'),
    _SEARCH_ = T('Search'),
    _SET_CABLE_ = T('Set cable'),
    _START_1_ = T('Numeration start 1'),
    _TITLE_ = T('Title'),
    _TOOSHORT_ = T('too short query!'),
    _TOOLS_ = T('Tools'),
    _UKSATSE_ = T('Uksatse'),
    _VERTICAL_ = T('Vertical'),
    _VERT_T_ = T('Vertical title'),
    _VIEW_VERT_ = T('View vertical'),
    _WRAP_ = T('Wrap text'),
    login = T('Log In'),
    logout = T('Log Out'),
    register = T('Sign Up'),
    request_reset_password = T('Request reset password'),
    profile = T('Profile'),
    change_password = T('Change Password'))

def templates():
    response.view = 'templates.html'
    return dict()

def cables():
    return dict(cables=dict((r.id,(r.title, r.details, r.color)) for r in db(db.cables).select()))

def cross():
    return dict(data=[(r.id, r.title, [(w.id, w.title) for w in db(db.verticals.cross == r.id).select()]) for r in db(db.crosses).select()])

def news():
    request.vars.news = True;
    return vertical()

def vertical():
    search = request.vars.search or False
    news = request.vars.news or False
    title = cross = ''
    if search:
        #rows = search_plints(search)
        rows = search_plints(search, pfset=pdtset)
        header = T('Found results for "%s"') % search if rows else '"%s" - %s' % (search, response.searchstatus)
    elif news:
        rows = db(db.plints).select(orderby=~db.plints.modon, limitby=(0, 50))
        header = T('Last modified')
    else:
        vertical = Vertical(request.args(0, cast=int))
        title = vertical.title
        header = vertical.header
        cross = vertical.cross.title
        rows = db(db.plints.vertical == vertical.index).select(orderby=db.plints.id)
    xp = request.args(1, cast=int) if request.edit_mode and request.args(1) else 0
    s_plint = 0
    plints = []
    for plint in rows:
        if not s_plint and xp==plint.id:
            xp = plint
            s_plint = dict(title=plint.title, count=0, cable=plint.cable)
        if s_plint and s_plint['cable'] and s_plint['cable']==plint.cable:
            s_plint['count'] += 1
        who = plint.modby
        get_user_name(who)
        tr={'id':plint.id,
            'title':plint.title,
            'start1':int(plint.start1),
            'comdata':plint.comdata,
            'modon':plint.modon,
            'modby':who.id,
            'cable':plint.cable}
        td = []
        old = plint.pmodon1
        idx = 0
        for i in xrange(10):
            pf = pairfields[i]
            pairtitle = plint(pairtitles[i])
            when = plint(pf[1])
            if news:
                if when>old:    # searching newest pair
                    old = when
                    idx = i
            elif request.edit_mode:   # in edit mode(see editvertical) pairs whenwho not needed
                td.append(pairtitle)
            else:
                who = plint(pf[2])
                get_user_name(who)
                td.append((pairtitle,when,who,plint(pf[3])))
        if news:
             td.append((plint(pairtitles[idx]),idx))
        tr['pairs'] = td
        plints.append(add_root(tr, plint) if search or news else tr)
    result = dict(header=header, plints=plints, users=users, vertical=title, cross=cross)
    if not news: result.update(cables())
    if xp:
        result['s_plint'] = s_plint
        if xp and xp.cable:
            xp = db((db.plints.cable==xp.cable) & (db.plints.vertical!=vertical.index)).select().first()
            if xp: result['chain'] = [add_root(dict(plintId=xp.id, title=xp.title), xp)]
    return result

def plints():
    return dict(data=[(i.id,i.title,int(i.start1)) for i in db(db.plints.vertical == request.args(0, cast = int)).select(*pfset1, orderby=db.plints.id)])

def plintspid():    # add pair titles to response
    return dict(data=[(i.id,i.title,int(i.start1),get_pids(i)) for i in db(db.plints.vertical == request.args(0, cast = int)).select(*pfset2, orderby=db.plints.id)])

def plintscd():    # add common data to response
    return dict(data=[(i.id,i.title,int(i.start1),i.comdata) for i in db(db.plints.vertical == request.args(0, cast = int)).select(*pfset1, orderby=db.plints.id)])

def comdict(data):
    return dict(header=data.header, address=data.address, modinfo=data.modified_info, title=data.title, vertical=data.vertical.title, verticalId=data.vertical.index)

@auth.requires_membership('managers')
def editcross():
    if request.vars.new:
        result = dict(header=T('New cross'))
    else:
        data = Cross(request.args(0, cast = int))
        result = dict(header=data.header, title=data.title)
    return add_formkey(result)

@auth.requires_membership('managers')
def editvertical():
    request.edit_mode = True;
    return add_formkey(vertical())

@auth.requires_membership('managers')
def editplint():
    data = Plint(request.args(0, cast = int))
    result = comdict(data)
    result.update(dict(pairtitles=get_pids(data.record),
                       pairdetails=get_pdts(data.record),
                       start1=data.start1, comdata=data.comdata))
    return add_formkey(result)

@auth.requires_membership('managers')
def editpair():
    return add_formkey(__getchain())

@auth.requires_membership('managers')
def editcables():
    return add_formkey(cables())

def chain():
    request.vars.chain = True
    return __getchain()

def __getchain():
    data = Pair(request.args(0, cast = int), request.args(1, cast = int))
    result = comdict(data)
    result['details'] = data.details
    if request.vars.chain:
        q = data.title
        linkId = '%s_%s' % (data.index, data.pair)
        #=======================
        def __addlink(plint, i):
            tr = dict(plintId=plint.id, pairId=i+1, plint=plint.title, start1=int(plint.start1), comdata=plint.comdata,
                      pdt=plint(pairfields[i][3]),
                      pch=plint(pairfields[i][4]),
                      par=int(plint(pairfields[i][5])),
                      clr=plint(pairfields[i][6])
            )
            if linkId == '%s_%s' % (plint.id, i+1):
                tr['edited'] = True
            pairs.append(add_root(tr, plint))
        #=======================
        pairs = []
        if test_query(q):
            rows = search_plints(q, like=False)  # exact matching
            for plint in rows:
                for i in xrange(10):
                    if plint(pairtitles[i]) == q:
                        __addlink(plint, i)
            pairs.sort(key = lambda tr: tr['pch'])
        else:
            __addlink(data.record, data.pair-1)
        result['chain'] = pairs
    return result

@auth.requires_membership('managers')
def editfound():
    return add_formkey(vertical())

@auth.requires_membership('administrators')
def restore():
    return add_formkey(dict())

def add_formkey(data):
    s = request.function
    data.update(dict(formname=s, formkey=formUUID(s)))
    return data

def test_query(q):
    try: uq = unicode(q, 'utf-8')
    except: uq = q
    return len(uq) > 2

def add_root(tr, plint):
    tr['cross'] = plint.cross.title
    tr['crossId'] = plint.cross
    tr['vertical'] = plint.vertical.title
    tr['verticalId'] = plint.vertical
    return tr

def search_plints(q, like=True, pfset=pairtitles):
    if q and test_query(q):
        if like:
            queries = [db.plints[field].contains(q, case_sensitive=True) for field in pfset]
        else:
            queries = [db.plints[field] == q for field in pfset]
        query = reduce(lambda a, b: (a | b), queries)
        result = db(query).select(orderby=db.plints.cross)  # sort by crosses
        response.searchstatus = 'OK' if result else T('not found!')
        return result
    else:
        response.searchstatus = T('too short query!')
        return []

def livesearch():
    q = request.vars.search
    plints = search_plints(q, pfset=pdtset) # search in plint common data, pair titles and details
    items = []
    for plint in plints:
        for field in pdtset:
            word = plint[field] or ''
            if q in word and word not in items:
                items.append(word)
    items.sort()
    return dict(search=[item for item in items])

def formUUID(formname):
    from gluon.utils import web2py_uuid
    formkey = web2py_uuid()
    keyname = '_formkey[%s]' % formname
    session[keyname] = list(session.get(keyname, []))[-9:] + [formkey]
    return formkey

def json_to_utf(input):
    import json
    from gluon.storage import Storage
    def byteify(input):
        if isinstance(input, dict):
            return Storage({byteify(key):byteify(value) for key,value in input.iteritems()})
        elif isinstance(input, list):
            return [byteify(element) for element in input]
        elif isinstance(input, unicode):
            return input.encode('utf-8')
        else:
            return input
    return byteify(json.loads(input))

@auth.requires_membership('managers')
def update():
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
    changed = False
    try:
        if formname == 'editcross':
            # save formData from Edit Cross Controller
            if vars.new:
                idx = db.crosses.update_or_insert(title=vars.title)
                changed = bool(idx)
                if idx: result['location'] = 'editcross/'+str(idx)
            else:
                cross = Cross(request.args(0))
                if vars.delete:
                    cross.delete()
                    changed = True
                    result['location'] = ''    # this will redirect to home page index/#
                else:
                    vt = cross.update(vars)
                    changed = bool(vt)
                    vt = str(vt)
                    if vt.isdigit() and int(vt) > 0:
                        result['location'] = 'editvertical/' + vt
        elif formname == 'editvertical':
            # save formData from Edit Vertical Controller
            vertical = Vertical(request.args(0))
            vars = json_to_utf(vars.vertical)
            if vars.delete:
                vertical.delete()
                changed = True
                result['location'] = ''
            else:
                changed = vertical.update(vars)
                result['location'] = 'vertical/' + str(vertical.index)
        elif formname == 'editplint':
            plint = Plint(request.args(0))
            if vars.delete:
                plint.delete()
            else:
                changed = plint.update(vars)
        elif formname == 'editpair' or formname == 'editfound':
            plints = json_to_utf(vars.plints)
            for i in plints:
                changed = plint_update(i, {}, plints[i])
        elif formname == 'editcables':
            cables = json_to_utf(vars.cables)
            for i in cables:
                idx = i.id
                if i.delete:
                    #db(db.cables.id==idx).delete()
                    del db.cables[idx]
                    changed = True
                else:
                    #db.cables[i.pop('id', 0)] = i
                    if idx:
                        d = db.cables[idx].as_dict()
                        del d['id']
                        del i['id']
                        if cmp(d, i)!=0:
                            db.cables[idx] = i
                            changed = True
                    else:
                        db.cables[0] = i    # insert new
                        changed = True
        elif formname == 'restore':
            f = vars.upload.file
            if vars.txt == 'true':
                import txt_to_db
                f = txt_to_db.import_from_txt1(f, get_tb_fields())
            db.import_from_csv_file(f, restore = not bool(vars.merge))
            msg = T('Database restored')
            result['location'] = ''
        else:
            pass
    except:
        msg = T('Error')
        result['status'] = False
        result['location'] = ''
    result['details'] = msg if msg else T('Database update success!') if changed else T('No changes')
    if result.has_key('location'):
        result['location'] = start_path + result['location']
    return result

def user():
    action = request.args(0) or 'login'
    if action != 'logout' and action != 'reset_password':
        _next = request.env.http_web2py_component_location
        #form = getattr(auth, action)(onaccept=lambda form: response.headers.update({'web2py-component-command': "document.location='%s'" % _next}))
        #form = getattr(auth, action)(onaccept=lambda form: response.headers.update())
        form = getattr(auth, action)()
        title = ''
        script = ''
        if action == 'login':
            title = T('Log In')
            if not 'register' in auth.settings.actions_disabled:
                form.add_button(T('Sign Up'), URL('default', 'user/register'), _class='btn btn-default')
            if not 'request_reset_password' in auth.settings.actions_disabled:
                form.add_button(T('Lost Password'), URL('default', 'user/request_reset_password'), _class='btn btn-default')
        elif action == 'register':
            title = T('Sign Up')
            script = 'web2py_validate_entropy(jQuery("#auth_user_password"),100);'
        elif action =='change_password':
            script = 'web2py_validate_entropy(jQuery("#no_table_new_password"),100);'
        if not title:
            title = T(action.replace('_',' ').title())
        return PFORM(title, form, script)

def error():
    response.view='default/error.html'
    codes = ('401','UNAUTHORIZED'), ('403','Access denied'), ('404','Not found'), ('500','Internal server error')
    code = request.args(0) or ''
    msg = request.args(1) or 'Unknown error'
    res = dict(code=code, msg=msg)
    for code, msg in codes:
        if res['code']==code:
            res['msg'] = msg
    return res



