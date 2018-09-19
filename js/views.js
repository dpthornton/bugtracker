const m = require('mithril')
var moment = require('moment');

function convert_date(date_string) {
  new_date = moment(date_string).utcOffset('+0100').format('YYYY-MM-DD HH:mm:ss');
  if (new_date == 'Invalid date') {
    new_date = '';
  }
  return new_date
}

class IssuesList {
  constructor(vnode) {
    this.model = vnode.attrs.model
  }
  oninit() {
    this.model.loadIssues()
  }
  view() {
    return m('table.table', [
      m('thead', [
        m('th', 'title'),
        m('th', 'opened'),
        m('th', 'closed')
      ]),
      m('tbody', [
        this.model.list.map(item =>
          m('tr', [
            m('td.title-cell', m("a", {href: `/issues/${item.id}`, oncreate: m.route.link}, item.title)),
            m('td.opened-cell', convert_date(item.opened)),
            m('td.closed-cell', convert_date(item.closed))
          ])
        )
      ])
    ])
  }
}

class ViewIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
    this.issueId = vnode.attrs.issueId
  }
  oninit() {
    this.model.loadIssue(this.issueId)
  }
  view() {
    let detail = this.model.issues[this.issueId]
    return detail
    ? m('div',[
        m('.row', [
          m('h1.col-sm-10', detail.title),
          m('.col-sm-1',
            m(
              'a.btn.btn-primary',
              {href: `/issues/${this.issueId}/edit`, oncreate: m.route.link},
              'Edit'
            )
          ),
          m('.col-sm-1',  
            m(
              'a.btn.btn-secondary',
              {href: `/issues/${this.issueId}/close`, oncreate: m.route.link},
              'Close Issue'
            )
          )
        ]),
        m('dl.row', [
          m('dt.col-sm-3', 'Opened'),
          m('dd.col-sm-3', convert_date(detail.opened)),
          m('dt.col-sm-3', 'Closed'),
          m('dd.col-sm-3', convert_date(detail.closed)),
        ]),
        m('h2', 'Description'),
        m('p.description', detail.description)
      ]
    )
    : m('.alert.alert-info', 'Loading')
  }
}

class EditIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
    this.issueId = vnode.attrs.issueId
  }
  async oninit() {
    await this.model.loadIssue(this.issueId)
  }
  view() {
    let issue = this.model.issues[this.issueId]
    return issue
    ? m(IssueEditor, {
      title: issue.title,
      description: issue.description,
      onSubmit: async (fields) => {
        await this.model.updateIssue(this.issueId, fields)
        m.route.set(`/issues/${this.issueId}`)
        m.redraw()
      }
    })
    :m('.alert.alert-info', 'Loading')
  }
}

class CloseIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model 
    this.issueId = vnode.attrs.issueId
  }
  async oninit() {
    await this.model.loadIssue(this.issueId)
  }
  view() {
    let issue = this.model.issues[this.issueId]
    return issue
    ? m(CloseCheck, {
      title: issue.title,
      description: issue.description,
      onSubmit: async (fields) => {
        await this.model.updateIssue(this.issueId, fields)
        m.route.set(`/issues/${this.issueId}`)
        m.redraw()
      }
    })
    :m('.alert.alert-info', 'Loading')
  }
}

class CreateIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
  }
  view() {
    return m(IssueEditor, {
      title: '',
      description: '',
      onSubmit: async ({description, title}) => {
        await this.model.createIssue({description: description, title: title})
        m.route.set(`/issues`)
        m.redraw()
      }
    })
  }
}

class IssueEditor {
  constructor(vnode) {
    this.title = vnode.attrs.title
    this.description = vnode.attrs.description
    this.onSubmit = vnode.attrs.onSubmit
  }
  view() {
    return m('form', {onsubmit: e => this.onSubmit({title: this.title, description: this.description})}, [
      m('.form-group', [
        m('label', {'for': 'title-input'}, 'Issue Title'),
         m('input.form-control#title-input', {value: this.title, oninput: (e) => {this.title = e.target.value}})
      ]),
      m('.form-group', [
        m('label', {'for': 'description-input'}, 'Description'),
        m('textarea.form-control#description-input', {value: this.description, oninput: (e) => {this.description = e.target.value}})
      ]),
      m('button.btn.btn-primary#save-button', {type: 'submit'}, 'Save')
    ]) 
  }
}

class CloseCheck {
  constructor(vnode) {
    this.title = vnode.attrs.title
    this.description = vnode.attrs.description
    this.onSubmit = vnode.attrs.onSubmit
  }
  view() {
    return m('form', {onsubmit: e => this.onSubmit({closed: 'closed'})}, [
      m('.form-group', [
        m('label', {'for': 'title-input'}, 'Issue Title'),
        m('input.form-control#title-input', {readonly: true, value: this.title, oninput: (e) => {this.title = e.target.value}})
      ]),
      m('.form-group', [
        m('label', {'for': 'description-input'}, 'Description'),
        m('textarea.form-control#description-input', {readonly: true, value: this.description, oninput: (e) => {this.description = e.target.value}})
      ]),
      m('button.btn.btn-warning#closed', {type: 'submit', style: 'margin: 0.3em'}, 'Close Issue')
    ])
  }
}

const ToolbarContainer = {
  view(vnode) {
    return m('div', [
      m('nav.navbar.navbar-expand-lg.navbar-light.bg-light', [
        m('a.navbar-brand', {href: '/issues', oncreate: m.route.link}, 'Bug Tracker'),
        m('.collapse.navbar-collapse', [
          m('ul.navbar-nav', [
            m('li.nav-item', [
              m('a.nav-link', {href: '/issues/create', oncreate: m.route.link}, 'Create')
            ])
          ])
        ])
      ]),
      m('.container', vnode.children)
    ])
  }
}

module.exports = {IssuesList, ViewIssue, EditIssue, CreateIssue, IssueEditor, CloseIssue, CloseCheck, ToolbarContainer}
