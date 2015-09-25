# -*- coding: utf-8 -*-
import os, time
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
def readstring(f):
    return f.readline().strip('\n').replace(',', '.')

def main():
    datenow = '2015-03-03'
    dateold = '2014-11-12'
    f = open( 'BD.txt' )
    x = f.readline()

    crosses = []
    verticals = []
    plintnames = []

    cross_table = []
    vertical_table = []
    plint_table = []

    for i in xrange(1, int(x) + 1):
        s1 = readstring(f)   # cross title
        s2 = readstring(f)   # vertical count in cross
        lst = [s1, s2]
        crosses.append(lst)

    cross_csv = open( 'cross_table.csv', 'w' )
    vertical_csv = open( 'vertical_table.csv', 'w' )
    plint_csv = open( 'plint_table.csv', 'w' )

    cross_csv.write('cross_table.id,cross_table.title\n')
    vertical_csv.write('vertical_table.id,vertical_table.parent,vertical_table.title\n')
    fields = ('pair_id_','loopback_id_','crossed_to_vertical_id_','crossed_to_plint_id_','crossed_to_pair_id_','modified_on_id_','modified_by_id_')
    s1 = ''
    for i in xrange(0, 10):
        for j in xrange(0, len(fields)):
            s1 += ',plint_table.%s%d' % (fields[j], i)
    s2 = 'plint_table.id,plint_table.root,plint_table.parent,plint_table.title,plint_table.numeration_start_1,\
plint_table.come_from,plint_table.common_data,plint_table.modified_on,plint_table.modified_by' + s1 +'\n'
    plint_csv.write(s2)
    for cross_index, crossitem in enumerate(crosses, start = 1):
        a = ',%s\n' % crossitem[0]    # crossitem[0] is a cross_title
        cross_table.append(a)
        cross_csv.write(a)
        for i in xrange(1, int(crossitem[1]) + 1):    # crossitem[1] is a vertical_count
            s1 = readstring(f)   # vertical title
            s2 = readstring(f)   # plint count in vertical
            s3 = readstring(f)   # numeration_start_1 vertical
            a = ',%d,%s\n' % (cross_index, s1)
            vertical_table.append(a)
            vertical_csv.write(a)
            lst = [s1, s2, s3, cross_index]
            verticals.append(lst)

    vertical_index = 1
    for vertical_index, verticalitem in enumerate(verticals, start = 1):
        for i in xrange(1, int(verticalitem[1]) + 1):
            s1 = readstring(f)
            # plint title, start with?, cross_index,     vertical_index
            lst = [s1, verticalitem[2], verticalitem[3], vertical_index]
            plintnames.append(lst)
        vertical_index += 1

    for plintitem in plintnames:
        sp = ''
        for i in xrange(0, 10):
            s1 = readstring(f)   # pair name
            s2 = readstring(f)   # pair loopback
            lb = str(bool(int(s2)))
            spx = (',%s,%s,,,,%s,1' % (s1,lb,datenow))
            if i == 0:
                sp0 = spx
            else:
                sp = sp + spx
        s1 = readstring(f)   # common data
        s2 = readstring(f)   # start with?
        start_with_1 = True
        if plintitem[1] == '0':
            start_with_1 = False
        if s2 == '1':
            start_with_1 = not start_with_1
        if start_with_1:
            sp = sp + sp0
        else:
            sp = sp0 + sp
        #                              root,         parent,      title,         start_with_1, common_data
        a = ',%d,%d,%s,%s,,%s,%s,1' % (plintitem[2], plintitem[3], plintitem[0], str(start_with_1), s1, dateold) + sp + '\n'
        plint_table.append(a)
        plint_csv.write(a)

    cross_csv.close()
    vertical_csv.close()
    plint_csv.close()

    f.close()
    print 'cross_table count %d' % len(cross_table)
    print 'vertical_table count %d' % len(vertical_table)
    print 'plint_table count %d' % len(plint_table)
    print 'Ok'

if __name__ == '__main__':
    t1 = time.time()
    main()
    t2 = time.time()
    print "\ttime is \t%.1f" % ((t2 - t1))

# plint_table.id
# plint_table.cross_table
# plint_table.vertical_table
# plint_table.numeration_start_1
# plint_table.title
# plint_table.common_data
# plint_table.modified_date
# plint_table.modified_by
# plint_table.pair_id_0,plint_table.loopback_id_0,plint_table.modified_date_id_0,plint_table.modified_by_id_0
# plint_table.pair_id_1,plint_table.loopback_id_1,plint_table.modified_date_id_1,plint_table.modified_by_id_1
# plint_table.pair_id_2,plint_table.loopback_id_2,plint_table.modified_date_id_2,plint_table.modified_by_id_2
# plint_table.pair_id_3,plint_table.loopback_id_3,plint_table.modified_date_id_3,plint_table.modified_by_id_3
# plint_table.pair_id_4,plint_table.loopback_id_4,plint_table.modified_date_id_4,plint_table.modified_by_id_4
# plint_table.pair_id_5,plint_table.loopback_id_5,plint_table.modified_date_id_5,plint_table.modified_by_id_5
# plint_table.pair_id_6,plint_table.loopback_id_6,plint_table.modified_date_id_6,plint_table.modified_by_id_6
# plint_table.pair_id_7,plint_table.loopback_id_7,plint_table.modified_date_id_7,plint_table.modified_by_id_7
# plint_table.pair_id_8,plint_table.loopback_id_8,plint_table.modified_date_id_8,plint_table.modified_by_id_8
# plint_table.pair_id_9,plint_table.loopback_id_9,plint_table.modified_date_id_9,plint_table.modified_by_id_9
#1,1,1,True,M1,27 каб укртелеком,2014-11-12,1,№2600,False,2015-03-03,1,№2601,False,2015-03-03,1,№2602,False,2015-03-03,1,№2603,False,2015-03-03,1,№2604,False,2015-03-03,1,№2605,False,2015-03-03,1,№2606,False,2015-03-03,1,№2607,False,2015-03-03,1,№2608,False,2015-03-03,1,№2609,False,2015-03-03,1