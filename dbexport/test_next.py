# -*- coding: utf-8 -*-
class Cross:
    def __init__(self, idx):
        self.title = 'LAZ'+str(idx)

class Vertical:
    def __init__(self, idx):
        self.title = '1B'+str(idx)

class Plint:
    def __init__(self, idx):
        self.index = idx
        #plint.root = 1
        self.root = 'asd'
        self.cross = Cross(self.root)
        parent = 10
        self.title ='M1'
        self.pair=5

    vertical = Vertical(10)

    def get_title(self, short=True):
        s = 'Plint is ' if short else ''
        result = '%s%s %s %s' % (s, self.cross.title, self.vertical.title, self.title)
        return result

p = Plint(100)
print p.index
print p.get_title(False)
print p.pair

class Pair:
    def __init__(self, idx, parent):
        pair = idx
        self.plint = Plint(parent)
        self.title = str(pair)

pair = Pair(3, 10)
print pair.plint.vertical.title


