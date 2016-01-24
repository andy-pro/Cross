# -*- coding: utf-8 -*-

start_path = '/cross/default/index/';   # URL function give wrong result for ajax.json request!!! (add '.json')
#request.requires_https() # all HTTP requests to be redirected to HTTPS, uncomment this line

from gluon.contrib.appconfig import AppConfig # private/appconfig.ini
myconf = AppConfig()
#db = DAL(myconf.take('db.uri'), pool_size=myconf.take('db.pool_size', cast=int), check_reserved=['common'], migrate_enabled=False)
db = DAL(myconf.take('db.uri'), pool_size=myconf.take('db.pool_size', cast=int), check_reserved=['common'], migrate_enabled=True)
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
mail.settings.tls = True

## configure auth policy
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True
auth.settings.create_user_groups = None
auth.settings.everybody_group_id = 1

#========= define tables ================================
#print 'db.py exec'
tables = 'cables', 'crosses', 'verticals', 'plints'
db.define_table('cables',
                Field('title', length=40, default=''),
                Field('details', length=80, default=''),
                Field('color', 'integer', default=0))
db.define_table('crosses', Field('title', length=40))
db.define_table('verticals', Field('cross', db.crosses), Field('title', length=40))
selfields = []
pairfields = []     # this list contain [pid1,pmodon1,pmodby1,pdt1,pch1,par1], [pid2,pmodon2,pmodby2,pdt2,pch2,par2], ...
pairtitles = []
pdtset = []
pfset1 = ('pid','pmodon','pmodby','pdt','pch','par','clr')    # must be 3 symbols
pfset2 = []
for i in xrange(1, 11):
    fnames = [name+`i` for name in pfset1]
    pairfields.append(fnames)
    pairtitles.append(fnames[0])
    pdtset.append(fnames[3])
    plintfields = Field(fnames[0], length=80, default='')   # pid, pair title
    pfset2.append(plintfields)
    selfields.append(plintfields)
    selfields.append(Field(fnames[1], 'date', default=request.now.date()))   # pmodon, modify date
    selfields.append(Field(fnames[2], db.auth_user, default=auth.user))   # pmodby, modify author
    selfields.append(Field(fnames[3], length=80, default=''))   # pdt, pair details
    selfields.append(Field(fnames[4], 'integer', default=0))   # pch, position in chain
    selfields.append(Field(fnames[5], 'boolean', default=False))   # par, parallel presence
    selfields.append(Field(fnames[6], 'integer', default=0))   # clr, pair color, default is #fff, white
plintfields = ('title','start1','comdata','modon','modby','cable')
db.define_table('plints',
                Field('cross', db.crosses),
                Field('vertical', db.verticals),
                Field(plintfields[0], length=40, default=''),  # title
                Field(plintfields[1], 'boolean', default=True),  # start1
                Field(plintfields[2], length=40, default=''),  # comdata
                Field(plintfields[3], 'date', default=request.now.date()),  # modon
                Field(plintfields[4], db.auth_user, default=auth.user),  # modby
                Field(plintfields[5], db.cables),  # cable
                *selfields)
pairtitles.append(plintfields[2])    # this list contain pid1, pid2,..., pid10, comdata
pfset1 = [db.plints.id, db.plints.title, db.plints.start1, db.plints.comdata]
pfset2 = pfset1 + pfset2
pdtset = pairtitles + pdtset

def get_tb_fields():
    fields = (('id','title'), ('id','cross','title'), ('id','cross','vertical')+plintfields+tuple(sum(pairfields,[])))
    #return zip(tables, fields)
    return zip(('crosses', 'verticals', 'plints'), fields)

get_pids = lambda rec: '\n'.join(rec(pairtitles[i]) or '' for i in xrange(10))
get_pdts = lambda rec: '\n'.join(rec(pairfields[i][3]) or '' for i in xrange(10))

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
itext = lambda c, t: I(_class='glyphicon glyphicon-'+c) + ' ' + t

