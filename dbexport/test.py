# -*- coding: utf-8 -*-

import time

class Info:
    def __init__(self):
        self.title = ''
        self.cross = None
        self.vertical = None
        self.plint = None
        self.address = ''

def print_timing (func):
  def wrapper (*arg):
    t1 = time.time ()
    res = func (*arg)
    t2 = time.time ()
    print ("{} took {} ms".format (func.__name__, (t2 - t1) * 1000.0))
    return res
  return wrapper

def get_plint_outside_info1(plint):
    lst = ['',None,None,None,'']
    fromplint_id = 500
    s1 = 'Come from: '
    if fromplint_id:
        lst[1] = 100
        lst[2] = 200
        lst[3] = 300
        lst[4] = ('%s: %s %s %s') % (plint, lst[1], lst[2], lst[3])
        s1 = s1 + lst[4]
    lst[0] = s1
    return lst

def get_plint_outside_info2(plint):
    info = Info()
    fromplint_id = 500
    s1 = 'Come from: '
    if fromplint_id:
        info.cross = 100
        info.vertical = 200
        info.plint = 300
        info.address = ('%s: %s %s %s') % (plint, info.cross, info.vertical, info.plint)
        s1 = s1 + info.address
    info.title = s1
    return info

loop_count = 100000

@print_timing
def method1():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info1('m1')

@print_timing
def method2():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info2('m1')

method1()
method2()

#print info1
#print info2.title