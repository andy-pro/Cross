# -*- coding: utf-8 -*-

_CROSS_ = T('Cross')
_VERTICAL_ = T('Vertical')
_PLINT_ = T('Plint')
_PAIR_ = T('Pair')
_CROSSED_TO_ = T('Crossed to ')
_NOT_CROSSED_ = T('Not crossed')
_COME_FROM_ = T('Come from: ')
_LAST_MODIFIED_ON_ = T('Last modified on')
_SIZE_ = 10 # size of <select> input fields

def get_pair_fields(i):
    i = str(i)
    t = 'pair_id_'+i,'crossed_to_plint_id_'+i,'crossed_to_pair_id_'+i,'modified_on_id_'+i,'modified_by_id_'+i,'loopback_id_'+i
    return t

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

def get_plint_info(plint):
    if plint: return ('%s %s %s') % (plint.root.title, plint.parent.title, plint.title)
    else: return ''

def get_plint_outside_info(plint):
    info = {'title':'', 'cross':0, 'vertical':0, 'plint':0, 'address':''}
    #info = {}
    fromplint_id = plint.come_from
    s1 = _COME_FROM_
    if fromplint_id:
        a1 = fromplint_id.root
        a2 = fromplint_id.parent
        info['cross'] = a1
        info['vertical'] = a2
        info['plint'] = fromplint_id
        info['address'] = ('%s %s %s') % (a1.title, a2.title, fromplint_id.title)
        s1 += info['address']
    info['title'] = s1
    return info

class Cross:
    def __init__(self, _index):
        self.index = _index
        _rec = db.cross_table[_index]
        self.title = _rec.title

class Vertical:
    def __init__(self, _index):
        self.index = _index
        _rec = db.vertical_table[_index]
        self.title = _rec.title
        
class Plint:
    def __init__(self, _index):
        self.index = _index
        _rec = db.plint_table[_index]   # type <class 'gluon.dal.objects.Row'>
        self.record = _rec
        #self.cross = Cross(_rec.root)
        self.cross = db.cross_table[_rec.root]
        #self.vertical = Vertical(_rec.parent)
        self.vertical = db.vertical_table[_rec.parent]
        self.title =_rec.title
        self.titles = self.cross.title, self.vertical.title,  self.title
        self.header = ', '.join(['%s %s'%(i,j) for i,j in zip((_CROSS_,_VERTICAL_,_PLINT_),self.titles)])
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s %s' % (_LAST_MODIFIED_ON_, _rec.modified_on, _rec.modified_by.first_name, _rec.modified_by.last_name)
        self.outside_info = get_plint_outside_info(_rec)
        self.common_data = _rec.common_data
        self.numeration_start_1 = _rec.numeration_start_1
        self.come_from = _rec.come_from
        self.fields = 'title','numeration_start_1','common_data','come_from','modified_on','modified_by'

    def update(self, vars):
        '''
        vars = (form.vars.title,                  # 0 title str
            bool(form.vars.numeration_start_1),   # 1 numeration_start_1 bool
            form.vars.common_data,                # 2 common_data str
            form.vars.from_plint,                 # 3 come_from str
            request.now.date(),                   # 4 modified_on <type 'datetime.date'>
            auth.user,                            # 5 modified_by type <class 'gluon.dal.objects.Row'>
            bool(form.vars.replace_common_data))  # 6 common_data auto fill bool
        
        plint.fields = 'title',                   # 0
                       'numeration_start_1',      # 1
                       'common_data',             # 2
                       'come_from',               # 3
                       'modified_on',             # 4
                       'modified_by'              # 5
        '''
        outplint = db.plint_table(vars[3])
        dictself = dict(zip(self.fields, vars[0:6]))
        dictout  = dict(zip(self.fields[4:6], vars[4:6]))
        cd_en = vars[6]
        if outplint:
            if outplint.id == self.index: # outplint.id <type 'long'>,  self.index <type 'int'>                
                outplint = 0    # if connect to self - disconnect
                dictself[self.fields[3]] = None     # come_from = None
            else: # outplint is another plint, connect to him
                dictout[self.fields[3]] = self.index
                if cd_en:
                    dictout[self.fields[2]] = '%s %s %s' % (self.cross.title, self.vertical.title, vars[0])
                db.plint_table[outplint.id] = dictout   # update new remote plint             
        # update this plint
        if cd_en:
            dictself[self.fields[2]] = get_plint_info(outplint)
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
                        dictout[self.fields[3]] = None  # remove connection
                        if cd_en:
                            dictout[self.fields[2]] = ''
                        # update old remote plint
                        db.plint_table[self.come_from] = dictout
