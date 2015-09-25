# -*- coding: utf-8 -*-

import os, time

_UKSATSE_ = T('Uksatse')  #T('Украэрорух')
_CREATE_NEW_CROSS_ = T('Create new cross')
_CROSS_ = T('Cross')
_VERTICAL_ = T('Vertical')
_PLINT_ = T('Plint')
_PAIR_ = T('Pair')
_TITLE_ = T('Title')
_COMMON_DATA_ = T('Common data: ')
_LOOP_ = T('Loop')
_CROSS_TO_ = T('Cross to ')
_CROSSED_TO_ = T('Crossed to ')
_NOT_CROSSED_ = T('Not crossed')
_REPLACE_TITLE_ = T('Raplace title')
_COME_FROM_ = T('Come from: ')
_LAST_MODIFIED_ON_ = T('Last modified on')
_SEARCH_ = T('Search')
_NEW_CROSS_ = T('New cross')
_EDIT_ = T('Edit ')
_EDIT_CROSS_ = T('Edit cross')
_EDIT_VERTICAL_ = T('Edit vertical')
_SIZE_ = 11 # size of <select> input fields
_404_ = URL('static', '404.html')
_ERROR_ = T('Error')
_BACKUP_ = T(' Backup database')
_RESTORE_ = T(' Restore database')

PFORM = lambda t, *a: FORM(DIV(t, _class='form-header'), DIV(*a, _class='form-body'))
FHEAD = lambda t: DIV(t, _class='form-header')
FTEXT = lambda t=_TITLE_, n='title', v='', h='', r='': DIV(LABEL(t), INPUT(_name=n, _value=v, requires=r), _title=h, _class='form-row')
FCDATA = lambda v: FTEXT(_COMMON_DATA_, 'comdata', v)
FCHECK = lambda t, n, v=True, h='', f='': DIV(LABEL(t), INPUT(_type='checkbox', _class='boolean', _name=n, value=v, _onclick=f), _title=h, _class='form-row')
FSTART = lambda v: FCHECK(T('Numeration start 1:'), 'start1', v)
FDEL = lambda t: DIV(LABEL(t), INPUT(_type='checkbox', _class='delete', _name='delete', value=False), _class='form-row')
FLABEL = lambda t: DIV(t, _class='form-row')
FOK = lambda: DIV(INPUT(_type='submit', _class='pull-right'), _class='submit-row')
BCOME = lambda t: DIV(FLABEL(B(t)),
                      FCHECK(T('Replace common data:'), 'replace_comdata', True, T("Autofill 'Common data' field\nwith 'Cross Vertical Plint' format")),
                      DIV(TABLE(TR(TD(_CROSS_), TD(_VERTICAL_), TD(_PLINT_)),
                                TR(get_select(3), get_select(4), get_select(5))), _class='form-row'))
ANIME = DIV(_class='ajaxanimation')
get_select = lambda i: TD(SELECT([], _id=selfields[i][0], _name=selfields[i][1], _size=_SIZE_))
get_plint_info = lambda plint: plint and " ".join((plint.root.title, plint.parent.title, plint.title)) or ''

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

def get_pair_crossed_info(plint, pair):
    lst = [0,0,0,0]
    if (plint > 0):
        lst[2] = plint   # crossed to plint
        plint = db.plint_table(plint)
        vert = db.vertical_table(plint.parent)
        lst[1] = int(vert)      # crossed to vertical
        s1 = _CROSSED_TO_ + vert.title + ', ' + plint.title     # [0]
        try:
            i = pair
            if (i < 1) or (i > 10): raise Exception
            lst[3] = i      # crossed to pair
            s2 = int(pair) - (not(plint.start1))
            lst[0] = s1 + ', ' + str(s2)
            return lst
        except Exception:
            lst[0] = s1
            return lst
    else:
        lst[0] = _NOT_CROSSED_
        return lst

def get_plint_outside_info(plint):
    t0 = _COME_FROM_
    t1 = t2 = t3 = 0
    t4 = ''
    #fromplint_id = plint.comefrom
    fromplint_id = db.plint_table(plint.comefrom)
    if fromplint_id:
        try:
            t1 = fromplint_id.root
            t2 = fromplint_id.parent
            t3 = fromplint_id.id
            t4 = ('%s %s %s') % (t1.title, t2.title, fromplint_id.title)
            t0 += t4
        except:
            t0 += _ERROR_
    return (t0,t1,t2,t3,t4)

def get_iter_label(s):
    import re
    x=list(re.finditer('%\d+', s))
    if x:
        p1 = x[-1].span()[0]
        p2 = x[-1].span()[1]
        s1 = s[0:p1]
        s2 = int(s[p1+1:p2])
        s3 = s[p2:]
    else:
        x=list(re.finditer('%', s))
        p1 = x[-1].span()[0]
        s1 = s[0:p1]
        s2 = 1
        s3 = s[p1+1:]
    return s1, s2, s3
