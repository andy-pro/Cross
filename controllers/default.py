# -*- coding: utf-8 -*-
from gluon import contenttype
import cStringIO

def index():
    return dict()

def error():
    response.view='default/error.html'
    codes = ('403','Access denied'), ('404','Not found'), ('500','Internal server error')
    code = request.args(0) or ''
    msg = request.args(1) or 'Unknown error'
    res = dict(code=code, msg=msg)
    for code, msg in codes:
        if res['code']==code:
            res['msg'] = msg
    return res

@auth.requires_membership('administrators')
def backupvertical():
    stream=cStringIO.StringIO()
    vertical = Vertical(request.args(0, cast = int))
    print >> stream, 'TABLE plint_table'
    db(db.plint_table.parent == vertical.index).select(orderby=db.plint_table.id).export_to_csv_file(stream)
    print >> stream, '\n\nEND'
    response.headers['Content-Type'] = contenttype.contenttype('.csv')
    filename = 'cross-%s-vertical-%s-%s.csv' % (vertical.cross.title, vertical.title, request.now.date())
    response.headers['Content-disposition'] = 'attachment; filename=' + filename.replace(' ', '_')
    return stream.getvalue()

@auth.requires_membership('administrators')
def backup():
    stream=cStringIO.StringIO()
    print >> stream, 'TABLE cross_table'
    db(db.cross_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nTABLE vertical_table'
    db(db.vertical_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nTABLE plint_table'
    db(db.plint_table.id).select().export_to_csv_file(stream)
    print >> stream, '\n\nEND'
    #db.export_to_csv_file(stream)  # all tables
    response.headers['Content-Type'] = contenttype.contenttype('.csv')
    response.headers['Content-disposition'] = 'attachment; filename=dbcross-%s.csv' % request.now.date()
    return stream.getvalue()

@auth.requires_membership('administrators')
def restore():
    import txt_to_db
    response.title = T('Import DB')
    form = FORM(INPUT(_type='file', _name='fn'),
                INPUT(_type='submit', _class='pull-right btn-primary'))
    if form.process().accepted:
        try:
            f = form.vars.fn.file
            #print f.name
            if f.name != None:  # is tmp file, txt
                if request.vars.mode != 'csv': f = txt_to_db.import_from_txt1(f)
                if f:
                    db.import_from_csv_file(f, restore = not bool(request.vars.merge))
                    msg = T('Database restored')
            else:
                msg = T('Error')
        except Exception as msg:
            pass
        session.flash = msg
        redirect(URL('default', 'index'))
    response.view='default/user.html'
    return dict(form=form)

@auth.requires_membership('administrators')
def cleardb():
    db.plint_table.truncate()
    db.vertical_table.truncate()
    db.cross_table.truncate()
    session.flash = T('Database cleared')
    redirect(URL('index'))

def user():
    return dict(form=auth())

@cache.action()
def download():
    return response.download(request, db)

def call():
    return service()
