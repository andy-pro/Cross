# -*- coding: utf-8 -*-

start_path = '/cross/default/index/';   # URL function give wrong result for ajax.json request!!! (add '.json')
#request.requires_https() # all HTTP requests to be redirected to HTTPS, uncomment this line

from gluon.contrib.appconfig import AppConfig # private/appconfig.ini
myconf = AppConfig()
db = DAL(myconf.take('db.uri'), pool_size=myconf.take('db.pool_size', cast=int), check_reserved=['all'], migrate_enabled=False)
response.generic_patterns = ['*'] if request.is_local else ['*.json']   # for *.json give generic view
response.formstyle = myconf.take('forms.formstyle')  # or 'bootstrap3_stacked' or 'bootstrap2' or other
response.form_label_separator = myconf.take('forms.separator')

## (optional) optimize handling of static files
response.optimize_css = 'concat,minify,inline'
response.optimize_js = 'concat,minify,inline'
## (optional) static assets folder versioning
# response.static_version = '0.0.0'

from gluon.tools import Auth, Service, PluginManager

auth = Auth(db)
service = Service()
plugins = PluginManager()

auth.define_tables(username=False, signature=False)

## configure email
mail = auth.settings.mailer
mail.settings.server = 'logging' if request.is_local else myconf.take('smtp.server')
mail.settings.sender = myconf.take('smtp.sender')
mail.settings.login = myconf.take('smtp.login')

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

#========= define tables ================================
#print 'db.py exec'
tables = 'crosses', 'verticals', 'plints'
db.define_table('crosses', Field('title', length=40))
db.define_table('verticals', Field('parent', db.crosses), Field('title', length=40))
selfields = []
pairfields = []     # this list contain [pid1, pmodon1, pmodby1], [pid2, pmodon2, pmodby2], ...
pairtitles = []
pfset1 = ('pid','pmodon','pmodby')
for i in xrange(1, 11):
    fnames = [name+`i` for name in pfset1]
    pairfields.append(fnames)
    pairtitles.append(fnames[0])
    selfields.append(Field(fnames[0], length=80, default=''))
    selfields.append(Field(fnames[1], 'date', default=request.now.date()))
    selfields.append(Field(fnames[2], db.auth_user, default=auth.user))
plintfields = ('title','start1','comdata','modon','modby')
db.define_table('plints',
                Field('root', db.crosses),
                Field('parent', db.verticals),
                Field(plintfields[0], length=40, default=''),  # title
                Field(plintfields[1], 'boolean', default=True),  # start1
                Field(plintfields[2], length=40, default=''),  # comdata
                Field(plintfields[3], 'date', default=request.now.date()),  # modon
                Field(plintfields[4], db.auth_user, default=auth.user),  # modby
                *selfields)
pairtitles.append(plintfields[2])    # this list contain pid1, pid2,..., pid10, comdata
pfset1 = [db.plints.id, db.plints.title, db.plints.start1, db.plints.comdata]

def get_tb_fields():
    fields = (('id', 'title'), ('id', 'parent', 'title'), ('id','root','parent')+plintfields+tuple(sum(pairfields,[])))
    return zip(tables, fields)

## after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)

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

user_id = auth.user.id if auth.user else False
get_whenwho = lambda: dict(modon=request.now.date(), modby=user_id)
is_admin = auth.has_membership('administrators')
if is_admin: response.headers['Admin'] = True
response.headers['User-Id'] = user_id
btnBack = XML('<button type="button" class="close" aria-hidden="true" onclick="history.back();return false;" title="%s (Esc)">&times;</button>' % T("Back"))
PFORM = lambda title, form, script='': DIV(DIV(DIV(title, btnBack, _class="panel-heading"), DIV(form, _class="panel-body"), _class="panel panel-info"), SCRIPT('$("div.panel input:visible:first").focus();', script, _type='text/javascript'), _class="container cont-mid")