#==================================================================                        
                        
class Pair:
    def __init__(self, _plint, _pair):
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
        self.toplintold = _rec(f[1])   # crossed_to_plint, reference plint_table
        self.topairold = _rec(f[2])    # crossed_to_pair, string
        self.crossed_info = get_pair_crossed_info(self.toplintold, self.topairold)        
        self.loop = _rec(f[5])                
                        
    def update(self, vars):
        '''
        vars = (form.vars.title,          # 0   str
                form.vars.cross_plint,    # 1   str; if not crossed, then = ''
                form.vars.cross_pair,     # 2   str
                request.now.date(),       # 3
                auth.user,                # 4
                bool(form.vars.loop))     # 5
                bool(form.vars.replace_title)    # 6
        pair.fields = 'pair','crossed_to_plint','crossed_to_pair','modified_on','modified_by','loopback'
        '''
        cd_en = vars[6]
        try:
            outplint = int(vars[1])  # cross to new plint
            outpair = int(vars[2])  # cross to new pair
            if outplint==self.index and outpair==self.pair: raise Exception
            if oldpair<1 or outpair>10: raise Exception
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
            oldpair = int(self.topairold)
            oldplint = 0<oldpair<11 and db.plint_table(self.toplintold)
            if oldplint:
                if not((oldplint.id==self.index) and (oldpair==self.pair)):
                    if not((oldplint.id==outplint) and (oldpair==outpair)):
                        fd = get_pair_fields(oldpair)
                        f1 = int(oldpair(fd[1]))
                        f2 = int(oldpair(fd[2]))
                        if (f1==self.index) and (f2==self.pair):
                            db.plint_table[oldplint] = dict(zip(fd[0:5], ('-----', None, '', vars[3], vars[4])))
        except:
            pass        
        
        '''
        cd_en = vars[6]
        try:
            outplint = int(vars[1])  # cross to new plint
            outpair = int(vars[2])  # cross to new pair
        except:
            outplint = None
            outpair = ''
        if outplint and outpair:
            if (outplint==self.index) and (outpair==self.pair):
                outplint = None
                outpair = ''
            else:
                # get fieldset tuple of destination plint
                fd = get_pair_fields(outpair)  # new pair fields
                # update to new plint crossing data
                dictout = dict(zip(fd[1:5], (self.index, self.pair, vars[3], vars[4])))
                if cd_en:
                    dictout[fd[0]] = vars[0]
                db.plint_table[outplint] = dictout                
        db.plint_table[self.index] = dict(zip(self.fp, (vars[0], outplint, outpair, vars[3], vars[4], vars[5])))   # update this plint
        
        # remove old connection
        oldplint = self.toplintold  # None or <class 'gluon.dal.helpers.classes.Reference'>
        oldpair = self.topairold    # string
        #print toplintold
        #print type(toplintold)        
        if oldplint and oldpair:
            oldplint = int(oldplint)
            oldpair = int(oldpair)
            if not((oldplint==self.index) and (oldpair==self.pair)):
                if not((oldplint==outplint) and (oldpair==outpair)):
                    fd = get_pair_fields(oldpair)
                    p = db.plint_table(oldplint)
                    try:
                        f1 = int(p(fd[1]))
                        f2 = int(p(fd[2]))
                        if (f1==self.index) and (f2==self.pair):
                            db.plint_table[oldplint] = dict(zip(fd[0:5], ('-----', None, '', vars[3], vars[4])))
                    except:
                        pass
        '''
