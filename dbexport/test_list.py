# -*- coding: utf-8 -*-

import time
import copy

def print_timing (func):
  def wrapper (*arg):
    t1 = time.time ()
    res = func (*arg)
    t2 = time.time ()
    print ("{} took {} ms".format (func.__name__, (t2 - t1) * 1000.0))
    return res

  return wrapper

@print_timing
def prealloc_array (size, init = None, cp = True, cpmethod=copy.deepcopy, cpargs=(), use_num = False):
  result = [None] * size
  if init is not None:
    if cp:
      for i in range (size):
          result[i] = init
    else:
      if use_num:
        for i in range (size):
            result[i] = cpmethod (i)
      else:
        for i in range (size):
            result[i] = cpmethod (cpargs)
  return result

@print_timing
def prealloc_array_by_appending (size):
  result = []
  for i in range (size):
    result.append (None)
  return result

@print_timing
def prealloc_array_by_extending (size):
  result = []
  none_list = [None]
  for i in range (size):
    result.extend (none_list)
  return result

def main ():
  n = 1000000
  x = prealloc_array_by_appending(n)
  y = prealloc_array_by_extending(n)
  a = prealloc_array(n, None)
  b = prealloc_array(n, "content", True)
  c = prealloc_array(n, "content", False, "some object {}".format, ("blah"), False)
  d = prealloc_array(n, "content", False, "some object {}".format, None, True)
  e = prealloc_array(n, "content", False, copy.deepcopy, "a", False)
  f = prealloc_array(n, "content", False, copy.deepcopy, (), False)
  g = prealloc_array(n, "content", False, copy.deepcopy, [], False)

  print ("x[5] = {}".format (x[5]))
  print ("y[5] = {}".format (y[5]))
  print ("a[5] = {}".format (a[5]))
  print ("b[5] = {}".format (b[5]))
  print ("c[5] = {}".format (c[5]))
  print ("d[5] = {}".format (d[5]))
  print ("e[5] = {}".format (e[5]))
  print ("f[5] = {}".format (f[5]))
  print ("g[5] = {}".format (g[5]))

if __name__ == '__main__':
  main()
