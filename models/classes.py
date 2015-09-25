# -*- coding: utf-8 -*-

_CROSS_ = T('Cross')
_VERTICAL_ = T('Vertical')
_PLINT_ = T('PLint')
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

def Nget_plint_outside_info(plint):
    lst = ['',None,None,None,'']
    fromplint_id = plint.come_from
    s1 = _COME_FROM_
    if fromplint_id:
        lst[1] = fromplint_id.root
        lst[2] = fromplint_id.parent
        lst[3] = fromplint_id
        lst[4] = ('%s %s %s') % (lst[1].title, lst[2].title, lst[3].title)
        s1 = s1 + lst[4]
    lst[0] = s1
    return lst

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
        self.menu = _rec.menu

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
        self.cross = Cross(_rec.root)
        self.vertical = Vertical(_rec.parent)
        self.title =_rec.title
        _titles = self.cross.title, self.vertical.title,  self.title
        self.header = ', '.join(['%s %s'%(i,j) for i,j in zip((_CROSS_,_VERTICAL_,_PLINT_),_titles)])
        self.address = '%s %s %s' % _titles
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
        # update this plint
        if cd_en:
            dictself[self.fields[2]] = get_plint_info(outplint)
        db.plint_table[self.index] = dictself
        
        # update new remote plint
        if outplint and (self.record.id != outplint.id):
            dictout[self.fields[3]] = self.index
            if cd_en:
                dictout[self.fields[2]] = '%s %s %s' % (self.cross.title, self.vertical.title, vars[0])
            db.plint_table[outplint.id] = dictout

        # disconnect from old plint
        oldplint = db.plint_table(self.come_from)
        if oldplint == outplint: # if connection exist and 
            return
                
        #if self.come_from != outplint.id:  # now connecting to new plint?            
        # and (oldoutplint.id != outplint.id):
        #if oldoutplint.come_from == plint.index: # if it was connected to this plint
        dictout[self.fields[3]] = None  # remove connection
        if cd_en:
            dictout[self.fields[2]] = ''
        # update old remote plint
        db.plint_table[self.come_from] = dictout
        
        
        
'''
        # fields = 'title','numeration_start_1','common_data','come_from', 'modified_on','modified_by'
        dict0 = dict(zip((plint.fields[0:4]),(form.vars.title, bool(form.vars.numeration_start_1), form.vars.common_data, outplint)))
        dict1 = dict(zip((plint.fields[3:6]), (plint.index, request.now.date(), auth.user)))
        if cd_en:
            dict0['common_data'] = get_plint_info(outplint) # update value for this plint
            dict1['common_data'] = plint.address # add key
        # update this plint
        dict0.update(dict1) # dict0 = dict0 + dict1
        db.plint_table[plint.index] = dict0
        # update new remote plint
        if outplint:
            db.plint_table[outplint.id] = dict1
        # remove old outside connection
'''
               