if not request.ajax:
    response.title = request.application.replace('_',' ').title()
    response.subtitle = ''
    response.meta.author = 'Andrey Protsenko <andy.pro.1972@gmail.com>'
    response.meta.description = 'Cross management application'
    response.meta.keywords = 'web2py, web2spa, single page application, python, framework, javascript, ajax, jquery, andy-pro'
    response.meta.generator = 'Web2py Web Framework'
    response.crossmenu = [
        ('', False, A(B('CROSS'), XML('&trade;&nbsp;'), _class='navbar-brand web2spa',_href=URL('default', 'index'))),
        ('', False, A(B(T('News')), _class="nav navbar-nav web2spa", _href=URL('default', 'index/news'))),
        ('', False, A(LABEL(INPUT(_type='checkbox', _id='chainMode'), T('Edit chain')), _class='inmenu'))
    ]

    if auth.has_membership('managers'):
        toolsmenu = [('', False, A(itext('th-list', T('New cross')), _class='web2spa', _href=URL('default', 'index/editcross', vars={'new':'true'}))),
                     ('', False, A(itext('random', T('Cables')), _class='web2spa', _href=URL('default', 'index/editcables')))]
        if is_admin:
            response.headers['Admin'] = True
            hr = LI(_class="divider")
            toolsmenu += [hr, (itext('upload', T('Backup DB')), False, URL('default', 'backup')), hr,
                ('', False, A(itext('download', T('Restore DB')), _class='web2spa', _href=URL('default', 'restore'))),
                ('', False, A(itext('plus', T('Merge DB')), _class='web2spa', _href=URL('default', 'restore', vars={'merge':'true'}))),
                ('', False, A(itext('import', T('Import DB')), _class='web2spa', _href=URL('default', 'restore', vars={'txt':'true'}))), hr,
                #('Test', False, URL('default', 'test')), hr,
                #('', False, A('Test', _class='web2spa', _href=URL('default', 'index/vertical'))), hr,
                (itext('warning-sign', T('Direct edit DB')), False, URL('appadmin', 'index')),
                (itext('remove', T('Clear DB')), False, 'javascript:app.db_clear()'), hr,
                (itext('cog', 'RESTful API'), False, URL('default', 'api/patterns'))]
        response.toolsmenu = [(T('Tools'), False, '#', toolsmenu)]

