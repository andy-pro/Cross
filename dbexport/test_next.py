# -*- coding: utf-8 -*-
from __future__ import division
x=[]
for i in xrange(1, 15):   # from '!' to 'h'
    x.append(i)
    #print i

reccnt=len(x)
print reccnt
rowcnt = 20
colcnt = int(reccnt / rowcnt)
#print reccnt/rowcnt
#print colcnt
if reccnt < rowcnt:
    rowcnt = reccnt
print '=========================='
for j in range(0, rowcnt):
    print '%d  ' % j,
    for k in range(0, colcnt+1):
        idx=k*rowcnt+j
        if idx < reccnt:
            print x[idx],
    #print '\n'
    print ''
