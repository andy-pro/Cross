# -*- coding: utf-8 -*-

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
        s1 = T('Crossed to ') + vert.title + ', ' + plint.title
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
        lst[0] = T('Not crossed.')
        return lst

def get_plint_info(plint):
    return ('%s %s %s') % (plint.root.title, plint.parent.title, plint.title)

_COME_FROM_ = T('Come from: ')

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
        self.cross = Cross(_rec.root)
        self.vertical = Vertical(_rec.parent)
        self.title =_rec.title
        _titles = self.cross.title, self.vertical.title,  self.title
        self.header = T('Cross %s, Vertical %s, Plint %s') % _titles
        self.address = '%s %s %s' % _titles
        self.modified_info = '%s %s, %s %s' % (T('Last modified on'), _rec.modified_on, _rec.modified_by.first_name, _rec.modified_by.last_name)
        self.outside_info = get_plint_outside_info(_rec)
        self.common_data = _rec.common_data
        self.numeration_start_1 = _rec.numeration_start_1
        self.come_from = _rec.come_from

