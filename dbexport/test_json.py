# -*- coding: utf-8 -*-
#-------------------------------------------------------------------------------
import json

#data={1:1}
#data=list('abcdefgh')
data=(1,2,3,4,5,6,('q',[0,9,8,7,6,5,4,3,('qwert','asdfg','zxcvb')]))
print data, type(data)

data_json = json.dumps(data)

print data_json, type(data_json)

data = json.loads(data_json)
print data, type(data)
