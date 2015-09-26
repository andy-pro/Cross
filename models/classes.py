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
_BACK_ = T('Back')

#PFORM = lambda t, *a: FORM(DIV(t, _class='form-header'), DIV(*a, _class='form-body'))
BSFORM = lambda *a: FORM(*a, _class="form-horizontal", _role="form")

#PFORM = lambda t, *a: FORM(DIV(DIV(B(t), _class='panel-heading'), DIV(DIV(*a), _class='panel-body'), _class="panel panel-warning"), _role="form")
#PFORM = lambda t, *a: FORM(DIV(DIV(B(t), _class='panel-heading'), DIV(DIV(*a), _class='panel-body'), _class="panel panel-warning"), _role="form")

FHEAD = lambda t: DIV(t, _class='form-header')
#FTEXT = lambda t=_TITLE_, n='title', v='', h='', r='': DIV(LABEL(t), INPUT(_name=n, _value=v, requires=r), _title=h, _class='form-row')
#FTEXT = lambda t=_TITLE_, n='title', v='', h='', r='': DIV(LABEL(t), INPUT(_name=n, _value=v, requires=r), _title=h)
FTEXT = lambda t=_TITLE_, n='title', v='', h='', r='': DIV(
    LABEL(t,  _class="col-md-2 control-label"),
    DIV(INPUT(_name=n, _value=v, requires=r, _class="form-control"), _class="col-md-8"), _title=h, _class="form-group")

FCDATA = lambda v: FTEXT(_COMMON_DATA_, 'comdata', v)
FCHECK = lambda t, n, v=True, h='', f='': DIV(LABEL(t), INPUT(_type='checkbox', _class='boolean', _name=n, value=v, _onclick=f), _title=h, _class='form-row')
FSTART = lambda v: FCHECK(T('Numeration start 1:'), 'start1', v)
FDEL = lambda t: DIV(LABEL(t), INPUT(_type='checkbox', _class='delete', _name='delete', value=False), _class='form-row')
FLABEL = lambda t: DIV(t, _class='form-row')
#FOK = lambda: DIV(INPUT(_type='submit', _class='pull-right'), _class='submit-row')
FOK = lambda: INPUT(_type='submit', _class='pull-right btn-primary')
FOKCANCEL = lambda u: DIV(A(T('Cancel'), _href=u, _class='btn btn-primary pull-right'), FOK())
BCOME = lambda t: DIV(FLABEL(B(t)),
                      FCHECK(T('Replace common data:'), 'replace_comdata', True, T("Autofill 'Common data' field\nwith 'Cross Vertical Plint' format")),
                      DIV(TABLE(TR(TD(_CROSS_), TD(_VERTICAL_), TD(_PLINT_)),
                                TR(get_select(3), get_select(4), get_select(5))), _class='form-row'))
AJAXANIME = DIV(_class='ajaxanimation')
#get_select = lambda i: TD(SELECT([], _id=selfields[i][0], _name=selfields[i][1], _size=_SIZE_))
#get_select = lambda i, lst: TD(SELECT(lst, _id=selfields[i][0], _name=selfields[i][1], _size=_SIZE_, _class="form-control col-xs-4"))
get_select = lambda i, lst: DIV(SELECT(lst, _id=selfields[i][0], _name=selfields[i][1], _size=_SIZE_, _class="form-control"), _class="mycol")
get_plint_info = lambda plint: plint and " ".join((plint.root.title, plint.parent.title, plint.title)) or ''
def get_chain(chain):
    labels = _CROSS_, _VERTICAL_, _PLINT_, _PAIR_
    tr0 = TR(TD(INPUT(_value=simplejson.dumps(chain), _name='chaindata', _type='hidden')))
    tr1 = TR([TD(label) for label in labels])
    return TABLE(tr0, tr1, _id="chaintable", _class="table-dialog")

def get_select_chain():
    labels = _CROSS_, _VERTICAL_, _PLINT_, _PAIR_
    #fields = [cross.title for cross in db(db.cross_table).select()], [], [], []
    stages = (
        ('crossPos', 'crosses', 'cross'),
        ('verticalPos', 'verticals[link.crossId]', 'vertical'),
        ('plintPos', 'plints[link.verticalId]', 'plint'),
        ('pairPos', 'pairs[link.pairId]', 'pair'))
    tr1 = TR([TD(label) for label in labels])
    #tr2 = TR([TD(SELECT(item, _class="form-control")) for item in fields])
    #tr2 = TR([TD(SELECT(item, _class="form-control", _ng-model="link.crossId")) for item in fields])
    #tr2 = TR([TD(XML('<select class="form-control" ng-model="link.%s"></select>' % stage)) for stage in stages], _class="myclass", ng={"repeat": "link in chain"})
    #tr2 = TR([TD(XML('<select class="form-control" ng-model="link.%s"></select>' % stage)) for stage in stages], **{"ng-repeat": "link in chain"})
    #SELECT(item, _class="form-control", _ng-model="link.crossId")) for item in fields])
    tr2 = TR(([TD(SELECT(OPTION("{?item[1]?}", **{"_ng-repeat":"item in %s" % stage[1], "_value":"{?$index?}"}),
                  **{"_class":"form-control",
                     "_ng-model":"link.%s" % stage[0],
                     "_ng-change":"%schange(link.%s, $index)" % (stage[2], stage[0]),
                     #"_size":"25",
                     })) for stage in stages]), **{"_ng-repeat":"link in chain"})
    return TABLE(tr1, tr2, _class="table-dialog")

#get_add_panel = lambda: INPUT(_type='button', _class='btn-sm btn-success pull-right', value='+', _title=T('Add link to chain'), **{"_ng-click":"addLink()"})
get_add_panel = lambda: INPUT(_type='button', _class='btn-sm btn-success pull-right', value='+', _title=T('Add link to chain'), _onclick="addLink()")
    #return DIV(XML('<button type="button" class="btn-success pull-right">+</button>'), _class='form-row')
    #return ''

    #crosses = []
    #return DIV(DIV(SELECT([cross.title for cross in crosses], _class="form-control input-small"), SELECT([], _class="form-control col-sx-3"), SELECT([], _class="form-control col-sm-2")), _class="form-group")
    #return DIV(TABLE(TR(TD(_CROSS_), TD(_VERTICAL_), TD(_PLINT_), _class="info"), TR(get_select(3, crosses), get_select(4, []), get_select(5, [])), _class="table"), _class="form-group")
    #return DIV(TABLE(TR(TD(_CROSS_), TD(_VERTICAL_), TD(_PLINT_), _class="info"), TR(get_select(3, crosses), get_select(4, []), get_select(5, [])), _class="table"), _class="form-group")
    #return DIV(DIV(_CROSS_, _VERTICAL_, _PLINT_, _class="info"), DIV(get_select(3, crosses), get_select(4, []), get_select(5, []), _class="info"), _class="form-group form-inline")


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
        self.comdata = _rec.comdata
        self.start1 = _rec.start1

    get_pair_titles = lambda self: (self.record('pid' + `i`) for i in xrange(1, 11))

    def delete(self):
        del db.plint_table[self.index]

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
        self.modified_info = '%s %s, %s' % (_LAST_MODIFIED_ON_, _rec(f[1]), get_user_name(_rec(f[2])))

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
            spx = (',%s,%s,1' % (s1,datenow))
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
        a = '%i,%d,%d,%s,%s,%s,%s,1' % (x, plintitem[2], plintitem[3], plintitem[0], str(start1), s1, dateold) + sp
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
