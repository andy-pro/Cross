# -*- coding: utf-8 -*-

#import os
from gluon.storage import Storage

#==================================================================
L = Storage() # Lexicon storage object
L._ADD_LINK_ = T('Add link to chain')
L._ADMIN_DB_ = T('Direct edit DB')
L._BACK_ = T('Back')
L._BACKUP_ = T('Backup DB')
L._CANCEL_ = T('Cancel')
L._CHAIN_ = T('Edit chain')
L._CLEAR_DB_ = T('Clear DB')
L._COMMON_DATA_ = T('Common data')
L._COUNT_ = T('Count')
L._CROSS_ = T('Cross')
L._DB_UPD_ = T('Database update success!')
L._DEL_ = T('Delete')
L._EDIT_CROSS_ = T('Edit cross')
L._EDIT_PAIR_ = T('Edit pair')
L._EDIT_PLINT_ = T('Edit plint')
L._EDIT_VERT_ = T('Edit vertical')
L._EDITOR_ = T('Editor')
L._ERROR_ = T('Error')
L._IMPORT_ = T('Import DB')
L._FIND_ = T('Find')
L._FNDRES_ = T('Found results for "%s"')
L._FOLLOW_ = T('Follow')
L._FOR_ALL_ = T('Apply for all')
L._FOUND_ = T('Found: ')
L._HELP_ = T('Help')
L._HOME_ = T('Home')
L._LAST_MOD_ = T('Last modified')
L._MERGE_ = T('Merge through')
L._MERGE_DB_ = T('Merge DB')
L._NEW_CROSS_ = T('New cross')
L._NEWPL_ = T('New plint')
L._NEWS_ = T('News')
L._NOCHANGE_ = T('No changes')
L._NOT_CROSSED_ = T('Not crossed')
L._OLDPL_ = T('Existing plint')
L._PAIR_ = T('Pair')
L._PAIR_T_ = T('Pair titles')
L._PLINT_ = T('Plint')
L._PLINT_T_ = T('Plint title')
L._REPLACE_ = T('Replace')
L._RESTORE_ = T('Restore DB')
L._REM_CD_ = T('Replace remote common data')
L._SEARCH_ = T('Search')
L._START_1_ = T('Numeration start 1')
L._TITLE_ = T('Title')
L._TOOSHORT_ = T('too short query!')
L._TOOLS_ = T('Tools')
L._UKSATSE_ = T('Uksatse')
L._VERTICAL_ = T('Vertical')
L._VERT_T_ = T('Vertical title')
L._VIEW_VERT_ = T('View vertical')
L._WRAP_ = T('Wrap text')
#==================================================================

users = {}  # global dictionary, cashe type, contains printable user name
def get_user_name(uid):
    if uid:
        who = users.get(uid)
        if not who:
            who = uid.first_name + ' ' + uid.last_name
            users[uid] = who
    else:
        who = ''
    return who

get_user_id = lambda: auth.user.id if auth.user else False
get_whenwho = lambda: dict(modon=request.now.date(), modby=get_user_id())
#==================================================================

