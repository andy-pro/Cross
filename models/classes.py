# -*- coding: utf-8 -*-

_UKSATSE_ = T('Uksatse')  #T('Украэрорух')
_CREATE_NEW_CROSS_ = T('Create new cross')
_CROSS_ = T('Cross')
_VERTICAL_ = T('Vertical')
_PLINT_ = T('Plint')
_PAIR_ = T('Pair')
_TITLE_ = T('Title')
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
_SIZE_ = 10 # size of <select> input fields
_404_ = URL('static', '404.html')
_ERROR_ = T('Error')
_BACKUP_ = T('Backup database')
_RESTORE_ = T('Restore database')

plintfields = 'title','numeration_start_1','common_data','come_from','modified_on','modified_by'
selfields = (('vertsel','cross_vert'), ('plintsel','cross_plint'), ('pairsel', 'cross_pair'), ('fromcrosssel','from_cross'), ('fromvertsel','from_vert'), ('fromplintsel','from_plint'))

PFORM = lambda t, *a: FORM(DIV(t, _class='form-header'), DIV(*a, _class='form-body'))
FHEAD = lambda t: DIV(t, _class='form-header')
FTEXT = lambda t=_TITLE_, n='title', v='', h='', r='': DIV(LABEL(t), INPUT(_name=n, _value=v, requires=r), _title=h, _class='form-row')
FCDATA = lambda v: FTEXT(T('Common data:'), 'common_data', v)
FCHECK = lambda t, n, v=True, h='', f='': DIV(LABEL(t), INPUT(_type='checkbox', _class='boolean', _name=n, value=v, _onclick=f), _title=h, _class='form-row')
FSTART = lambda v: FCHECK(T('Numeration start 1:'), 'numeration_start_1', v)
FDEL = lambda t: DIV(LABEL(t), INPUT(_type='checkbox', _class='delete', _name='delete', value=False), _class='form-row')
FLABEL = lambda t: DIV(t, _class='form-row')
FOK = lambda: DIV(INPUT(_type='submit', _class='default'), _class='submit-row')
BCOME = lambda t: DIV(FLABEL(B(t)),
                      FCHECK(T('Replace common data:'), 'replace_common_data', True, T("Autofill 'Common data' field\nwith 'Cross Vertical Plint' format")),
                      DIV(TABLE(TR(TD(_CROSS_), TD(_VERTICAL_), TD(_PLINT_)),
                                TR(get_select(3), get_select(4), get_select(5))), _class='form-row'))

get_title = lambda t='', n='title', r='': (_TITLE_, INPUT(_name=n, _value = t, requires=r))
get_check = lambda t, n, v=True, h='', f='': SPAN(t, INPUT(_type='checkbox', _class='boolean', _name=n, value=v, _onclick=f),_title=h)
get_select = lambda i: TD(SELECT([], _id=selfields[i][0], _name=selfields[i][1], _size=_SIZE_))

get_user_name = lambda uid: uid and uid.first_name + ' ' + uid.last_name or ''
get_plint_info = lambda plint: plint and " ".join((plint.root.title, plint.parent.title, plint.title)) or ''

def get_pair_fields(i):
    i = str(i)
    return 'pair_id_'+i,'crossed_to_plint_id_'+i,'crossed_to_pair_id_'+i,'modified_on_id_'+i,'modified_by_id_'+i,'loopback_id_'+i