if not request.ajax:
    response.logo = A(B('CROSS'), XML('&trade;&nbsp;'), _class="navbar-brand",_href=URL('default', 'index'), _id="cross-logo", data={'spa':1})
    response.title = request.application.replace('_',' ').title()
    response.subtitle = ''
    ## read more at http://dev.w3.org/html5/markup/meta.name.html
    response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
    response.meta.description = 'Cross management application'
    response.meta.keywords = 'web2py, python, framework, javascript, ajax, jquery, andy-pro, single page application'
    response.meta.generator = 'Web2py Web Framework'
    ## your http://google.com/analytics id
    #response.google_analytics_id = None
    response.news = UL(LI(A(T('News'), _href=URL('default', 'index/vertical', vars={'news':'true'}), data={'spa':1})), _class="nav navbar-nav")

    if auth.has_membership('managers'):
        toolsmenu = [LI(A(I(_class="glyphicon glyphicon-th-list"), ' ', T('New cross'), _href=URL('default', 'index/editcross', vars={'new':'true'}), data={'spa':1}))]
        if is_admin:
            response.headers['Admin'] = True
            hr = LI(_class="divider")
            toolsmenu.append((hr, LI(A(I(_class="glyphicon glyphicon-upload"), ' ', T('Backup DB'), _href=URL('default', 'backup'))), hr,
                LI(A(I(_class="glyphicon glyphicon-download"), ' ', T('Restore DB'), _href=URL('default', 'restore'), data={'spa':1})),
                LI(A(I(_class="glyphicon glyphicon-plus"), ' ', T('Merge DB'), _href=URL('default', 'restore', vars={'merge':'true'}), data={'spa':1})),
                LI(A(I(_class="glyphicon glyphicon-import"), ' ', T('Import DB'), _href=URL('default', 'restore', vars={'txt':'true'}), data={'spa':1})), hr,
                #LI(A('Test', _href=URL('default', 'test'))), hr,
                #LI(A('Test', _href=URL('default', 'index/vertical'), data={'spa':1})), hr,
                LI(A(I(_class="glyphicon glyphicon-warning-sign"), ' ', T('Direct edit DB'), _href=URL('appadmin', 'index'))),
                LI(A(I(_class="glyphicon glyphicon-remove"), ' ', T('Clear DB'), _href="javascript:db_clear()")), hr,
                LI(A(I(_class="glyphicon glyphicon-cog"), ' RESTful API', _href=URL('default', 'api/patterns')))))
        response.toolsmenu = LI(A(T('Tools'), _href='#'), UL(toolsmenu, _class="dropdown-menu"), _class="dropdown")

class Cross:
    def __init__(self, _index):
        self.index = _index
        self.record = db.crosses[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.title = _rec.title
        self.header = T('Cross')+' '+self.title

    def update(self, vars):
        mainchange = False
        if vars.title != self.title:
            db.crosses[self.index] = {'title': vars.title}
            mainchange = True
        vt = vars.verticaltitle
        vt = db.verticals.update_or_insert(title=vt, parent=self.index) if vt else None  # return id of new record
        return vt or mainchange

    def delete(self):
        del db.crosses[self.index]

class Vertical:
    def __init__(self, _index):
        self.index = _index
        self.record = db.verticals[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.cross = Cross(_rec.parent.id)
        self.title = _rec.title
        self.header = self.cross.header + ', %s %s' % (T('Vertical'), self.title)

    def delete(self):
        del db.verticals[self.index]

    def update(self, vars):
        mainchange = False
        if self.title != vars.title:
            db.verticals[self.index] = {'title': vars.title}
            mainchange = True
        cnt = int(vars.count)
        if cnt:
            try:
                fp = int(vars.from_plint)
                fv = int(vars.from_vert)
                outplints = db((db.plints.parent == fv) & (db.plints.id >= fp)).select(limitby = (0, cnt))
                pc = len(outplints)
                pi = 0
            except:
                pc = 0

            idx = 0
            while(vars['title_'+str(idx)] and idx < 100):
                si = str(idx)
                idx += 1
                pt = vars['title_'+si]  # plint title, add new or modify if it exist
                xp = db((db.plints.title==pt) & (db.plints.parent==self.index)).select().first()
                if not xp:
                    xp = db.plints.insert(root=self.cross.index, parent=self.index, title=pt)
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

class Plint:
    def __init__(self, _index):
        self.index = _index
        self.record = db.plints[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.vertical = Vertical(_rec.parent)
        self.cross = self.vertical.cross
        self.title =_rec.title
        self.titles = self.cross.title, self.vertical.title,  self.title
        self.header = self.vertical.header + ', %s %s' % (T('Plint'), self.title)
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s' % (T('Last modified'), _rec.modon, get_user_name(_rec.modby))
        self.comdata = _rec.comdata
        self.start1 = _rec.start1

    get_pair_titles = lambda self: [self.record(pairtitles[i]) for i in xrange(10)]

    def delete(self):
        del db.plints[self.index]

    def update(self, vars):
        maindata = dict(title=vars.title, start1=bool(vars.start1), comdata=vars.comdata)
        pnew = vars.pairtitles.splitlines()
        pl = len(pnew)
        pairdata = {}
        for i in xrange(10):
            v = pnew[i] if pl > i else ''
            pairdata[i+1] = v
        return plint_update(self.index, maindata, pairdata, bool(vars.merge), vars.mergechar or '')

def plint_update(index, maindata, pairdata, merge=False, mergechar=''):
    """
    index - record id
    maindata - dict, possible keys: title, start1, comdata
    pairdata - dict, possible keys: 1, 2, ... 10: value - pair title
    merge - boolean, if True, new pair title merge with existing
    used by editpair, editfound, editplint (through Plint.update), editvertical (through Vertical.update)
    """
    plint = db.plints[index]
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
        db.plints[index] = maindata
    return mainchange

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
        self.header = self.plint.header + ', %s %s' % (T('Pair'), _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.modified_info = '%s %s, %s' % (T('Last modified'), _rec(f[1]), get_user_name(_rec(f[2])))
