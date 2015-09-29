# -*- coding: utf-8 -*-

def lexicon():
    return dict(
    _ADD_LINK_ = T('Add link to chain'),
    _ADMIN_DB_ = T('Direct edit DB'),
    _BACK_ = T('Back'),
    _BACKUP_ = T('Backup DB'),
    _CANCEL_ = T('Cancel'),
    _CHAIN_ = T('Edit chain'),
    _CLEAR_DB_ = T('Clear DB'),
    _COMMON_DATA_ = T('Common data'),
    _COUNT_ = T('Count'),
    _CROSS_ = T('Cross'),
    _DB_UPD_ = T('Database update success!'),
    _DEL_ = T('Delete'),
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
    _START_1_ = T('Numeration start 1'),
    _TITLE_ = T('Title'),
    _TOOSHORT_ = T('too short query!'),
    _TOOLS_ = T('Tools'),
    _UKSATSE_ = T('Uksatse'),
    _VERTICAL_ = T('Vertical'),
    _VERT_T_ = T('Vertical title'),
    _VIEW_VERT_ = T('View vertical'),
    _WRAP_ = T('Wrap text'))

def index():
    return {'crosses':{r.id:{'title':r.title, 'verticals':{w.id:{'title':w.title} for w in db(db.vertical_table.parent == r.id).select()}} for r in db(db.cross_table).select()}}

def vertical():
    search = request.vars.search or False
    news = bool(request.vars.news)
    title = cross = ''
    if search:
        rows = search_plints(search)
        header = T('Found results for "%s"') % search if rows else '"%s" - %s' % (search, response.searchstatus)
    elif news:
        rows = db(db.plint_table).select(orderby=~db.plint_table.modon, limitby=(0, 50))
        header = T('Last modified')
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
        for i in xrange(10):
            pairtitle = plint(pairtitles[i])
            when = plint(pairfields[i][1])
            if news:
                if when>old:    # searching newest pair
                    old = when
                    idx = i
            elif request.edit_mode:   # in edit mode(see editvertical) pairs whenwho not needed
                td.append(pairtitle)
            else:
                who = plint(pairfields[i][2])
                get_user_name(who)
                td.append((pairtitle,when,who))
        if news:
             td.append((plint(pairtitles[idx]),idx))
        tr['pairs'] = td
        if search or news: add_root(tr, plint)
        plints.append(tr)
    return dict(header=header, plints=plints, users=users, vertical=title, cross=cross)

def plints():
    return dict(data=[(i.id,i.title,int(i.start1)) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

def plintscd():    # add common data to response
    return dict(data=[(i.id,i.title,int(i.start1),i.comdata) for i in db(db.plint_table.parent == request.args(0, cast = int)).select(*pfset1, orderby=db.plint_table.id)])

@auth.requires_membership('managers')
def editcross():
    if request.vars.new:
        result = dict(header=T('New cross'), new=True)
    else:
        data = Cross(request.args(0, cast = int))
        result = dict(header=data.header, title=data.title)
    return add_formkey(result)

@auth.requires_membership('managers')
def editvertical():
    request.edit_mode = True;
    return add_formkey(vertical())

def comdict(data):
    return dict(header=data.header, address=data.address, modinfo=data.modified_info, title=data.title, vertical=data.vertical.title, verticalId=data.vertical.index)

@auth.requires_membership('managers')
def editplint():
    data = Plint(request.args(0, cast = int))
    result = comdict(data)
    result.update(dict(pairtitles=('\n'.join(data.get_pair_titles())).rstrip(), start1=data.start1, comdata=data.comdata))
    return add_formkey(result)

@auth.requires_membership('managers')
def editpair():
    request.exclude = True
    return chain()

def chain():
    data = Pair(request.args(0, cast = int), request.args(1, cast = int))
    result = comdict(data)
    result['chain'] = getchain(data.title, request.exclude, '%s_%s' % (data.index, data.pair)) if (request.args(2) and test_query(data.title) and request.args(2, cast=str) == 'chain') else []
    return add_formkey(result)

@auth.requires_membership('managers')
def editfound():
    return add_formkey(vertical())

def add_formkey(data):
    s = request.function
    data.update(dict(formname=s, formkey=formUUID(s)))
    return data

def getchain(q, exclude=False, pairId=''):
    rows = search_plints(q, False)
    pairs = []
    for plint in rows:
        for i in xrange(10):
            if plint(pairtitles[i]) == q:
                if exclude:
                    if pairId == '%s_%s' % (plint.id, i+1):
                        exclude = False
                        continue
                tr = dict(plintId=plint.id, pairId=i+1, plint=plint.title, start1=int(plint.start1), comdata=plint.comdata)
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
        result = db(query).select(orderby=db.plint_table.root)  # sort by crosses
        response.searchstatus = 'OK' if result else T('not found!')
        return result
    else:
        response.searchstatus = T('too short query!')
        return []

def livesearch():
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
    from gluon.utils import web2py_uuid
    formkey = web2py_uuid()
    keyname = '_formkey[%s]' % formname
    session[keyname] = list(session.get(keyname, []))[-9:] + [formkey]
    return formkey

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
    result['details'] = T('Database update success!') if vars.delete else T('No changes')
    return result
