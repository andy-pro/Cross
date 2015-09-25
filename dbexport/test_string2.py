# -*- coding: utf-8 -*-

import time

def print_timing (func):
  def wrapper (*arg):
    t1 = time.time ()
    res = func (*arg)
    t2 = time.time ()
    print ("{} took {} ms".format (func.__name__, (t2 - t1) * 1000.0))
    return res
  return wrapper

@print_timing
def method1():
  from array import array
  char_array = array('c')
  for num in xrange(loop_count):
    char_array.fromstring(`num`)
  return char_array.tostring()

@print_timing
def method2():
  str_list = []
  for num in xrange(loop_count):
    str_list.append(`num`)
  return ''.join(str_list)

@print_timing
def method3():
  from cStringIO import StringIO
  file_str = StringIO()
  for num in xrange(loop_count):
    file_str.write(`num`)
  return file_str.getvalue()

@print_timing
def method4():
  return ''.join([`num` for num in xrange(loop_count)])

loop_count = 1000000
method1()
method2()
method3()
method4()

