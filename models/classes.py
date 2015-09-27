# -*- coding: utf-8 -*-

import os, time
from gluon.storage import Storage

_404_ = URL('static', '404.html')

#==================================================================
L = Storage() # Lexicon storage object
L._ADD_LINK_ = T('Add link to chain')
L._ADMIN_DB_ = T('Direct edit DB')
L._BACK_ = T('Back')
L._BACKUP_ = T('Backup DB')
L._CANCEL_ = T('Cancel')
L._CHAIN_ = T('Edit chain')
L._CLEAR_DB_ = T('Clear DB')
L._COMMON_DATA_ = T('Common data')
L._COUNT_ = T('Count')
L._CROSS_ = T('Cross')
L._DB_UPD_ = T('Database update success!')
L._DEL_ = T('Delete')
L._EDIT_CROSS_ = T('Edit cross')
L._EDIT_PAIR_ = T('Edit pair')
L._EDIT_PLINT_ = T('Edit plint')
L._EDIT_VERT_ = T('Edit vertical')
L._EDITOR_ = T('Editor')
L._ERROR_ = T('Error')
L._IMPORT_ = T('Import DB')
L._FIND_ = T('Find')
L._FNDRES_ = T('Found results for "%s"')
L._FOLLOW_ = T('Follow')
L._FOR_ALL_ = T('Apply for all')
L._FOUND_ = T('Found: ')
L._HELP_ = T('Help')
L._HOME_ = T('Home')
L._LAST_MOD_ = T('Last modified')
L._MERGE_ = T('Merge')
L._NEW_CROSS_ = T('New cross')
L._NEWPL_ = T('New plint')
L._NEWS_ = T('News')
L._NOCHANGE_ = T('No changes')
L._NOT_CROSSED_ = T('Not crossed')
L._OLDPL_ = T('Existing plint')
L._PAIR_ = T('Pair')
L._PAIR_T_ = T('Pair titles')
L._PASTE_ = T('Paste')
L._PASTE_CB_ = T('Paste from Clipboard')
L._PLINT_ = T('Plint')
L._PLINT_T_ = T('Plint title')
L._REPLACE_ = T('Replace')
L._RESTORE_ = T('Restore DB')
L._REM_CD_ = T('Replace remote common data')
L._SEARCH_ = T('Search')
L._START_1_ = T('Numeration start 1')
L._TITLE_ = T('Title')
L._TOOSHORT_ = T('too short query!')
L._TOOLS_ = T('Tools')
L._UKSATSE_ = T('Uksatse')
L._VERTICAL_ = T('Vertical')
L._VERT_T_ = T('Vertical title')
L._VIEW_VERT_ = T('View vertical')
L._WRAP_ = T('Wrap text')
#==================================================================

BSFORM = lambda *a: FORM(*a, _class="form-horizontal", _role="form")
FHEAD = lambda t: DIV(t, _class='form-header')
FTEXT = lambda t=L._TITLE_, n='title', v='', h='', r='': DIV(
    LABEL(t,  _class="col-md-2 control-label"),
    DIV(INPUT(_name=n, _value=v, requires=r, _class="form-control"), _class="col-md-8"), _title=h, _class="form-group")

FCDATA = lambda v: FTEXT(L._COMMON_DATA_, 'comdata', v)
FCHECK = lambda t, n, v=True, h='', f='': DIV(LABEL(t), INPUT(_type='checkbox', _class='boolean', _name=n, value=v, _onclick=f), _title=h, _class='form-row')
FSTART = lambda v: FCHECK(T('Numeration start 1:'), 'start1', v)
FDEL = lambda t: DIV(LABEL(t), INPUT(_type='checkbox', _class='delete', _name='delete', value=False), _class='form-row')
FLABEL = lambda t: DIV(t, _class='form-row')
FOK = lambda: INPUT(_type='submit', _class='pull-right btn-primary')
FOKCANCEL = lambda u: DIV(A(T('Cancel'), _href=u, _class='btn btn-primary pull-right'), FOK())

users = {}  # global dictionary, cashe type, contains printable user name
def get_user_name(uid):
    if uid:
        who = users.get(uid)
        if not who:
            who = uid.first_name + ' ' + uid.last_name
            users[uid] = who
    else:
        who = ''
    return who

def get_user_id():
    return auth.user.id if auth.user else False

get_whenwho = lambda: dict(modon=request.now.date(), modby=auth.user.id)

#==================================================================

