﻿# -*- coding: utf-8 -*-
import os
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
def readstring(f):
    return f.readline().strip('\n').replace(',', '.')

def main():
    f = open( 'BD.txt' )
    x = f.readline()

    crosses = []
    verticals = []
    plintnames = []
    plints = []

    for i in xrange(1, int(x) + 1):
        s1 = readstring(f)   # cross title
        s2 = readstring(f)   # vertical count in cross
        lst = [s1, s2]
        crosses.append(lst)

    cross_csv = open( 'cross_table.csv', 'w' )
    vertical_csv = open( 'vertical_table.csv', 'w' )
    plint_csv = open( 'plint_table.csv', 'w' )

    cross_csv.write('cross_table.id,cross_table.title\n')
    vertical_csv.write('vertical_table.id,vertical_table.cross_table,vertical_table.title\n')
    plint_csv.write('plint_table.id,plint_table.cross_table,plint_table.vertical_table,plint_table.numeration_start_1,plint_table.title,plint_table.common_data,plint_table.modified_date,plint_table.modified_by,plint_table.pair_id_0,plint_table.loopback_id_0,plint_table.modified_date_id_0,plint_table.modified_by_id_0,plint_table.pair_id_1,plint_table.loopback_id_1,plint_table.modified_date_id_1,plint_table.modified_by_id_1,plint_table.pair_id_2,plint_table.loopback_id_2,plint_table.modified_date_id_2,plint_table.modified_by_id_2,plint_table.pair_id_3,plint_table.loopback_id_3,plint_table.modified_date_id_3,plint_table.modified_by_id_3,plint_table.pair_id_4,plint_table.loopback_id_4,plint_table.modified_date_id_4,plint_table.modified_by_id_4,plint_table.pair_id_5,plint_table.loopback_id_5,plint_table.modified_date_id_5,plint_table.modified_by_id_5,plint_table.pair_id_6,plint_table.loopback_id_6,plint_table.modified_date_id_6,plint_table.modified_by_id_6,plint_table.pair_id_7,plint_table.loopback_id_7,plint_table.modified_date_id_7,plint_table.modified_by_id_7,plint_table.pair_id_8,plint_table.loopback_id_8,plint_table.modified_date_id_8,plint_table.modified_by_id_8,plint_table.pair_id_9,plint_table.loopback_id_9,plint_table.modified_date_id_9,plint_table.modified_by_id_9\n')

    for cross_index, crossitem in enumerate(crosses, start = 1):
        cross_csv.write(',%s\n' % crossitem[0])  # crossitem[0] is a cross_title
        for i in xrange(1, int(crossitem[1]) + 1):    # crossitem[1] is a vertical_count
            s1 = readstring(f)   # vertical title
            s2 = readstring(f)   # plint count in vertical
            s3 = readstring(f)   # numeration_start_1 vertical
            vertical_csv.write(',%d,%s\n' % (cross_index, s1))
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
            spx = (',%s,%s,2015-03-03,1' % (s1,lb))
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
        #                                                cross_index, vertical_index, start_with_1,      plint_name
        plint_csv.write(',%d,%d,%s,%s,%s,2014-11-12,1' % (plintitem[2], plintitem[3], str(start_with_1), plintitem[0], s1) + sp + '\n')

    cross_csv.close()
    vertical_csv.close()
    plint_csv.close()

    f.close()

    print 'Ok'

if __name__ == '__main__':
    main()

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