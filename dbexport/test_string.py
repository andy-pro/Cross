# -*- coding: utf-8 -*-
import time

loop_count = 1000000

def method1():
  from array import array
  char_array = array('c')
  for num in xrange(loop_count):
    char_array.fromstring(`num`)
  return char_array.tostring()

def method2():
  str_list = []
  for num in xrange(loop_count):
    str_list.append(`num`)
  return ''.join(str_list)

def method3():
  from cStringIO import StringIO
  file_str = StringIO()
  for num in xrange(loop_count):
    file_str.write(`num`)
  return file_str.getvalue()

def method4():
  return ''.join([`num` for num in xrange(loop_count)])

t1 = time.time()
method1()
t2 = time.time()
print "\t%.1f" % ((t2 - t1))
method2()
t3 = time.time()
print "\t%.1f" % ((t3 - t2))
method3()
t4 = time.time()
print "\t%.1f" % ((t4 - t3))
method4()
t5 = time.time()
print "\t%.1f" % ((t5 - t4))