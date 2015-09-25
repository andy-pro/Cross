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

def get_plint_outside_info3(plint):
    t0 = t4 = ''
    t1 = t2 = t3 = None
    fromplint_id = 500
    s1 = 'Come from: '
    if fromplint_id:
        t1 = 100
        t2 = 200
        t3 = 300
        t4 = ('%s: %s %s %s') % (plint, t1, t2, t3)
        s1 = s1 + t4
    t0 = s1
    return t0,t1,t2,t3,t4

def get_plint_outside_info4(plint):
    #---------- 410 ms

    #info = {}.fromkeys(['cross', 'vertical', 'plint'], None)
    #info['title'] = ''
    #info['address'] = ''

    #----------
    info = {'title':'', 'cross':None, 'vertical':None, 'plint':None, 'address':''} # 290 ms
    #info = dict(zip(('title','cross','vertical','plint','address'),('',None,None,None,''))) # 580 ms
    #info = dict(title='', cross=None, vertical=None, plint=None, address='') # 360 ms
    fromplint_id = 500
    s1 = 'Come from: '
    if fromplint_id:
        info['cross'] = 100
        info['vertical'] = 200
        info['plint'] = 300
        info['address'] = ('%s: %s %s %s') % (plint, info['cross'], info['vertical'], info['plint'])
        s1 = s1 + info['address']
    info['title'] = s1
    return info

loop_count = 100000

@print_timing
def list_test():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info1('m1')
    return info1

@print_timing
def class_test():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info2('m1')
    return info1

@print_timing
def tuple_test():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info3('m1')
    return info1

@print_timing
def dict_test():
    for x in xrange(loop_count):
        info1 = get_plint_outside_info4('m1')
    return info1

print list_test()
print class_test()
print tuple_test()
print dict_test()