class Cross:
    def __init__(self, _index):
        self.index = _index
        self.record = db.crosses[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.title = _rec.title
        self.header = T('Cross')+' '+self.title

    def update(self, vars):
        changed = False
        if vars.title != self.title:
            db.crosses[self.index] = {'title': vars.title}
            changed = True
        vt = vars.verticaltitle
        vt = db.verticals.update_or_insert(title=vt, cross=self.index) if vt else None  # return id of new record
        return vt or changed

    def delete(self):
        del db.crosses[self.index]

class Vertical:
    def __init__(self, _index):
        self.index = _index
        self.record = db.verticals[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.cross = Cross(_rec.cross.id)
        self.title = _rec.title
        self.header = self.cross.header + ', %s %s' % (T('Vertical'), self.title)

    def delete(self):
        del db.verticals[self.index]

    def update(self, vars):
        if vars.cable:
            db.cables[vars.cable.id] = vars.cable.maindata
        changed = False
        if self.title != vars.title:
            db.verticals[self.index] = {'title': vars.title}
            changed = True
        for plint in vars.plints:
            pt = plint.maindata.title
            xp = db((db.plints.title==pt) & (db.plints.vertical==self.index)).select().first()
            if not xp:  # if plint not exist then create it
                xp = db.plints.insert(cross=self.cross.index, vertical=self.index)
            if plint_update(xp.id, plint.maindata, plint.pairdata):
                changed = True
        for plint in vars.rplints:
            if plint_update(plint.id, plint.maindata, {}):
                changed = True
        return changed

class Plint:
    def __init__(self, _index):
        self.index = _index
        self.record = db.plints[_index]
        if not self.record: raise HTTP(404)
        _rec = self.record
        self.vertical = Vertical(_rec.vertical)
        self.cross = self.vertical.cross
        self.title =_rec.title
        self.titles = self.cross.title, self.vertical.title,  self.title
        self.header = self.vertical.header + ', %s %s' % (T('Plint'), self.title)
        self.address = '%s %s %s' % self.titles
        self.modified_info = '%s %s, %s' % (T('Last modified'), _rec.modon, get_user_name(_rec.modby))
        self.comdata = _rec.comdata
        self.start1 = _rec.start1

    #get_pair_titles = lambda self: [self.record(pairtitles[i]) for i in xrange(10)]
    get_fieldset = lambda self, f: [self.record('%s%i' % (f,i)) or '' for i in xrange(1,11)]
    get_fieldstring = lambda self, f: '\n'.join(self.get_fieldset(f)).rstrip()

    def delete(self):
        del db.plints[self.index]

    def update(self, vars):
        maindata = dict(title=vars.title, start1=bool(vars.start1), comdata=vars.comdata)
        pidnew = vars.pairtitles.splitlines()
        pdtnew = vars.pairdetails.splitlines()
        pidl = len(pidnew)
        pdtl = len(pdtnew)
        pairdata = {}
        for i in xrange(10):
            pairdata['pid'+`i+1`] = pidnew[i] if pidl > i else ''
            pairdata['pdt'+`i+1`] = pdtnew[i] if pdtl > i else ''
        return plint_update(self.index, maindata, pairdata, bool(vars.merge), vars.mergechar or '')

def plint_update(index, maindata, pairdata, merge=False, mergechar=''):
    """
    index - record id
    maindata - dict, possible keys: title, start1, comdata, cable
    pairdata - dict, possible keys: pid1-10:title; pdt1-10:details; pch1-10:position in chain; par1-10:parallel existence; clr1-10:pair color
    merge - boolean, if True, new pair title merge with existing
    """
    table = db.plints
    plint = table[index]
    whenwho = get_whenwho()
    changed = False
    if maindata:
        keys = maindata.keys()
        for key in keys:
            if plint(key) != maindata[key]: changed = True
            if table[key].type.startswith('reference') and maindata[key]==0: maindata[key]=None
    if pairdata:
        keys = pairdata.keys()
        for key in keys:
            s1=plint(key)   # old value
            s2=pairdata[key]    # new value
            if merge and (key[:3]=='pid' or key[:3]=='pdt'): s2 = (s1 + mergechar + s2).strip()
            if s1 != s2:
                changed = True
                maindata[key] = s2
                sk = str(key[3:])   # 'pid','pdt','pch','par','clr'  must be 3 symbols
                maindata['pmodon' + sk] = whenwho['modon']
                maindata['pmodby' + sk] = whenwho['modby']
    if changed:
        maindata.update(whenwho)
        db.plints[index] = maindata
    return changed

class Pair:
    def __init__(self, _plint, _pair):
        if _pair>10 or _pair<1: raise HTTP(404)
        self.plint = Plint(_plint)
        _rec = self.plint.record
        self.record = _rec
        self.index = _rec.id
        self.pair = _pair
        self.vertical = self.plint.vertical
        f = pairfields[_pair-1]
        self.title = _rec(f[0])
        self.details = _rec(f[3])
        self.chain_pos = _rec(f[4])
        self.pchain_pos = _rec(f[5])    # parallel position
        dx = 0 if _rec.start1 else -1
        self.header = self.plint.header + ', %s %s' % (T('Pair'), _pair + dx)
        self.address = self.title + ' ' + self.plint.address
        self.modified_info = '%s %s, %s' % (T('Last modified'), _rec(f[1]), get_user_name(_rec(f[2])))
