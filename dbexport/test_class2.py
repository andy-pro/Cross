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
        return  None
        self.index = _index
        self.root = None
        if not self.root: return None
        self.root = 'asd'
        self.cross = Cross(self.root)
        self.parent = 10
        self.title ='M1'+str(self.parent)
        self.pair=5
        titles = 789,897,868,789,5465
        s = 'Plint is '
        self.header = '%s%s %s %s' % (s, self.cross.title, self.vertical.title, self.title)
        self.info = {}
        self.info['index'] = get_plint_outside_info(_index)
        self = None
        return None

    vertical = Vertical(10)

    def get_title(self, short=True):
        s = 'Plint is ' if short else ''
        k=self.parent
        result = '%s%s %s %s' % (s, self.cross.title, self.vertical.title, self.title)
        return result

p = Plint(100)
#print p.index
#print p.get_title(False)
#print p.pair
#print p.info.get('index2')
#print p.info['index']
class Pair:
    def __init__(self, idx, parent):
        pair = idx
        self.plint = Plint(parent)
        self.title = str(pair)
        #self.titles = 789,897,868,789,5465

class Formvars:
    pass

formvars = Formvars()
formvars.title = 'test'
print formvars.title

print('=======================')
import re
s='M%4M'
s='%987'
s='3-K%5Plint%4Mp'
x=list(re.finditer('%\d+', s))
if x:
    p1 = x[-1].span()[0]
    p2 = x[-1].span()[1]
    s1 = s[0:p1]
    s2 = int(s[p1+1:p2])
    s3 = s[p2:]
else:
    x=list(re.finditer('%', s))
    if x:
        p1 = x[-1].span()[0]
        s1 = s[0:p1]
        s2 = 1
        s3 = s[p1+1:]
    else:
        s1 = s
        s2 = 1
        s3 = ''
print(s1)
print(s2)
print(s3)

a=lambda x: str(x)+'asd'
print a('sdfr')

s = "this   is\na\ttest"
collapse = True
collapse = False

print collapse and 'pravda' or ''

m='0'
t = m and 'var'+m or 'noname'
print t

h=Pair(10,20)
print type(h)

