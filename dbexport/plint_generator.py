# -*- coding: utf-8 -*-
'''
for i in range(1, 11):
    print("                Field('pair_id_%d', default='')," % i)
    print("                Field('loopback_id_%d', 'boolean', default=False)," % i)
    print("                Field('crossed_to_plint_id_%d', 'reference plint_table', ondelete='NO ACTION')," % i)
    print("                Field('crossed_to_pair_id_%d', default='')," % i)
    print("                Field('modified_on_id_%d', 'date', default=request.now.date())," % i)
    print("                Field('modified_by_id_%d', db.auth_user, default=auth.user)," % i)
    print

'''
f=('pair')

fields=[]
for i in xrange(1, 11):
    fields.append('a%i'%i)
    fields.append('b%i'%i)
print(fields)