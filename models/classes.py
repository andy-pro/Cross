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
        _rec = db.plint_table[_index]
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
        vars = (form.vars.title,                  # 0 title
            bool(form.vars.numeration_start_1),   # 1 numeration_start_1
            form.vars.common_data,                # 2 common_data
            form.vars.from_plint,                 # 3 come_from
            request.now.date(),                   # 4 modified_on
            auth.user,                            # 5 modified_by
            bool(form.vars.replace_common_data))  # 6 common_data auto fill
        
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
            if outplint.id == self.index:   # if connec to selt - disconnect
                outplint = 0
                dictself[self.fields[3]] = None
        # update this plint
        if cd_en:
            dictself[self.fields[2]] = get_plint_info(outplint)
        db.plint_table[self.index] = dictself
        
        # update new remote plint
        if outplint:    # outplint is a record?
            if outplint.id != self.index:
                dictout[self.fields[3]] = self.index
                if cd_en:
                    dictout[self.fields[2]] = '%s %s %s' % (self.cross.title, self.vertical.title, vars[0])
                db.plint_table[outplint.id] = dictout

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
        dx = 1 if _rec.numeration_start_1 else 0        
        self.header = self.plint.header + ', %s %s' % (_PAIR_, _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.toplintold = _rec(f[1])
        self.topairold = _rec(f[2])
        self.crossed_info = get_pair_crossed_info(self.toplintold, self.topairold)        
        self.loop = _rec(f[5])                
                        
    def update(self, vars):
        '''
        vars = (form.vars.title,          # 0
                form.vars.cross_plint,    # 1
                form.vars.cross_pair,     # 2
                request.now.date(),       # 3
                auth.user,                # 4
                bool(form.vars.loop))     # 5
        pair.fields = 'pair','crossed_to_plint','crossed_to_pair','modified_on','modified_by','loopback'
        '''

        try:
            toplint = int(vars[1])  # cross to new plint
            topair = int(vars[2])  # cross to new pair
        except:
            toplint = None
            topair = ''
        if (toplint > 0):
            # get fieldset tuple of destination plint
            fd = get_pair_fields(topair - 1)  # new pair fields, value from <select> 1-10, pair_id 0-9 ==> topair-1
            # update to new plint crossing data
            db.plint_table[toplint] = dict(zip(fd[0:5], (vars[0], self.index, self.pair+1, vars[3], vars[4])))  # pair_id+1 - convert to <select> value
        db.plint_table[self.index] = dict(zip(self.fp, (vars[0], toplint, topair, vars[3], vars[4], vars[5])))
        # remove old connection
        toplintold = self.toplintold
        topairold = self.topairold
        if toplintold > 0:
            toplintold = int(toplintold)
            topairold = int(topairold)
            if not((toplintold==toplint) and (topairold==topair)):
                fo = get_pair_fields(topairold - 1)
                db.plint_table[toplintold] = dict(zip(fo[0:5], ('- - -', None, '', vars[3], vars[4])))
                