#==================================================================

class Cross:
    def __init__(self, _index):
        self.index = _index
        self.record = db.cross_table[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.title = _rec.title
        self.header = _CROSS_+' '+self.title

    def update(self, t, ch):
        db.cross_table[self.index] = {'title': t}
        return db.vertical_table.update_or_insert(title=ch, parent=self.index) if ch else None

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
        self.header = self.cross.header + ', %s %s' % (_VERTICAL_, self.title)

    def delete(self):
        del db.vertical_table[self.index]

    def update(self, vars):
        '''vars = (form.vars.title,
                    form.vars.child,
                    form.vars.count,
                    bool(form.vars.start1),
                    form.vars.from_plint,
                    request.now.date(),
                    auth.user,
                    bool(form.vars.replace_comdata))
                    '''

        db.vertical_table[self.index] = {'title': vars.title}
        s = vars.child
        cnt = vars.count
        if cnt and s:
            if '%' in s:
                y = get_iter_label(s)
                k = y[1]
            else:
                cnt = 1
                k = -1
            try:
                fp = int(vars.from_plint)
                fv = int(vars.from_vert)
                plints = db((db.plint_table.parent == fv) & (db.plint_table.id >= fp)).select(limitby = (0, cnt))
                pc = len(plints)
                pi = 0
            except:
                pc = 0
            for i in range(cnt):
                if k >= 0:
                    s = y[0] + str(k) + y[2]
                    k += 1      # increment counter in title
                x = db((db.plint_table.title==s) & (db.plint_table.parent==self.index)).select().first()
                if not x:
                    x = db.plint_table.insert(root=self.cross.index, parent=self.index, title=s)
                plint = Plint(x.id)
                if pc and pi < pc:
                    vars.from_plint = plints[pi].id
                    pi += 1
                else:
                    vars.from_plint = 0
                vars.title = s
                plint.update_comefrom(vars)
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
        self.header = self.vertical.header + ', %s %s' % (_PLINT_, self.title)
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s' % (_LAST_MODIFIED_ON_, _rec.modon, get_user_name(_rec.modby))
        self.outside_info = get_plint_outside_info(_rec)
        self.comdata = _rec.comdata
        self.start1 = _rec.start1
        self.comefrom = _rec.comefrom

    get_pair_titles = lambda self: (self.record('pid' + `i`) for i in xrange(1, 11))

    def delete(self):
        del db.plint_table[self.index]

    def update_crossing(self, formvars):
        v = formvars.pairtitles.splitlines()
        if v:
            k = len(v)+1
            if k > 11: k = 11
            for i in xrange(1, k):
                pair = Pair(self.index, i)
                formvars.title = v[i-1]
                formvars.cross_pair = i
                formvars.loop = pair.loop
                formvars.replace_title = True
                pair.update(formvars)

    def update_comefrom(self, formvars):
        vars = (formvars.title,                  # 0 title str
                bool(formvars.start1),           # 1 start1 bool
                formvars.comdata,                # 2 common data str
                formvars.from_plint,             # 3 come from str
                request.now.date(),              # 4 modified_on <type 'datetime.date'>
                auth.user,                       # 5 modified_by type <class 'gluon.dal.objects.Row'>
                bool(formvars.replace_comdata))  # 6 comdata auto fill bool
                #formvars.cross_plint,           # 7 cross to that plint
                #formvars.pairtitles)            # 8 pairtitles textarea
        '''
        plintfields =  'title',      # 0
                       'start1',     # 1
                       'comdata',    # 2
                       'comefrom',   # 3
                       'modon',      # 4
                       'modby'       # 5
        '''
        outplint = db.plint_table(vars[3])
        dictself = dict(zip(plintfields, vars[0:6]))
        dictout  = dict(zip(plintfields[4:6], vars[4:6]))
        cd_en = vars[6]
        if outplint:
            if outplint.id == self.index: # outplint.id <type 'long'>,  self.index <type 'int'>
                outplint = 0    # if connect to self - disconnect
                dictself[plintfields[3]] = 0     # come from = 0
            else: # outplint is another plint, connect to him
                dictout[plintfields[3]] = self.index
                if cd_en:
                    dictout[plintfields[2]] = '%s %s %s' % (self.cross.title, self.vertical.title, vars[0])
                db.plint_table[outplint.id] = dictout   # update new remote plint
        # update this plint
        if cd_en:
            dictself[plintfields[2]] = get_plint_info(outplint)
        db.plint_table[self.index] = dictself

        # disconnect from old plint
        oldplint = db.plint_table(self.comefrom)
        if oldplint:  # if connection exist
            if oldplint.id != self.index:
                try:
                    i = outplint.id
                except:
                    i = 0
                if oldplint.id != i:
                    if oldplint.comefrom == self.index:  # old out plint was linked to this?
                        dictout[plintfields[3]] = 0      # remove connection
                        if cd_en:
                            dictout[plintfields[2]] = ''
                        # update old remote plint
                        db.plint_table[self.comefrom] = dictout
#==================================================================

class Pair:
    def __init__(self, _plint, _pair):
        if _pair>10 or _pair<1: raise HTTP(404)
        self.plint = Plint(_plint)
        _rec = self.plint.record
        self.index = _rec.id
        self.pair = _pair
        f = pairfields[_pair-1]
        self.fp = f
        self.title = _rec(f[0])
        dx = 0 if _rec.start1 else -1
        self.header = self.plint.header + ', %s %s' % (_PAIR_, _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.modified_info = '%s %s, %s' % (_LAST_MODIFIED_ON_, _rec(f[3]), get_user_name(_rec(f[4])))
        self.to_plint = _rec(f[1])   # crossed_to_plint, reference plint_table
        self.to_pair = _rec(f[2])    # crossed_to_pair, string
        self.crossed_info = get_pair_crossed_info(self.to_plint, self.to_pair)
        self.loop = _rec(f[5])

    def update(self, formvars):
        vars = (formvars.title,                 # 0   str
                formvars.cross_plint,           # 1   str; if not crossed, then = ''
                formvars.cross_pair,            # 2   str
                request.now.date(),             # 3
                auth.user,                      # 4
                bool(formvars.loop),            # 5
                bool(formvars.replace_title))   # 6
        #pair.fields = 'pair','crossed_to_plint','crossed_to_pair','modified_on','modified_by','loopback'
        cd_en = vars[6]
        try:
            outplint = int(vars[1])  # cross to new plint
            outpair = int(vars[2])  # cross to new pair
            if outplint==self.index and outpair==self.pair: raise Exception
            if outpair<1 or outpair>10: raise Exception
            fd = pairfields[outpair-1]  # get fieldset tuple of destination plint
            dictout = dict(zip(fd[1:5], (self.index, self.pair, vars[3], vars[4])))
            if cd_en: dictout[fd[0]] = vars[0]
            db.plint_table[outplint] = dictout # update to new plint crossing data
        except:
            outplint = 0
            outpair = 0
        db.plint_table[self.index] = dict(zip(self.fp, (vars[0], outplint, outpair, vars[3], vars[4], vars[5])))   # update this plint

        # remove old connection
        try:
            oldpair = int(self.to_pair)
            oldplint = 0<oldpair<11 and db.plint_table(self.to_plint)
            if oldplint:
                if not((oldplint.id==self.index) and (oldpair==self.pair)):
                    if not((oldplint.id==outplint) and (oldpair==outpair)):
                        fd = pairfields[oldpair-1]
                        f1 = int(oldplint(fd[1]))
                        f2 = int(oldplint(fd[2]))
                        if (f1==self.index) and (f2==self.pair):
                            db.plint_table[self.to_plint] = dict(zip(fd[0:5], ('-----', 0, 0, vars[3], vars[4])))
        except:
            pass
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

    datenow = request.now.date()
    dateold = '2014-11-12'

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
            lb = True   # rus to lat
            if lb:
                #s1 = s1.replace('БМ', 'BM')
                #s1 = s1.replace('БКТ', 'BKT')
                s1 = s1.replace('М', 'M')
                #s1 = s1.replace('К', 'K')
                #s1 = s1.replace('Р', 'P')
            # plint title, start with?, cross_index,     vertical_index
            lst = [s1, verticalitem[2], verticalitem[3], vertical_index]
            plintnames.append(lst)

    table = 'plint_table'
    print >> csvfile, '\n\nTABLE ' + table
    #print >> csvfile, ','.join('%s.%s' % (table, i) for i in ['id', 'root', 'parent'] + plintfields + [s1 for s2 in pairfields for s1 in s2])
    print >> csvfile, ','.join('%s.%s'%(table,i) for i in ['id','root','parent']+plintfields+sum(pairfields,[]))
    x = 1
    for plintitem in plintnames:
        sp = ''
        for i in xrange(0, 10):
            s1 = readstring(f)   # pair name
            s2 = readstring(f)   # pair loopback
            lb = str(bool(int(s2)))
            # 'pid','ptopl','ptopr','pmodon','pmodby','ploop'
            spx = (',%s,0,0,%s,1,%s' % (s1,datenow,lb))
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
        #   id                               root,         parent,      title,       start1,    comdata, comefrom, modon, modby
        a = '%i,%d,%d,%s,%s,%s,0,%s,1' % (x, plintitem[2], plintitem[3], plintitem[0], str(start1), s1, dateold)
        print >> csvfile, a + sp
        x += 1

    print >> csvfile, '\n\nEND'
    #db.import_from_csv_file(csvfile, restore=True)
    #return csvfile.getvalue()
    csvfile.seek(0)
    return csvfile

    #csvfile.close()