def get_pair_crossed_info(plint, pair):
    lst = [0,0,0,0]
    if (plint > 0):
        lst[2] = int(plint)
        vert = db.vertical_table(plint.parent)
        lst[1] = int(vert)
        s1 = _CROSSED_TO_ + vert.title + ', ' + plint.title
        try:
            i = int(pair)
            if (i < 1) or (i > 10): raise Exception
            lst[3] = i
            s2 = int(pair) - (not(plint.numeration_start_1))
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
    fromplint_id = plint.come_from
    if fromplint_id:
        try:
            t1 = fromplint_id.root
            t2 = fromplint_id.parent
            t3 = fromplint_id
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
                    bool(form.vars.numeration_start_1),
                    form.vars.from_plint,
                    request.now.date(),
                    auth.user,
                    bool(form.vars.replace_common_data))
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
                    vars.from_plint = None
                vars.title = s
                plint.update_come_from(vars)

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
        self.modified_info = '%s %s, %s' % (_LAST_MODIFIED_ON_, _rec.modified_on, get_user_name(_rec.modified_by))
        self.outside_info = get_plint_outside_info(_rec)
        self.common_data = _rec.common_data
        self.numeration_start_1 = _rec.numeration_start_1
        self.come_from = _rec.come_from

    get_pair_titles = lambda self: (self.record('pair_id_' + `i`) for i in xrange(1, 11))

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

    def update_come_from(self, formvars):
        vars = (formvars.title,                      # 0 title str
                bool(formvars.numeration_start_1),   # 1 numeration_start_1 bool
                formvars.common_data,                # 2 common_data str
                formvars.from_plint,                 # 3 come_from str
                request.now.date(),                  # 4 modified_on <type 'datetime.date'>
                auth.user,                           # 5 modified_by type <class 'gluon.dal.objects.Row'>
                bool(formvars.replace_common_data))  # 6 common_data auto fill bool
                #formvars.cross_plint,               # 7 cross to that plint
                #formvars.pairtitles)                # 8 pairtitles textarea
        '''
        plintfields =  'title',                      # 0
                       'numeration_start_1',         # 1
                       'common_data',                # 2
                       'come_from',                  # 3
                       'modified_on',                # 4
                       'modified_by'                 # 5
        '''
        outplint = db.plint_table(vars[3])
        dictself = dict(zip(plintfields, vars[0:6]))
        dictout  = dict(zip(plintfields[4:6], vars[4:6]))
        cd_en = vars[6]
        if outplint:
            if outplint.id == self.index: # outplint.id <type 'long'>,  self.index <type 'int'>                
                outplint = 0    # if connect to self - disconnect
                dictself[plintfields[3]] = None     # come_from = None
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
        oldplint = db.plint_table(self.come_from)
        if oldplint:  # if connection exist
            if oldplint.id != self.index:
                try:
                    i = outplint.id
                except:
                    i = 0
                if oldplint.id != i:
                    if oldplint.come_from == self.index:    # old out plint was linked to this?
                        dictout[plintfields[3]] = None  # remove connection
                        if cd_en:
                            dictout[plintfields[2]] = ''
                        # update old remote plint
                        db.plint_table[self.come_from] = dictout
#==================================================================                        
                        
class Pair:
    def __init__(self, _plint, _pair):
        if _pair>10 or _pair<1: raise HTTP(404)
        self.plint = Plint(_plint)
        _rec = self.plint.record
        self.index = _rec.id
        self.pair = _pair
        f = get_pair_fields(_pair)
        self.fp = f
        self.title = _rec(f[0])
        dx = 0 if _rec.numeration_start_1 else -1
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
            fd = get_pair_fields(outpair)  # get fieldset tuple of destination plint
            dictout = dict(zip(fd[1:5], (self.index, self.pair, vars[3], vars[4])))
            if cd_en: dictout[fd[0]] = vars[0]
            db.plint_table[outplint] = dictout # update to new plint crossing data
        except:
            outplint = None
            outpair = ''
        db.plint_table[self.index] = dict(zip(self.fp, (vars[0], outplint, outpair, vars[3], vars[4], vars[5])))   # update this plint
        
        # remove old connection
        try:
            oldpair = int(self.to_pair)
            oldplint = 0<oldpair<11 and db.plint_table(self.to_plint)
            if oldplint:
                if not((oldplint.id==self.index) and (oldpair==self.pair)):
                    if not((oldplint.id==outplint) and (oldpair==outpair)):
                        fd = get_pair_fields(oldpair)
                        f1 = int(oldplint(fd[1]))
                        f2 = int(oldplint(fd[2]))
                        if (f1==self.index) and (f2==self.pair):
                            db.plint_table[self.to_plint] = dict(zip(fd[0:5], ('-----', None, '', vars[3], vars[4])))
        except:
            pass
