# -*- coding: utf-8 -*-
class Cross:
    def __init__(self, idx):
        self.title = 'LAZ'+str(idx)

class Vertical:
    def __init__(self, idx):
        self.title = '1B'+str(idx)

def get_plint_outside_info(rec):
    x = rec*2
    return x

class Plint:
    def __init__(self, _index):
        self.index = _index
        #plint.root = 1
        self.root = 'asd'
        self.cross = Cross(self.root)
        _parent = 10
        self.title ='M1'+str(_parent)
        self.pair=5
        s = 'Plint is '
        self.header = '%s%s %s %s' % (s, self.cross.title, self.vertical.title, self.title)
        self.info = {}
        self.info['index'] = get_plint_outside_info(_index)
    vertical = Vertical(10)

    def get_title(self, short=True):
        s = 'Plint is ' if short else ''
        result = '%s%s %s %s' % (s, self.cross.title, self.vertical.title, self.title)
        return result

p = Plint(100)
print p.index
print p.get_title(False)
print p.pair
print p.info.get('index2')
print p.info['index']
class Pair:
    def __init__(self, idx, parent):
        pair = idx
        self.plint = Plint(parent)
        self.title = str(pair)

pair = Pair(3, 10)
print pair.plint.vertical.title
print p.title
print p._parent