class Cross:
    def __init__(self, _index):
        self.index = _index
        self.record = db.cross_table[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.title = _rec.title
        self.header = L._CROSS_+' '+self.title

    def update(self, vars):
        db.cross_table[self.index] = {'title': vars.title}
        vt = vars.verticaltitle
        return db.vertical_table.update_or_insert(title=vt, parent=self.index) if vt else None  # return id of new record

    def delete(self):
        del db.cross_table[self.index]
#==================================================================

class Vertical:
    def __init__(self, _index):
        self.index = _index
        self.record = db.vertical_table[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.cross = Cross(_rec.parent.id)
        self.title = _rec.title
        self.header = self.cross.header + ', %s %s' % (L._VERTICAL_, self.title)

    def delete(self):
        del db.vertical_table[self.index]

    def update(self, vars):
        mainchange = False
        if self.title != vars.title:
            db.vertical_table[self.index] = {'title': vars.title}
            mainchange = True
        cnt = int(vars.count)
        if cnt:
            try:
                fp = int(vars.from_plint)
                fv = int(vars.from_vert)
                outplints = db((db.plint_table.parent == fv) & (db.plint_table.id >= fp)).select(limitby = (0, cnt))
                pc = len(outplints)
                pi = 0
            except:
                pc = 0

            idx = 0
            while(vars['title_'+str(idx)] and idx < 100):
                si = str(idx)
                idx += 1
                pt = vars['title_'+si]  # plint title, add new or modify if it exist
                xp = db((db.plint_table.title==pt) & (db.plint_table.parent==self.index)).select().first()
                if not xp:
                    xp = db.plint_table.insert(root=self.cross.index, parent=self.index, title=pt)
                #plint = Plint(xp.id)
                maindata = dict(comdata=vars['comdata_'+si])
                if vars['start1_'+si]:
                    maindata['start1'] = vars['start1_'+si]
                pairdata = {}
                for pj in xrange(1, 11):
                    pairdata[pj] = vars['pid_%s_%i' % (si, pj)] or ''
                if plint_update(xp.id, maindata, pairdata):
                    mainchange = True
                if pc and pi < pc and vars['rcomdata_'+si]:
                    maindata = dict(comdata=vars['rcomdata_'+si])
                    if plint_update(outplints[pi].id, maindata, {}):
                        mainchange = True
                    pi += 1
        return mainchange

#==================================================================

class Plint:
    def __init__(self, _index):
        self.index = _index
        self.record = db.plint_table[_index]   # type <class 'gluon.dal.objects.Row'>
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.vertical = Vertical(_rec.parent)
        self.cross = self.vertical.cross
        self.title =_rec.title
        self.titles = self.cross.title, self.vertical.title,  self.title
        self.header = self.vertical.header + ', %s %s' % (L._PLINT_, self.title)
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s' % (L._LAST_MOD_, _rec.modon, get_user_name(_rec.modby))
        self.comdata = _rec.comdata
        self.start1 = _rec.start1

    get_pair_titles = lambda self: [self.record(pairtitles[i]) for i in xrange(10)]

    def delete(self):
        del db.plint_table[self.index]

    def update(self, vars):
        maindata = dict(title=vars.title, start1=bool(vars.start1), comdata=vars.comdata)
        pnew = vars.pairtitles.splitlines()
        pl = len(pnew)
        pairdata = {}
        for i in xrange(10):
            v = pnew[i] if pl > i else ''
            pairdata[i+1] = v
        return plint_update(self.index, maindata, pairdata, bool(vars.merge), vars.mergechar or '')

#==================================================================

def plint_update(index, maindata, pairdata, merge=False, mergechar=''):
    """
    index - record id
    maindata - dict, possible keys: title, start1, comdata
    pairdata - dict, possible keys: 1, 2, ... 10: value - pair title
    merge - boolean, if True, new pair title merge with existing
    used by editpair, editfound, editplint (through Plint.update), editvertical (through Vertical.update)
    """
    plint = db.plint_table[index]
    whenwho = get_whenwho()
    mainchange = False
    if maindata:
        keys = maindata.keys()
        for key in keys:
            if plint(key) != maindata[key]:
                mainchange = True
                break
    if pairdata:
        keys = pairdata.keys()
        for key in keys:
            sk = str(key)
            pairkey = 'pid' + sk
            if merge: pairdata[key] = (plint(pairkey) + mergechar + pairdata[key]).strip()
            if plint(pairkey) != pairdata[key]:
                mainchange = True
                maindata[pairkey] = pairdata[key]
                maindata['pmodon' + sk] = whenwho['modon']
                maindata['pmodby' + sk] = whenwho['modby']
    if mainchange:
        maindata.update(whenwho)
        db.plint_table[index] = maindata
    return mainchange

#==================================================================

class Pair:
    def __init__(self, _plint, _pair):
        if _pair>10 or _pair<1: raise HTTP(404)
        self.plint = Plint(_plint)
        _rec = self.plint.record
        self.index = _rec.id
        self.pair = _pair
        self.vertical = self.plint.vertical
        f = pairfields[_pair-1]
        self.title = _rec(f[0])
        dx = 0 if _rec.start1 else -1
        self.header = self.plint.header + ', %s %s' % (L._PAIR_, _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.modified_info = '%s %s, %s' % (L._LAST_MOD_, _rec(f[1]), get_user_name(_rec(f[2])))

#==================================================================

def import_from_txt1(f):
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

    table_header('cross_table', ('id', 'title'))
    crosses = []
    for i in xrange(int(f.readline())):
        writer.writerow([i+1, readstring(f)])   # cross_index, cross_title
        crosses.append([i+1, int(readstring(f))])  # cross_index, vertical count in cross
    table_footer()

    table_header('vertical_table', ('id', 'parent', 'title'))
    verticals = []
    x = 1
    for cross in crosses:
        for i in xrange(cross[1]):    # cross[1] is a vertical_count
            writer.writerow([x, cross[0], readstring(f)])  # vertical_index, cross_index, vertical_title
            verticals.append([cross[0], x, int(readstring(f)), readstring(f)])   # cross_index, vertical_index, plint count in vertical, start 1
            x += 1
    table_footer()

    table_header('plint_table', ('id','root','parent')+plintfields+tuple(sum(pairfields,[])))
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
