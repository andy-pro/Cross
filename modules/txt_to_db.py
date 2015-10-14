# -*- coding: utf-8 -*-

def import_from_txt1(f):
    """
    convert txt file to cStringIO file in csv format
    """
    import cStringIO
    import csv

    readstring = lambda f: f.readline().strip()
    cyr_to_lat = lambda s: s # s.replace('БМ', 'BM').replace('БКТ', 'BKT').replace('М', 'M').replace('К', 'K').replace('Р', 'P')
    table_header = lambda table, fset: writer.writerows([['TABLE ' + table], ['%s.%s' % (table, f) for f in fset]])
    table_footer = lambda: writer.writerows([[], []])
    #datenow = str(request.now.date())
    #dateold = datetime.date(2014, 11, 12)
    dateold = '2014-11-12'
    dateplint = dateold
    datepair = dateold
    csvfile = cStringIO.StringIO()
    writer = csv.writer(csvfile)    # by default, delimeter=',' and quotechar='"'

    table_header(tables[0], ('id', 'title'))
    crosses = []
    for i in xrange(int(f.readline())):
        writer.writerow([i+1, readstring(f)])   # cross_index, cross_title
        crosses.append([i+1, int(readstring(f))])  # cross_index, vertical count in cross
    table_footer()

    table_header(tables[1], ('id', 'parent', 'title'))
    verticals = []
    x = 1
    for cross in crosses:
        for i in xrange(cross[1]):    # cross[1] is a vertical_count
            writer.writerow([x, cross[0], readstring(f)])  # vertical_index, cross_index, vertical_title
            verticals.append([cross[0], x, int(readstring(f)), readstring(f)])   # cross_index, vertical_index, plint count in vertical, start 1
            x += 1
    table_footer()

    table_header(tables[2], ('id','root','parent')+plintfields+tuple(sum(pairfields,[])))
    plints = []
    for vertical in verticals:
        for i in xrange(vertical[2]):   # vertical[1] is a plint_count
            plints.append([vertical[0], vertical[1], cyr_to_lat(readstring(f)), vertical[3]])  # cross_index, vertical_index, plint_title, start 1
    x = 1
    for plint in plints:
        sp = []
        for i in xrange(10):
            spx = [readstring(f), datepair, 1]  # pid(pair_title), pmodon, pmodby
            s1 = f.readline()   # pair loop, not used
            if i == 0: sp0 = spx
            else: sp = sp + spx
        s1 = readstring(f)   # common data
        start1 = (readstring(f)=='0') ^ (plint[3]=='0')   # start inverse?
        sp = sp + sp0 if start1 else sp0 + sp
        #                id   root    parent    title       start1    comdata modon  modby
        writer.writerow([x, plint[0], plint[1], plint[2], str(start1), s1, dateplint, 1] + sp)
        x += 1
    table_footer()

    writer.writerow(['END'])
    csvfile.seek(0)
    #for line in csvfile: print line,
    return csvfile

def __auth_init():
    import cStringIO
    csvfile = cStringIO.StringIO()
    print >> csvfile, '''TABLE auth_user
auth_user.id,auth_user.first_name,auth_user.last_name,auth_user.email,auth_user.password,auth_user.registration_key,auth_user.reset_password_key,auth_user.registration_id
1,Michael,Savitsky,savitsky@uksatse.aero,"pbkdf2(1000,20,sha512)$a8a4ffb78f687c56$d617bed6a07637acc58b3b18c579f8a6f52a845f",,,
2,Maria,Rurak,rurak@uksatse.aero,"pbkdf2(1000,20,sha512)$84eb544840f8b5e9$cbb150f0de7ca33f0d4148c70f5c225eaa2cc92f",,,
3,Андрей,Проценко,andy@uksatse.aero,"pbkdf2(1000,20,sha512)$b5c2140a2b672fdf$f261b6588628fdf596fe9e16d98aa2e6b8738f4b",,1441952416-841c7e75-c52a-4bb3-9f04-fb4902a59b61,
4,Super,User,admin@gmail.com,"pbkdf2(1000,20,sha512)$88d760b35e1819ab$57457bde2e6f6ec9064ee053c556e1226cd3b23a",,,
5,Гость,Бесправный,a1@gmail.com,"pbkdf2(1000,20,sha512)$92f108658a796895$ce5f26e94c3ff1c281796ead928d472ecde1ab42",,,


TABLE auth_group
auth_group.id,auth_group.role,auth_group.description
1,users,Viewing records only
2,managers,Viewing and editing records
3,administrators,Backup and restore database


TABLE auth_membership
auth_membership.id,auth_membership.user_id,auth_membership.group_id
1,1,1
2,1,2
3,2,1
4,2,2
5,3,1
6,3,2
7,3,3
9,4,1
10,4,2
11,4,3


END
'''
    csvfile.seek(0)
    return csvfile
