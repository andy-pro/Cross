# -*- coding: utf-8 -*-

def f1(f):
    def decor(*args):
        return 'begin' + f(*args) + 'end'
    return decor

#@f1
def f2(*args):
    lst=''
    for arg in args:
        lst+=arg.upper()
    return lst


#print f2('test', 'best', 'fest')
d= f1(f2)
print d('boo')

noprimes = [[i,j] for i in range(1, 5) for j in range(i+100)]
print noprimes
