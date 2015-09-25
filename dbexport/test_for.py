# -*- coding: utf-8 -*-

lst1 = ['a', 'b', 'c', 'd', 'e']

for index, item in enumerate(lst1, start = 1):
    print index, item

print '============='

lst2 = []
lst = ['a', 'A']
lst2.append(lst)
lst = ['b', 'B']
lst2.append(lst)
lst = ['c', 'C']
lst2.append(lst)
lst = ['d', 'D']
lst2.append(lst)
lst = ['e', 'E']
lst2.append(lst)

for index, item in enumerate(lst2, start = 1):
    print index, item[0]

for index, item in enumerate(lst2, start = 1):
    item1 = item[0]
    item2 = item[1]
    print index, item1, item2

for i in xrange(1, 11):
    print i

f='VOLMET 133,325\n'
print f
s=f.strip('\n').replace(',', '.')
print s
