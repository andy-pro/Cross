# -*- coding: utf-8 -*-

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

