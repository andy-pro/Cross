# -*- coding: utf-8 -*-
import json
data = {"spam": "foo", "parrot": 42}
#print data


lst=[]
inlst=['L1', 'L2']
for i in xrange(10):
    t=('title%s' % i, True, 'url', inlst)
    lst.append(t)
# tuple
a1=('tuple1', False, 'url', lst)
menu = []
menu.append(a1)
menu.append(a1)

'''
print a1
print type(lst)
print type(inlst)
print type(a1)
print type(t)

print a1[3]
'''
print menu
print type(menu)
in_json = json.dumps(menu)
#print in_json

a2 = json.loads(in_json)
print a2
print type(a2)

u = True
u = False
a1=100 if u else 200
print a1
