# -*- coding: utf-8 -*-

def index():
    return dict()

@auth.requires_membership('administrators')
def restore():
    response.view='default/index.html'
    return dict()

def user():
    response.view='default/index.html'
    return dict(form=auth()) if request.args(0) == 'logout' else dict()

def error():
    response.view='default/index.html'
    return dict()

#@auth.requires_login()
@request.restful()
def api():
    response.view = 'generic.'+request.extension
    def GET(*args,**vars):
        patterns = 'auto'
        parser = db.parse_as_rest(patterns,args,vars)
        if parser.status == 200:
            return dict(content=parser.response)
        else:
            raise HTTP(parser.status,parser.error)
    #def POST(table_name,**vars):
        #return db[table_name].validate_and_insert(**vars)
    #def PUT(table_name,record_id,**vars):
        #return db(db[table_name]._id==record_id).update(**vars)
    #def DELETE(table_name,record_id):
        #return db(db[table_name]._id==record_id).delete()
    return locals()

@auth.requires_membership('administrators')
def backupvertical():
    import cStringIO
    from gluon import contenttype
    stream=cStringIO.StringIO()
    vertical = Vertical(request.args(0, cast = int))
    print >> stream, 'TABLE plints'
    db(db.plints.vertical == vertical.index).select(orderby=db.plints.id).export_to_csv_file(stream)
    print >> stream, '\n\nEND'
    response.headers['Content-Type'] = contenttype.contenttype('.csv')
    filename = 'cross-%s-vertical-%s-%s.csv' % (vertical.cross.title, vertical.title, request.now.date())
    response.headers['Content-disposition'] = 'attachment; filename=' + filename.replace(' ', '_')
    return stream.getvalue()

@auth.requires_membership('administrators')
def backup():
    import cStringIO
    from gluon import contenttype
    stream=cStringIO.StringIO()
    for table in tables:
        print >> stream, 'TABLE ' + table
        db(db[table].id).select().export_to_csv_file(stream)
        print >> stream, '\n'
    print >> stream, 'END'
    #db.export_to_csv_file(stream)  # all tables
    response.headers['Content-Type'] = contenttype.contenttype('.csv')
    response.headers['Content-disposition'] = 'attachment; filename=dbcross-%s.csv' % request.now.date()
    return stream.getvalue()

# fill db with user accounts, make this function non private for using: def auth_init():
#def auth_init():
def __auth_init():
    import txt_to_db
    f = txt_to_db.__auth_init()
    db.import_from_csv_file(f, restore = True)
    session.flash = 'Auth tables initialized'
    redirect(URL('default', 'index'))

@auth.requires_membership('administrators')
def cleardb():
    for table in reversed(tables): db[table].truncate()
    session.flash = T('Database cleared')
    redirect(URL('default', 'index'))

@cache.action()
def download():
    return response.download(request, db)

def call():
    return service()