class Cross:
    def __init__(self, _index):
        self.index = _index
        self.record = db.cross_table[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.title = _rec.title
        self.header = L._CROSS_+' '+self.title

    def update(self, vars):
        db.cross_table[self.index] = {'title': vars.title}
        vt = vars.verticaltitle
        return db.vertical_table.update_or_insert(title=vt, parent=self.index) if vt else None  # return id of new record

    def delete(self):
        del db.cross_table[self.index]
#==================================================================

class Vertical:
    def __init__(self, _index):
        self.index = _index
        self.record = db.vertical_table[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.cross = Cross(_rec.parent.id)
        self.title = _rec.title
        self.header = self.cross.header + ', %s %s' % (L._VERTICAL_, self.title)

    def delete(self):
        del db.vertical_table[self.index]

    def update(self, vars):
        db.vertical_table[self.index] = {'title': vars.title}
        cnt = int(vars.count)
        mainchange = False
        if cnt:
            try:
                fp = int(vars.from_plint)
                fv = int(vars.from_vert)
                outplints = db((db.plint_table.parent == fv) & (db.plint_table.id >= fp)).select(limitby = (0, cnt))
                pc = len(outplints)
                pi = 0
            except:
                pc = 0

            idx = 0
            while(vars['title_'+str(idx)] and idx < 100):
                si = str(idx)
                idx += 1
                pt = vars['title_'+si]  # plint title, add new or modify if it exist
                xp = db((db.plint_table.title==pt) & (db.plint_table.parent==self.index)).select().first()
                if not xp:
                    xp = db.plint_table.insert(root=self.cross.index, parent=self.index, title=pt)
                #plint = Plint(xp.id)
                maindata = dict(comdata=vars['comdata_'+si])
                if vars['start1_'+si]:
                    maindata['start1'] = vars['start1_'+si]
                pairdata = {}
                for pj in xrange(1, 11):
                    pairdata[pj] = vars['pid_%s_%i' % (si, pj)] or ''
                if plint_update(xp.id, maindata, pairdata):
                    mainchange = True
                if pc and pi < pc and vars['rcomdata_'+si]:
                    maindata = dict(comdata=vars['rcomdata_'+si])
                    if plint_update(outplints[pi].id, maindata, {}):
                        mainchange = True
                    pi += 1
        return mainchange

#==================================================================

class Plint:
    def __init__(self, _index):
        self.index = _index
        self.record = db.plint_table[_index]   # type <class 'gluon.dal.objects.Row'>
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.vertical = Vertical(_rec.parent)
        self.cross = self.vertical.cross
        self.title =_rec.title
        self.titles = self.cross.title, self.vertical.title,  self.title
        self.header = self.vertical.header + ', %s %s' % (L._PLINT_, self.title)
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s' % (L._LAST_MOD_, _rec.modon, get_user_name(_rec.modby))
        self.comdata = _rec.comdata
        self.start1 = _rec.start1

    get_pair_titles = lambda self: [self.record('pid' + `i`) for i in xrange(1, 11)]

    def delete(self):
        del db.plint_table[self.index]

    def update(self, vars):
        maindata = dict(title=vars.title, start1=bool(vars.start1), comdata=vars.comdata)
        pnew = vars.pairtitles.splitlines()
        pl = len(pnew)
        pairdata = {}
        for i in xrange(0, 10):
            v = pnew[i] if pl > i else ''
            pairdata[i+1] = v
        return plint_update(self.index, maindata, pairdata, bool(vars.merge))

#==================================================================

def plint_update(index, maindata, pairdata, merge=False):
    """
    index - record id
    maindata - dict, possible keys: title, start1, comdata
    pairdata - dict, possible keys: 1, 2, ... 10: value - pair title
    merge - boolean, if True, new pair title merge with existing
    used by editpair, editfound, editplint (through Plint.update), editvertical (through Vertical.update)
    """
    plint = db.plint_table[index]
    whenwho = get_whenwho()
    mainchange = False
    if maindata:
        keys = maindata.keys()
        for key in keys:
            if plint(key) != maindata[key]:
                mainchange = True
                break
    if pairdata:
        keys = pairdata.keys()
        for key in keys:
            sk = str(key)
            pairkey = 'pid' + sk
            if merge: pairdata[key] = plint(pairkey) + pairdata[key]
            if plint(pairkey) != pairdata[key]:
                mainchange = True
                maindata[pairkey] = pairdata[key]
                maindata['pmodon' + sk] = whenwho['modon']
                maindata['pmodby' + sk] = whenwho['modby']
    if mainchange:
        maindata.update(whenwho)
        db.plint_table[index] = maindata
    return mainchange

#==================================================================

class Pair:
    def __init__(self, _plint, _pair):
        if _pair>10 or _pair<1: raise HTTP(404)
        self.plint = Plint(_plint)
        _rec = self.plint.record
        self.index = _rec.id
        self.pair = _pair
        self.vertical = self.plint.vertical
        f = pairfields[_pair-1]
        self.fp = f
        self.title = _rec(f[0])
        dx = 0 if _rec.start1 else -1
        self.header = self.plint.header + ', %s %s' % (L._PAIR_, _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.modified_info = '%s %s, %s' % (L._LAST_MOD_, _rec(f[1]), get_user_name(_rec(f[2])))

#==================================================================

class TimeMeter:
    def __init__(self):
        self.points = []
        self.timestart = time.time()

    def append(self, s):
        qt = int((time.time() - self.timestart)*1000.0)
        self.points.append(s+' time = %sms'%qt)
        self.timestart = time.time()

    def show(self, s):
        self.append(s)
        return DIV([DIV(I(s)) for s in self.points], _class='well')
#==================================================================

def import_from_txt1(f):
    import cStringIO

    def readstring(f):
        return f.readline().strip().replace(',', '.')

    datenow = str(request.now.date())
    dateold = '2014-11-12'
    #dateold = datetime.date(2014, 11, 122)
    dateplint = dateold
    datepair = dateold

    crosses = []
    verticals = []
    plintnames = []

    csvfile = cStringIO.StringIO()
    print >> csvfile, 'TABLE cross_table'
    print >> csvfile, 'cross_table.id,cross_table.title'
    for i in xrange(1, int(f.readline()) + 1):
        s1 = readstring(f)   # is a cross_title
        print >> csvfile, '%d,%s' % (i,s1)
        crosses.append([s1, readstring(f)])  # [cross title, vertical count in cross]
    table = 'vertical_table'
    print >> csvfile, '\n\nTABLE ' + table
    print >> csvfile, ','.join('%s.%s' % (table, i) for i in ('id', 'parent', 'title'))
    x = 1
    for cross_index, crossitem in enumerate(crosses, start = 1):
        for i in xrange(1, int(crossitem[1]) + 1):    # crossitem[1] is a vertical_count
            s1 = readstring(f)   # vertical title
            s2 = readstring(f)   # plint count in vertical
            s3 = readstring(f)   # numeration start 1 vertical
            print >> csvfile, '%i,%d,%s' % (x, cross_index, s1)
            x += 1
            lst = [s1, s2, s3, cross_index]
            verticals.append(lst)

    for vertical_index, verticalitem in enumerate(verticals, start = 1):
        for i in xrange(1, int(verticalitem[1]) + 1):
            s1 = readstring(f)
            lb = False   # rus to lat replace
            if lb:
                pass
                #s1 = s1.replace('БМ', 'BM')
                #s1 = s1.replace('БКТ', 'BKT')
                #s1 = s1.replace('М', 'M')
                #s1 = s1.replace('К', 'K')
                #s1 = s1.replace('Р', 'P')
            # plint title, start with?, cross_index,     vertical_index
            lst = [s1, verticalitem[2], verticalitem[3], vertical_index]
            plintnames.append(lst)

    table = 'plint_table'
    print >> csvfile, '\n\nTABLE ' + table
    #print >> csvfile, ','.join('%s.%s' % (table, i) for i in ['id', 'root', 'parent'] + plintfields + [s1 for s2 in pairfields for s1 in s2])
    lst = ['id','root','parent']+plintfields+sum(pairfields,[])
    fieldcount = len(lst)
    print >> csvfile, ','.join('%s.%s'%(table,i) for i in lst)
    x = 1
    for plintitem in plintnames:
        sp = ''
        for i in xrange(0, 10):
            s1 = readstring(f)   # pair name
            s2 = readstring(f)   # pair loopback
            #lb = str(bool(int(s2)))
            # 'pid','pmodon','pmodby'
            spx = (',%s,%s,1' % (s1, datepair))
            if i == 0:
                sp0 = spx
            else:
                sp = sp + spx
        s1 = readstring(f)   # common data
        s2 = readstring(f)   # start with?
        start1 = True
        if plintitem[1] == '0':
            start1 = False
        if s2 == '1':
            start1 = not start1
        if start1:
            sp = sp + sp0
        else:
            sp = sp0 + sp
        #   id                               root,         parent,      title,       start1,    comdata, modon, modby
        a = '%i,%d,%d,%s,%s,%s,%s,1' % (x, plintitem[2], plintitem[3], plintitem[0], str(start1), s1, dateplint) + sp
        if x == 1:
            if len(a.split(',')) != fieldcount:
                raise Exception('Fields not corresponding to values')
        print >> csvfile, a
        x += 1

    print >> csvfile, '\n\nEND'
    #db.import_from_csv_file(csvfile, restore=True)
    #return csvfile.getvalue()
    csvfile.seek(0)
    return csvfile

    #csvfile.close()
