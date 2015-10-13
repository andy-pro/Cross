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
