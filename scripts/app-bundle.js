define('views/tickler/tickler',['exports', 'aurelia-router', 'aurelia-dialog', 'aurelia-event-aggregator', '../../services/data-service', '../../dialogs/confirm-delete-dialog'], function (exports, _aureliaRouter, _aureliaDialog, _aureliaEventAggregator, _dataService, _confirmDeleteDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Tickler = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Tickler = exports.Tickler = (_temp = _class = function () {
    function Tickler(router, dialogService, messageBus, dataService) {
      var _this = this;

      _classCallCheck(this, Tickler);

      this.database = 'quote-one';
      this.fallbackSrc = 'static/avatar-default.jpg';
      this.items = [];
      this.origItems = [];

      this.router = router;
      this.dialogService = dialogService;
      this.messageBus = messageBus;
      this.dataService = dataService;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    Tickler.prototype.activate = function activate(params) {
      if (params && params.database && params.userId) {
        this.database = params.database;
        this.userid = params.userId;
      }
      return this.getResources();
    };

    Tickler.prototype.getResources = function getResources() {
      var _this2 = this;

      return Promise.all([this.dataService.findAll(this.database, "quotes", null, { name: 1 })]).then(function (values) {
        _this2.origItems = values[0];
      }).catch(function (error) {
        console.error(error);
      });
    };

    Tickler.prototype.launchDeleteDlg = function launchDeleteDlg() {
      var model = {
        header: "Confirm Delete",
        prompt: 'Are you sure you want to delete this record?'
      };
      this.dialogService.open({
        viewModel: _confirmDeleteDialog.ConfirmDeleteDialog, model: model, lock: false
      }).whenClosed(function (response) {
        if (!response.wasCancelled) {
          console.log('perform delete');
        } else {
          console.log('delete cancelled');
        }
      });
    };

    Tickler.prototype.newRecord = function newRecord() {
      var recordid = 'new';
      this.router.navigate('quote/' + recordid);
    };

    Tickler.prototype.loadRecord = function loadRecord($index, item) {
      var recordid = item._id.$oid;
      this.router.navigate('quote/' + recordid);
    };

    return Tickler;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaDialog.DialogService, _aureliaEventAggregator.EventAggregator, _dataService.DataService], _temp);
});
define('views/tickler/tickler.html!text', ['module'], function(module) { module.exports = "<template><section class=\"view-section flex-column full-height au-animate drag-container drag-item\"><header class=\"flex flex-none frontendcreator-header\"><div class=\"flex-row-1 align-items-center\"><span class=\"app-title margin-left-10\">QuoteOne - ${heading}</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"><button class=\"btn btn-black flat\" click.delegate=newRecord()><i class=\"fa fa-plus\"></i>New</button></div></header><main class=\"flex-column-1 margin-15\"><div class=\"flex-1 table-response\"><table class=\"table-condensed table quote-table\"><thead><tr><th class=\"\">Insured Name</th><th class=\"\">Date</th><th class=\"\">Entered By</th><th class=\"\">Type</th><th class=\"\">Actions</th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\">${row.InsuredFirstName1 + ' ' + row.InsuredLastName1}</td><td class=\"\">${row.TransactionRequestDt}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.EnteredBy} </td><td class=\"\">${row.InsuranceType}</td><td class=\"\"><div class=\"col-xs-3 align-bottom\"><button class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-pencil\"></span></button><button class=\"btn btn-danger btn-sm\" click.delegate=\"launchDeleteDlg($index, row)\" style=margin-bottom:-3px><i class=\"fa fa-trash-o\"></i></button></div></td></tr></tbody></table></div><div class=\"flex-none text-center\"><data-pager items.bind=origItems></data-pager></div></main></section></template>"; });
define('views/test-bed/test-bed',['exports', 'firebase', '../../services/session-service'], function (exports, _firebase, _sessionService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TestBed = undefined;

  var _firebase2 = _interopRequireDefault(_firebase);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var TestBed = exports.TestBed = (_temp = _class = function () {
    function TestBed(firebase, sessionSvc) {
      _classCallCheck(this, TestBed);

      this.currentItem = {};
      this.firebaseConfig = {
        apiKey: "AIzaSyDEkTD8tTzr44BV7SU5TLisxLYpnHoikR0",
        authDomain: "quote-one.firebaseapp.com",
        databaseURL: "https://quote-one.firebaseio.com",
        projectId: "quote-one",
        storageBucket: "quote-one.appspot.com",
        messagingSenderId: "99622332915"
      };

      this.firebase = firebase;
      this.sessionSvc = sessionSvc;
      if (!firebase.apps.length) {
        firebase.initializeApp(this.firebaseConfig);
      }
    }

    TestBed.prototype.attached = function attached() {
      var _this = this;

      var dbRef = this.firebase.database().ref().child('text');
      dbRef.on('value', function (snap) {
        if (_this.currentItem.conversation) {
          _this.currentItem.conversation = '' + _this.currentItem.conversation + snap.val() + '\n';
        } else {
          _this.currentItem.conversation = snap.val() + '\n';
        }
      });
    };

    TestBed.prototype.submit = function submit(event) {
      event.stopPropagation();
      var msg = '(' + this.sessionSvc.user.username + ') ' + this.currentItem.message;

      this.firebase.database().ref().set({
        text: msg
      });
      this.currentItem.message = '';
    };

    return TestBed;
  }(), _class.inject = [_firebase2.default, _sessionService.SessionService], _temp);
});
define('views/test-bed/test-bed.html!text', ['module'], function(module) { module.exports = "<template><form class=flex-column-1><fieldset tag=\"Messages Info\" class=\"flex-column-none form-fields\"><legend>Messages</legend><div class=\"flex-column-none form-fields\"><div class=form-group><label for=conversation>Conversation</label><textarea id=conversation class=form-control rows=10 value.bind=currentItem.conversation></textarea></div><div class=form-group><label for=message>New Message</label><div class=input-group><input id=message class=form-control value.bind=currentItem.message><span class=input-group-btn><button class=\"btn btn-default\" click.delegate=submit($event)>Submit</button></span></div></div></div></fieldset></form></template>"; });
define('views/temp.html!text', ['module'], function(module) { module.exports = "<template><form><table class=\"table-condensed table\"><thead class=table-header-red><tr><th>Created Date</th><th>Note</th><th>Created By</th></tr></thead><tbody><tr repeat.for=\"row of data\" with.bind=row><td><input type=date id=CreatedDate class=form-control value.bind=CreatedDate></td><td><input type=text id=Note class=form-control value.bind=Note></td><td><input type=text id=CreatedBy class=form-control value.bind=CreatedBy></td></tr></tbody></table></form></template>"; });
define('views/quotes/quotes',['exports', 'aurelia-router', 'aurelia-dialog', 'aurelia-event-aggregator', '../../services/data-service', '../../resources/elements/notifier/notifier', '../../dialogs/confirm-delete-dialog', 'moment'], function (exports, _aureliaRouter, _aureliaDialog, _aureliaEventAggregator, _dataService, _notifier, _confirmDeleteDialog, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Quotes = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Quotes = exports.Quotes = (_temp = _class = function () {
    function Quotes(router, dialogSvc, messageBus, dataSvc, notifier) {
      var _this = this;

      _classCallCheck(this, Quotes);

      this.database = 'quote-one';
      this.collection = 'quotes';
      this.fallbackSrc = 'static/avatar-default.jpg';
      this.items = [];
      this.origItems = [];
      this.quoteStatus = {
        'kill quote': { fa: 'window-close', cls: 'quote-kill-quote' },
        'work quote': { fa: 'briefcase', cls: 'quote-work-quote' },
        'agent completed': { fa: 'check', cls: 'quote-agent-completed' },
        'auto completed': { fa: 'check', cls: 'quote-auto-completed' },
        'auto failed': { fa: 'exclamation', cls: 'quote-auto-failed' },
        'new': { fa: 'circle', cls: 'quote-new' },
        'ready to quote': { fa: 'circle', cls: 'quote-ready-to-quote' },
        'pending': { fa: 'circle', cls: 'quote-pending' },
        'stalled': { fa: 'circle', cls: 'quote-stalled' }
      };

      this.router = router;
      this.dialogSvc = dialogSvc;
      this.messageBus = messageBus;
      this.dataSvc = dataSvc;
      this.notifier = notifier;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    Quotes.prototype.activate = function activate(params) {
      if (params && params.database && params.userId) {
        this.database = params.database;
        this.userid = params.userId;
      }
      return this.getResources();
    };

    Quotes.prototype.getResources = function getResources() {
      var _this2 = this;

      return Promise.all([this.dataSvc.findAll(this.database, this.collection, null, { name: 1 })]).then(function (values) {
        _this2.items = values[0];
      }).catch(function (error) {
        console.error(error);
      });
    };

    Quotes.prototype.launchDeleteDlg = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee($index, row) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                model = {
                  header: "Confirm Delete",
                  prompt: 'Are you sure you want to delete this record?'
                };
                options = { viewModel: _confirmDeleteDialog.ConfirmDeleteDialog, model: model };
                _context.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context.sent;

                if (!closeResult.wasCancelled) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt('return');

              case 7:
                _context.next = 9;
                return this.dataSvc.deleteOne(this.database, this.collection, row._id.$oid);

              case 9:
                this.items.splice($index, 1);
                this.notifier.growl({ message: "Delete complete!" });

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function launchDeleteDlg(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return launchDeleteDlg;
    }();

    Quotes.prototype.newRecord = function newRecord() {
      var recordid = 'new';
      this.router.navigate('quote/' + recordid);
    };

    Quotes.prototype.loadRecord = function loadRecord($index, item) {
      var recordid = item._id.$oid;
      this.router.navigate('quote/' + recordid);
    };

    Quotes.prototype.computeDateTime = function computeDateTime(date) {
      var today = (0, _moment2.default)(date).format("MM-DD-YYYY");
      var time = (0, _moment2.default)(date).format("HH:mm");
      var format = today + ' ' + time;
      return format;
    };

    Quotes.prototype.computeQuoteStatus = function computeQuoteStatus(status) {
      var result = this.quoteStatus[status];
      if (!result) return { fa: 'circle', cls: '' };
      return result;
    };

    return Quotes;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaDialog.DialogService, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('views/quotes/quotes.html!text', ['module'], function(module) { module.exports = "<template><section class=\"view-section flex-column full-height au-animate drag-container drag-item\"><header class=\"flex flex-none frontendcreator-header\"><div class=\"flex-row-1 align-items-center\"><span class=\"app-title margin-left-10\">Quotes</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"><button class=\"btn btn-primary flat\" click.delegate=newRecord()><i class=\"fa fa-plus\"></i>New</button></div></header><main class=\"flex-column-1 margin-15\"><div class=\"flex-1 table-response\"><table class=\"table-condensed table quote-table\"><thead><tr><th class=\"\">Insured Name</th><th class=\"\">Status</th><th class=\"\">Date</th><th class=\"\">Entered By</th><th class=\"\">Type</th><th class=\"\">Modified By</th><th class=\"\">Actions</th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\">${row.first_name + ' ' + row.last_name}</td><td class=\"\"><span class=margin-right-5><i class=\"fa fa-${computeQuoteStatus(row.quote_status).fa} ${computeQuoteStatus(row.quote_status).cls}\"></i></span> ${row.quote_status} </td><td class=\"\">${computeDateTime(row.created_date)}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.created_by} </td><td class=\"\">${row.quote_type}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.modified_by} </td><td class=\"\"><div class=\"xcol-xs-3 align-bottom\"><button show.bind=\"row.quote_status === 'auto completed' || row.quote_status === 'agent completed'\" class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-clone\"></span></button><button show.bind=\"row.quote_status !== 'auto completed' && row.quote_status !== 'agent completed'\" class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-pencil\"></span></button><button class=\"btn btn-danger btn-sm\" click.delegate=\"launchDeleteDlg($index, row)\" style=margin-bottom:-3px><i class=\"fa fa-trash-o\"></i></button></div></td></tr></tbody></table></div><div class=\"flex-none text-center\"></div></main></section></template>"; });
define('views/quotes/quote',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-templating-resources', 'aurelia-dialog', '../../services/session-service', '../../services/data-service', '../../resources/elements/notifier/notifier', '../../dialogs/address-dialog', '../../dialogs/confirm-delete-dialog', '../../dialogs/submit-dialog', '../../dialogs/lookup-dialog', '../../dialogs/member-dialog', '../../dialogs/member-lookup-dialog', '../../dialogs/vehicle-dialog', '../../dialogs/vehicle-lookup-dialog', '../../dialogs/note-dialog', 'moment'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaTemplatingResources, _aureliaDialog, _sessionService, _dataService, _notifier, _addressDialog, _confirmDeleteDialog, _submitDialog, _lookupDialog, _memberDialog, _memberLookupDialog, _vehicleDialog, _vehicleLookupDialog, _noteDialog, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Quote = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Quote = exports.Quote = (_temp = _class = function () {
    function Quote(router, signaler, dialogSvc, sessionSvc, dataSvc, notifier) {
      _classCallCheck(this, Quote);

      this.database = 'quote-one';
      this.collection = 'quotes';
      this.currentItem = null;
      this.origItem = null;
      this.hasChanged = false;

      this.router = router;
      this.signaler = signaler;
      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
      this.dataSvc = dataSvc;
      this.notifier = notifier;

      console.debug('individual-quote:ctor - sessionSvc.user', sessionSvc);
      console.debug('individual-quote:ctor - dataSvc');
      this.user = sessionSvc.user;
    }

    Quote.prototype.isEqual = function isEqual(oldValue, newValue) {
      return JSON.stringify(oldValue) === JSON.stringify(newValue);
    };

    Quote.prototype.activate = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(params) {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (params.recordid) {
                  this.recordid = params.recordid;
                }
                this.heading = 'QuoteOne';
                _context.next = 4;
                return this.getResources();

              case 4:
                if (!(this.recordid === 'new')) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return');

              case 6:
                _context.next = 8;
                return this.dataSvc.findById(this.database, this.collection, this.recordid);

              case 8:
                response = _context.sent;

                this.currentItem = response;

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function activate(_x) {
        return _ref.apply(this, arguments);
      }

      return activate;
    }();

    Quote.prototype.deactivate = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.hasChanged = !this.isEqual(this.origItem, this.currentItem);

                if (!this.hasChanged) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 4;
                return this.save(true);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deactivate() {
        return _ref2.apply(this, arguments);
      }

      return deactivate;
    }();

    Quote.prototype.attached = function attached() {
      var _this = this;

      this.origItem = JSON.parse(JSON.stringify(this.currentItem));

      this.saveInterval = setInterval(_asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this.hasChanged = !_this.isEqual(_this.origItem, _this.currentItem);

                if (!(_this.hasChanged && _this.currentItem.customerId)) {
                  _context3.next = 5;
                  break;
                }

                _this.notifier.growl({ message: "Auto-saving..." });
                _context3.next = 5;
                return _this.save(true);

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this);
      })), 15000);
    };

    Quote.prototype.detached = function detached() {
      clearInterval(this.saveInterval);
    };

    Quote.prototype.getResources = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var values;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all([this.dataSvc.findAll(this.database, "lookups")]);

              case 2:
                values = _context4.sent;

                this.lookups = values[0];
                console.debug('individualquote:getResources - lookupDialog', this.lookupDialog);

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getResources() {
        return _ref4.apply(this, arguments);
      }

      return getResources;
    }();

    Quote.prototype.launchMemberLookupDlg = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                model = {
                  header: "Member Lookup",
                  close: "Close",
                  recordId: this.currentItem.customerId,
                  lookups: this.lookups
                };
                options = { viewModel: _memberLookupDialog.MemberLookupDialog, model: model };
                _context5.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context5.sent;

                if (!closeResult.wasCancelled) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt('return');

              case 7:
                this.addHouseholdMember(closeResult.output);
                this.notifier.growl({ message: "Auto-saving..." });
                _context5.next = 11;
                return this.save(true);

              case 11:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function launchMemberLookupDlg() {
        return _ref5.apply(this, arguments);
      }

      return launchMemberLookupDlg;
    }();

    Quote.prototype.launchMemberDlg = function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(index, record) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                model = {
                  header: "Member",
                  close: "Close",
                  data: record,
                  isReadonly: true,
                  lookups: this.lookups
                };
                options = { viewModel: _memberDialog.MemberDialog, model: model };
                _context6.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context6.sent;

                if (!closeResult.wasCancelled) {
                  _context6.next = 7;
                  break;
                }

                return _context6.abrupt('return');

              case 7:
                record = closeResult.output;
                this.currentItem.household_members[index] = record;
                this.notifier.growl({ message: "Auto-saving..." });
                _context6.next = 12;
                return this.save(true);

              case 12:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function launchMemberDlg(_x2, _x3) {
        return _ref6.apply(this, arguments);
      }

      return launchMemberDlg;
    }();

    Quote.prototype.launchVehicleLookupDlg = function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                model = {
                  header: "Vehicle Lookup",
                  close: "Close",
                  recordId: this.currentItem.customerId,
                  lookups: this.lookups
                };
                options = { viewModel: _vehicleLookupDialog.VehicleLookupDialog, model: model };
                _context7.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context7.sent;

                if (!closeResult.wasCancelled) {
                  _context7.next = 7;
                  break;
                }

                return _context7.abrupt('return');

              case 7:
                this.addHouseholdVehicle(closeResult.output);
                this.notifier.growl({ message: "Auto-saving..." });
                _context7.next = 11;
                return this.save(true);

              case 11:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function launchVehicleLookupDlg() {
        return _ref7.apply(this, arguments);
      }

      return launchVehicleLookupDlg;
    }();

    Quote.prototype.launchVehicleDlg = function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(index, record) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                model = {
                  header: "Vehicle",
                  close: "Close",
                  data: record,
                  isReadonly: true,
                  lookups: this.lookups
                };
                options = { viewModel: _vehicleDialog.VehicleDialog, model: model };
                _context8.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context8.sent;

                if (!closeResult.wasCancelled) {
                  _context8.next = 7;
                  break;
                }

                return _context8.abrupt('return');

              case 7:
                record = closeResult.output;
                this.currentItem.household_vehicles[index] = record;
                this.notifier.growl({ message: "Auto-saving..." });
                _context8.next = 12;
                return this.save(true);

              case 12:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function launchVehicleDlg(_x4, _x5) {
        return _ref8.apply(this, arguments);
      }

      return launchVehicleDlg;
    }();

    Quote.prototype.launchNoteDlg = function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(index, record) {
        var isNew, model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                isNew = false;

                if (!record) {
                  record = this.newNote();
                  isNew = true;
                }
                model = {
                  header: "Customer Note",
                  close: "Close",
                  data: record,
                  lookups: this.lookups,
                  isNew: isNew
                };
                options = { viewModel: _noteDialog.NoteDialog, model: model };
                _context9.next = 6;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 6:
                closeResult = _context9.sent;

                if (!closeResult.wasCancelled) {
                  _context9.next = 9;
                  break;
                }

                return _context9.abrupt('return');

              case 9:
                record = closeResult.output;

                if (!isNew) {
                  _context9.next = 15;
                  break;
                }

                this.addNote(record);
                this.notifier.growl({ message: "Auto-saving..." });
                _context9.next = 15;
                return this.save(true);

              case 15:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function launchNoteDlg(_x6, _x7) {
        return _ref9.apply(this, arguments);
      }

      return launchNoteDlg;
    }();

    Quote.prototype.disabled = function disabled(value) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !args.includes(value);
    };

    Quote.prototype.addHouseholdVehicle = function addHouseholdVehicle(record) {
      this.currentItem.household_vehicles.push(record);
      this.signaler.signal('update-vehicles');
    };

    Quote.prototype.removeHouseholdVehicle = function removeHouseholdVehicle(record, index) {
      this.currentItem.household_vehicles.splice(index, 1);
      this.signaler.signal('update-vehicles');
    };

    Quote.prototype.addHouseholdMember = function addHouseholdMember(record) {
      this.currentItem.household_members.push(record);
      this.signaler.signal('update-members');
    };

    Quote.prototype.removeHouseholdMember = function removeHouseholdMember(record, index) {
      this.currentItem.household_members.splice(index, 1);
    };

    Quote.prototype.newNote = function newNote() {
      var d = Date.now();
      var record = {
        note: '',
        created_date: d,
        created_by: this.user.username,
        modified_date: d,
        modified_by: this.user.username,
        is_active: true
      };
      return record;
    };

    Quote.prototype.addNote = function addNote(record) {
      this.currentItem.notes.push(record);
      this.signaler.signal('update-notes');
    };

    Quote.prototype.saveCallback = function saveCallback() {
      this.save(true);
    };

    Quote.prototype.save = function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(ignoreNav) {
        var isNew, d, response, view;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                isNew = !this.currentItem._id;
                d = Date.now();

                if (!this.currentItem._id) {
                  this.currentItem.created_date = d;
                  this.currentItem.created_by = this.sessionSvc.user.username;
                }
                this.currentItem.modified_date = d;
                this.currentItem.modified_by = this.sessionSvc.user.username;
                this.currentItem.is_active = true;
                if (!this.currentItem.quote_status) {
                  this.currentItem.quote_status = 'new';
                }
                if (!this.currentItem.quote_type) {
                  this.currentItem.quote_type = 'auto';
                }
                _context10.next = 10;
                return this.dataSvc.save(this.database, this.collection, this.currentItem);

              case 10:
                response = _context10.sent;

                if (response.message) {
                  if (response.message.includes("Unique index constraint violated")) {
                    this.notifier.growl({
                      type: "error", message: "this name has already been taken. The name must be unique!", showClose: true, timeout: 10000
                    });
                  } else {
                    this.notifier.growl({
                      type: "error", message: response.message, showClose: true, timeout: 10000
                    });
                  }
                } else {
                  if (isNew) {
                    this.currentItem._id = response._id;
                  }
                  view = "quotes";

                  this.notifier.growl({ message: "Save complete!" });
                  this.origItem = JSON.parse(JSON.stringify(this.currentItem));
                  this.signaler.signal('update-binding');
                  if (!ignoreNav) {
                    this.router.navigateToRoute(view);
                  }
                }

              case 12:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function save(_x8) {
        return _ref10.apply(this, arguments);
      }

      return save;
    }();

    Quote.prototype.manageImages = function manageImages() {
      this.router.navigate('quote/' + this.recordid + '/images');
    };

    Quote.prototype.computeDateTime = function computeDateTime(date) {
      var today = (0, _moment2.default)(date).format("MM-DD-YYYY");
      var time = (0, _moment2.default)(date).format("HH:mm");
      var format = today + ' ' + time;
      return format;
    };

    return Quote;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaTemplatingResources.BindingSignaler, _aureliaDialog.DialogService, _sessionService.SessionService, _dataService.DataService, _notifier.Notifier], _temp);
});
define('views/quotes/quote.html!text', ['module'], function(module) { module.exports = "<template><div class=\"view-section quote-view flex-column full-height\"><header class=\"flex flex-none frontendcreator-header margin-right-15 margin-top-5\"><div class=\"flex-row-1 align-items-center margin-left-15\"><span class=app-title>Individual Quote - ${currentItem.first_name} ${currentItem.last_name} ${hasChanged ? '*' : '' & signal:'update-binding'}</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"></div></header><main class=\"flex-row-1 overflow-y-auto\"><form class=\"flex-column-1 margin-15\" validator=\"data-context.bind: currentItem; schema.bind: schema;\" data-context=dataContext><quote-info current-item.two-way=currentItem lookups.bind=lookups></quote-info><personal-info current-item.two-way=currentItem lookups.bind=lookups show-customer-lookup=true save-callback.call=saveCallback() is-readonly=true></personal-info><address-info current-item.two-way=currentItem.address lookups.bind=lookups save-callback.call=saveCallback() is-readonly=true></address-info><contact-info current-item.two-way=currentItem.contact lookups.bind=lookups is-readonly=true></contact-info><driver-info current-item.two-way=currentItem.driver lookups.bind=lookups is-readonly=true></driver-info><fieldset tag=\"Household Members\" class=\"flex-row-none form-fields\"><legend>Household Members<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" disabled.bind=!currentItem.customerId click.delegate=launchMemberLookupDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Member</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>First</th><th>Last</th><th>DOB</th><th>Lic. #</th><th>Lic. Dt</th><th>Lic. State</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.household_members\" click.delegate=\"launchMemberDlg($index, row)\"><td>${row.first_name}</td><td>${row.last_name}</td><td>${row.birth_date}</td><td>${row.driver.license_number}</td><td>${row.driver.license_date}</td><td>${row.driver.license_state}</td></tr></tbody></table></div></fieldset><fieldset tag=\"Household Vehicles\" class=\"flex-row-none form-fields\"><legend>Household Vehicles<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" disabled.bind=!currentItem.customerId click.delegate=launchVehicleLookupDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Vehicle</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>VIN</th><th>Year</th><th>Make</th><th>Model</th><th>Description</th><th>Custom Equ.</th><th>Add Elec</th><th>Veh Use</th><th>Actions</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.household_vehicles\" click.delegate=\"launchVehicleDlg($index, row)\"><td>${row.vin}</td><td>${row.year}</td><td>${row.make}</td><td>${row.model}</td><td>${row.description}</td><td>${row.custom_equipment_type}</td><td>${row.additional_electronic_type}</td><td>${row.vehicle_use_code}</td><td></td></tr></tbody></table></div></fieldset><fieldset tag=Notes class=\"flex-row-none form-fields\"><legend>Notes<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" disabled.bind=!currentItem.customerId click.delegate=launchNoteDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Note</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>Created Date</th><th>Note</th><th>Created By</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.notes\" click.delegate=\"launchNoteDlg($index, row)\"><td>${computeDateTime(row.created_date)} </td><td>${row.note} </td><td>${row.created_by} </td></tr></tbody></table></div></fieldset><fieldset tag=Images class=\"flex-row-none form-fields\"><legend>Images<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" disabled.bind=!currentItem._id click.delegate=manageImages()><i class=\"fa fa-picture-o\"></i><span class=margin-left-5>Manage Images</span></button></legend><div class=\"flex-row-none form-fields\"></div></fieldset></form></main></div></template>"; });
define('views/quote-images/quote-images',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var QuoteImages = exports.QuoteImages = function QuoteImages() {
    _classCallCheck(this, QuoteImages);
  };
});
define('views/quote-images/quote-images.html!text', ['module'], function(module) { module.exports = "<template><section class=view-section><h1>Images here...</h1></section></template>"; });
define('views/quote-dashboard/quote-dashboard',['exports', 'aurelia-event-aggregator', '../../services/data-service'], function (exports, _aureliaEventAggregator, _dataService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.QuoteDashboard = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var QuoteDashboard = exports.QuoteDashboard = (_temp = _class = function () {
    function QuoteDashboard(messageBus, dataService) {
      var _this = this;

      _classCallCheck(this, QuoteDashboard);

      this.database = 'quote-one';
      this.fallbackSrc = 'static/avatar-default.jpg';
      this.items = [];
      this.origItems = [];

      this.messageBus = messageBus;
      this.dataService = dataService;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    QuoteDashboard.prototype.activate = function activate(params) {
      if (params && params.database && params.userId) {
        this.database = params.database;
        this.userid = params.userId;
      }
      return this.getResources();
    };

    QuoteDashboard.prototype.getResources = function getResources() {
      var _this2 = this;

      return Promise.all([this.dataService.findAll(this.database, "quotes", { $or: [{ QuoteStatus: { $eq: "ready to quote" } }, { QuoteStatus: { $eq: "pending" } }, { QuoteStatus: { $eq: "stalled" } }, { QuoteStatus: { $eq: "kill quote" } }, { QuoteStatus: { $eq: "auto completed" } }, { QuoteStatus: { $eq: "auto failed" } }] }, { name: 1 })]).then(function (values) {
        _this2.origItems = values[0];
      }).catch(function (error) {
        console.error(error);
      });
    };

    QuoteDashboard.prototype.loadLog = function loadLog($index, quote) {};

    QuoteDashboard.prototype.forceQuit = function forceQuit($index, quote) {};

    return QuoteDashboard;
  }(), _class.inject = [_aureliaEventAggregator.EventAggregator, _dataService.DataService], _temp);
});
define('views/quote-dashboard/quote-dashboard.html!text', ['module'], function(module) { module.exports = "<template><section class=\"view-section flex-column full-height au-animate drag-container drag-item\"><header class=\"flex flex-none frontendcreator-header\"><div class=\"flex-row-1 align-items-center\"><span class=\"app-title margin-left-10\">QuoteOne - Automation Dashboard</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"></div></header><main class=\"flex-column-1 margin-15\"><div class=\"flex-1 table-response\"><table class=\"table-condensed table quote-table\"><thead><tr><th class=\"\">Insured Name</th><th class=\"\">Status</th><th class=\"\">Date</th><th class=\"\">Last Step</th><th class=\"\">Modified By</th><th class=\"\">Actions</th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\">${row.InsuredFirstName1 + ' ' + row.InsuredLastName1}</td><td class=\"\"><span class=margin-right-5><i class=\"fa fa-${row.QuoteStatus === 'kill quote' ? 'window-close' : row.QuoteStatus === 'work quote' ? 'briefcase' : row.QuoteStatus === 'agent completed' ? 'check' : row.QuoteStatus === 'auto completed' ? 'check' : row.QuoteStatus === 'auto failed' ? 'exclamation' : 'circle'} ${row.QuoteStatus === 'new' ? 'quote-new' : row.QuoteStatus === 'work quote' ? 'quote-work-quote' : row.QuoteStatus === 'ready to quote' ? 'quote-ready-to-quote' : row.QuoteStatus === 'pending' ? 'quote-pending' : row.QuoteStatus === 'stalled' ? 'quote-stalled' : row.QuoteStatus === 'kill quote' ? 'quote-kill-quote' : row.QuoteStatus === 'agent completed' ? 'quote-agent-completed' : row.QuoteStatus === 'auto completed' ? 'quote-auto-completed' : row.QuoteStatus === 'auto failed' ? 'quote-auto-failed' : '' }\"></i></span>${row.QuoteStatus}</td><td class=\"\">${row.TransactionRequestDt}</td><td class=\"\">${row.lastStep}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.ModifiedBy} </td><td class=\"\"><div class=\"xcol-xs-3 align-bottom\"><button class=\"btn btn-primary btn-sm\" click.delegate=\"loadLog($index, row)\" style=margin-bottom:-3px title=\"Load log information\"><span class=\"fa fa-sticky-note\"></span></button><button class=\"btn btn-danger btn-sm\" click.delegate=\"forceQuit($index, row)\" style=margin-bottom:-3px title=\"Force automation run to quit\"><i class=\"fa fa-close\"></i></button></div></td></tr></tbody></table></div><div class=\"flex-none text-center\"><data-pager items.bind=origItems></data-pager></div></main></section></template>"; });
define('views/login/login',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Login = exports.Login = function () {
    function Login() {
      _classCallCheck(this, Login);

      this.username = 'matt';
      this.password = '1234';
    }

    Login.prototype.login = function login() {};

    Login.prototype.cancel = function cancel() {};

    return Login;
  }();
});
define('views/login/login.html!text', ['module'], function(module) { module.exports = "<template><require from=./login.css></require><div class=\"clear page login\"><form><label>Username</label><input type=text value.bind=username><label>Password</label><input type=password value.bind=password><div class=buttons><button click.delegate=login()>Login</button><button click.delegate=cancel()>Cancel</button></div></form></div></template>"; });
define('views/login/login.css!text', ['module'], function(module) { module.exports = "html, body { height: 100%; width: 100%; margin: 0; padding: 0; }\n.page { display: flex; flex-direction: row; height: calc(100vh); justify-content: center; align-items: center; background: lightgray; }\n.login form { \n  height: 200px;\n  width: 300px;\n\n  display: flex; \n  flex-direction: column; \n  flex: 0 0 auto; \n  \n  border: 1px solid; \n  border-radius: 5px;\n  padding: 15px;\n  background: lightblue; \n}\n.login form label, .login form button {\n  margin-top: 10px !important;\n}\n.login form label {\n  font-size: 20px !important;\n}\n.login form input {\n  flex: 1 1 auto;\n  font-size: 20px !important;\n  height:40px;\n}\n.login .buttons {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-around;\n\n  height: 60px;\n}\n.login .buttons button {\n  flex: 0 1 95px;\n  font-size: 20px !important;\n}\n\n"; });
define('views/home/home',['exports', 'aurelia-router', 'aurelia-dialog', 'aurelia-event-aggregator', '../../services/data-service', '../../resources/elements/notifier/notifier', '../../dialogs/confirm-delete-dialog'], function (exports, _aureliaRouter, _aureliaDialog, _aureliaEventAggregator, _dataService, _notifier, _confirmDeleteDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Home = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Home = exports.Home = (_temp = _class = function () {
    function Home(router, dialogSvc, messageBus, dataSvc, notifier) {
      var _this = this;

      _classCallCheck(this, Home);

      this.database = 'quote-one';
      this.collection = 'quotes';
      this.fallbackSrc = 'static/avatar-default.jpg';
      this.items = [];
      this.origItems = [];

      this.router = router;
      this.dialogSvc = dialogSvc;
      this.messageBus = messageBus;
      this.dataSvc = dataSvc;
      this.notifier = notifier;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    Home.prototype.activate = function activate(params) {
      if (params && params.database && params.userId) {
        this.database = params.database;
        this.userid = params.userId;
      }
      return this.getResources();
    };

    Home.prototype.getResources = function getResources() {
      var _this2 = this;

      return Promise.all([this.dataSvc.findAll(this.database, "quotes", null, { name: 1 })]).then(function (values) {
        _this2.items = values[0];
      }).catch(function (error) {
        console.error(error);
      });
    };

    Home.prototype.launchDeleteDlg = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee($index, row) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                model = {
                  header: "Confirm Delete",
                  prompt: 'Are you sure you want to delete this record?'
                };
                options = { viewModel: _confirmDeleteDialog.ConfirmDeleteDialog, model: model };
                _context.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context.sent;

                if (!closeResult.wasCancelled) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt('return');

              case 7:
                _context.next = 9;
                return this.dataSvc.deleteOne(this.database, this.collection, row._id.$oid);

              case 9:
                this.items.splice($index, 1);
                this.notifier.growl({ message: "Delete complete!" });

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function launchDeleteDlg(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return launchDeleteDlg;
    }();

    Home.prototype.newRecord = function newRecord() {
      var recordid = 'new';

      this.router.navigate('individual-quote/' + recordid);
    };

    Home.prototype.loadRecord = function loadRecord($index, item) {
      var recordid = item._id.$oid;
      this.router.navigate('quote/' + recordid);
    };

    return Home;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaDialog.DialogService, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('views/home/home.html!text', ['module'], function(module) { module.exports = "<template><section class=\"view-section flex-column full-height au-animate drag-container drag-item\"><header class=\"flex flex-none frontendcreator-header\"><div class=\"flex-row-1 align-items-center\"><span class=\"app-title margin-left-10\">QuoteOne - Home</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"><button class=\"btn btn-black flat\" click.delegate=newRecord()><i class=\"fa fa-plus\"></i>New</button></div></header><main class=\"flex-column-1 margin-15\"><div class=\"flex-1 table-response\"><table class=\"table-condensed table quote-table\"><thead><tr><th class=\"\">Insured Name</th><th class=\"\">Status</th><th class=\"\">Date</th><th class=\"\">Entered By</th><th class=\"\">Type</th><th class=\"\">Modified By</th><th class=\"\">Actions</th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\">${row.InsuredFirstName1 + ' ' + row.InsuredLastName1}</td><td class=\"\"><span class=margin-right-5><i class=\"fa fa-${row.QuoteStatus === 'kill quote' ? 'window-close' : row.QuoteStatus === 'work quote' ? 'briefcase' : row.QuoteStatus === 'agent completed' ? 'check' : row.QuoteStatus === 'auto completed' ? 'check' : row.QuoteStatus === 'auto failed' ? 'exclamation' : 'circle'} ${row.QuoteStatus === 'new' ? 'quote-new' : row.QuoteStatus === 'work quote' ? 'quote-work-quote' : row.QuoteStatus === 'ready to quote' ? 'quote-ready-to-quote' : row.QuoteStatus === 'pending' ? 'quote-pending' : row.QuoteStatus === 'stalled' ? 'quote-stalled' : row.QuoteStatus === 'kill quote' ? 'quote-kill-quote' : row.QuoteStatus === 'agent completed' ? 'quote-agent-completed' : row.QuoteStatus === 'auto completed' ? 'quote-auto-completed' : row.QuoteStatus === 'auto failed' ? 'quote-auto-failed' : '' }\"></i></span>${row.QuoteStatus}</td><td class=\"\">${row.TransactionRequestDt}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.EnteredBy} </td><td class=\"\">${row.InsuranceType}</td><td class=\"\"><img class=\"border-radius-15 margin-right-5\" src=\"${u.avatar || fallbackSrc}?s=64\" alt=exmg width=32 height=32> ${row.ModifiedBy} </td><td class=\"\"><div class=\"xcol-xs-3 align-bottom\"><button show.bind=\"row.QuoteStatus === 'auto completed' || row.QuoteStatus === 'agent completed'\" class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-clone\"></span></button><button show.bind=\"row.QuoteStatus !== 'auto completed' && row.QuoteStatus !== 'agent completed'\" class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-pencil\"></span></button><button class=\"btn btn-danger btn-sm\" click.delegate=\"launchDeleteDlg($index, row)\" style=margin-bottom:-3px><i class=\"fa fa-trash-o\"></i></button></div></td></tr></tbody></table></div><div class=\"flex-none text-center\"></div></main></section></template>"; });
define('views/customers/customers',['exports', 'aurelia-router', 'aurelia-dialog', 'aurelia-event-aggregator', '../../services/data-service', '../../resources/elements/notifier/notifier', '../../dialogs/confirm-delete-dialog'], function (exports, _aureliaRouter, _aureliaDialog, _aureliaEventAggregator, _dataService, _notifier, _confirmDeleteDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Customers = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Customers = exports.Customers = (_temp = _class = function () {
    function Customers(router, dialogService, messageBus, dataService, notifier) {
      var _this = this;

      _classCallCheck(this, Customers);

      this.database = 'quote-one';
      this.fallbackSrc = 'static/avatar-default.jpg';
      this.items = [];
      this.origItems = [];

      this.router = router;
      this.dialogService = dialogService;
      this.messageBus = messageBus;
      this.dataService = dataService;
      this.notifier = notifier;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    Customers.prototype.activate = function activate(params) {
      if (params && params.database && params.userId) {
        this.database = params.database;
        this.userid = params.userId;
      }
      return this.getResources();
    };

    Customers.prototype.getResources = function getResources() {
      var _this2 = this;

      return Promise.all([this.dataService.findAll(this.database, "customers", null, { name: 1 })]).then(function (values) {
        _this2.origItems = values[0];
      }).catch(function (error) {
        console.error(error);
      });
    };

    Customers.prototype.launchDeleteDlg = function launchDeleteDlg($index, item) {
      var _this3 = this;

      var model = {
        header: "Confirm Delete",
        prompt: 'Are you sure you want to delete this record?'
      };
      this.dialogService.open({
        viewModel: _confirmDeleteDialog.ConfirmDeleteDialog, model: model, lock: false
      }).whenClosed(function (response) {
        if (!response.wasCancelled) {
          _this3.dataService.deleteOne('quote-one', 'customers', item._id.$oid).then(function (response) {
            _this3.items.splice($index, 1);
            _this3.notifier.growl({
              type: 'success', message: 'Record deleted successfully!'
            });
          });
        } else {
          console.log('delete cancelled');
        }
      });
    };

    Customers.prototype.newRecord = function newRecord() {
      var recordid = 'new';
      this.router.navigate('customers/' + recordid);
    };

    Customers.prototype.loadRecord = function loadRecord($index, item) {
      var recordid = item._id.$oid;
      this.router.navigate('customers/' + recordid);
    };

    return Customers;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaDialog.DialogService, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('views/customers/customers.html!text', ['module'], function(module) { module.exports = "<template><section class=\"view-section flex-column full-height au-animate drag-container drag-item\"><header class=\"flex flex-none frontendcreator-header\"><div class=\"flex-row-1 align-items-center\"><span class=\"app-title margin-left-10\">QuoteOne - Home</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"><button class=\"btn btn-primary flat\" click.delegate=newRecord()><i class=\"fa fa-plus\"></i>New</button></div></header><main class=\"flex-column-1 margin-15\"><div class=\"flex-1 table-response\"><table class=\"table-condensed table quote-table\"><thead><tr><th class=\"\">First Name</th><th class=\"\">Last Name</th><th class=\"\">Email</th><th class=\"\">Home Phone</th><th class=\"\">Street</th><th class=\"\">City</th><th class=\"\">State</th><th class=\"\">Status</th><th class=\"\">Actions</th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\">${row.first_name}</td><td class=\"\">${row.last_name}</td><td class=\"\">${row.contact.email}</td><td class=\"\">${row.contact.home_number}</td><td class=\"\">${row.address.street}</td><td class=\"\">${row.address.city}</td><td class=\"\">${row.address.state}</td><td class=\"\"><span class=margin-right-5><i class=\"fa fa-circle ${row.is_active ? 'record-active' : 'record-inactive'}\"></i></span>${row.is_active ? 'Active' : 'Inactive'}</td><td class=\"\"><div class=\"xcol-xs-3 align-bottom\"><button class=\"btn btn-primary btn-sm\" click.delegate=\"loadRecord($index, row)\" style=margin-bottom:-3px><span class=\"fa fa-pencil\"></span></button><button class=\"btn btn-danger btn-sm\" click.delegate=\"launchDeleteDlg($index, row)\" style=margin-bottom:-3px><i class=\"fa fa-trash-o\"></i></button></div></td></tr></tbody></table></div><div class=\"flex-none text-center\"><data-pager items.bind=origItems></data-pager></div></main></section></template>"; });
define('views/customers/customer',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-templating-resources', 'aurelia-dialog', '../../services/session-service', '../../services/data-service', '../../resources/elements/notifier/notifier', '../../dialogs/address-dialog', '../../dialogs/confirm-delete-dialog', '../../dialogs/submit-dialog', '../../dialogs/lookup-dialog', '../../dialogs/member-dialog', '../../dialogs/vehicle-dialog', '../../dialogs/note-dialog', 'moment'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaTemplatingResources, _aureliaDialog, _sessionService, _dataService, _notifier, _addressDialog, _confirmDeleteDialog, _submitDialog, _lookupDialog, _memberDialog, _vehicleDialog, _noteDialog, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Customer = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  var _dec, _desc, _value, _class, _class2, _temp;

  var Customer = exports.Customer = (_dec = (0, _aureliaFramework.computedFrom)('currentItem.first_name', 'currentItem.middle_name', 'currentItem.last_name', 'currentItem.birth_date', 'currentItem.gender', 'currentItem.social_security_number', 'currentItem.marital_status', 'currentItem.address.street', 'currentItem.address.city', 'currentItem.address.state', 'currentItem.address.postal_code', 'currentItem.address.county', 'currentItem.address.home_owner', 'currentItem.contact.email', 'currentItem.contact.home_number', 'currentItem.contact.mobile_number', 'currentItem.contact.preferred_contact_method', 'currentItem.driver.license_status', 'currentItem.driver.license_number', 'currentItem.driver.license_state', 'currentItem.driver.license_date', 'currentItem.driver.license_years_experience', 'currentItem.driver.relationship_to_customer', 'currentItem.driver.driver_type', 'currentItem.driver.military_student_type', 'currentItem.driver.military_paygrade', 'currentItem.household_members', 'currentItem.household_vehicles', 'currentItem.notes'), (_class = (_temp = _class2 = function () {
    function Customer(router, signaler, dialogSvc, sessionSvc, dataSvc, notifier) {
      _classCallCheck(this, Customer);

      this.database = 'quote-one';

      this.router = router;
      this.signaler = signaler;
      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
      this.dataSvc = dataSvc;
      this.notifier = notifier;

      console.debug('customer:ctor - sessionSvc.user', sessionSvc);
      console.debug('customer:ctor - dataSvc');
      this.user = sessionSvc.user;
    }

    Customer.prototype.activate = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(params) {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (params.recordid) {
                  this.recordid = params.recordid;
                }
                this.heading = 'QuoteOne';
                _context.next = 4;
                return this.getResources();

              case 4:
                if (!(this.recordid === 'new')) {
                  _context.next = 8;
                  break;
                }

                this.currentItem = this.newCustomer();
                this.origItem = JSON.parse(JSON.stringify(this.currentItem));
                return _context.abrupt('return');

              case 8:
                _context.next = 10;
                return this.dataSvc.findById(this.database, 'customers', this.recordid);

              case 10:
                response = _context.sent;

                this.currentItem = response;
                this.origItem = JSON.parse(JSON.stringify(this.currentItem));

              case 13:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function activate(_x) {
        return _ref.apply(this, arguments);
      }

      return activate;
    }();

    Customer.prototype.deactivate = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.hasChanged) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return this.save(true);

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deactivate() {
        return _ref2.apply(this, arguments);
      }

      return deactivate;
    }();

    Customer.prototype.attached = function attached() {
      var _this = this;

      this.saveInterval = setInterval(_asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!_this.hasChanged) {
                  _context3.next = 4;
                  break;
                }

                _this.notifier.growl({ message: "Auto-saving..." });
                _context3.next = 4;
                return _this.save(true);

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this);
      })), 15000);
    };

    Customer.prototype.detached = function detached() {
      clearInterval(this.saveInterval);
    };

    Customer.prototype.isEqual = function isEqual(oldValue, newValue) {
      return JSON.stringify(oldValue) === JSON.stringify(newValue);
    };

    Customer.prototype.newCustomer = function newCustomer() {
      var d = Date.now();
      var record = {
        first_name: '',
        middle_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        social_security_number: '',
        marital_status: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          county: '',
          home_owner: ''
        },
        contact: {
          email: '',
          home_number: '',
          mobile_number: '',
          preferred_contact_method: ''
        },
        driver: {
          license_status: '',
          license_number: '',
          license_state: '',
          license_date: '',
          license_years_experience: '',
          relationship_to_customer: '',
          driver_type: '',
          military_student_type: '',
          military_paygrade: ''
        },
        household_members: [],
        household_vehicles: [],
        notes: [],
        images: [],
        created_date: d,
        created_by: this.user.username,
        modified_date: d,
        modified_by: this.user.username,
        is_active: true
      };
      return record;
    };

    Customer.prototype.getResources = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var values;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all([this.dataSvc.findAll(this.database, "lookups")]);

              case 2:
                values = _context4.sent;

                this.lookups = values[0];
                console.debug('quote:getResources - lookupDialog', this.lookupDialog);

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getResources() {
        return _ref4.apply(this, arguments);
      }

      return getResources;
    }();

    Customer.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    Customer.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    Customer.prototype.launchAddressDlg = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                model = {
                  header: "Address",
                  close: "Close",
                  data: this.currentItem.address
                };
                options = { viewModel: _addressDialog.AddressDialog, model: model };
                _context5.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context5.sent;

                if (!closeResult.wasCancelled) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt('return');

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function launchAddressDlg() {
        return _ref5.apply(this, arguments);
      }

      return launchAddressDlg;
    }();

    Customer.prototype.launchMemberDlg = function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(index, record) {
        var isNew, model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                isNew = false;

                if (!record) {
                  record = this.newHouseholdMember();
                  isNew = true;
                }
                model = {
                  header: "Member",
                  close: "Close",
                  data: record,
                  lookups: this.lookups
                };
                options = { viewModel: _memberDialog.MemberDialog, model: model };
                _context6.next = 6;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 6:
                closeResult = _context6.sent;

                if (!closeResult.wasCancelled) {
                  _context6.next = 9;
                  break;
                }

                return _context6.abrupt('return');

              case 9:
                record = closeResult.output;
                if (isNew) {
                  this.addHouseholdMember(record);
                } else {
                  this.currentItem.household_members[index] = record;
                }
                this.notifier.growl({ message: "Auto-saving..." });
                _context6.next = 14;
                return this.save(true);

              case 14:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function launchMemberDlg(_x2, _x3) {
        return _ref6.apply(this, arguments);
      }

      return launchMemberDlg;
    }();

    Customer.prototype.launchVehicleDlg = function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(index, record) {
        var isNew, model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                isNew = false;

                if (!record) {
                  record = this.newHouseholdVehicle();
                  isNew = true;
                }
                model = {
                  header: "Vehicle",
                  close: "Close",
                  data: record,
                  lookups: this.lookups
                };
                options = { viewModel: _vehicleDialog.VehicleDialog, model: model };
                _context7.next = 6;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 6:
                closeResult = _context7.sent;

                if (!closeResult.wasCancelled) {
                  _context7.next = 9;
                  break;
                }

                return _context7.abrupt('return');

              case 9:
                record = closeResult.output;
                if (isNew) {
                  this.addHouseholdVehicle(record);
                } else {
                  this.currentItem.household_vehicles[index] = record;
                }
                this.notifier.growl({ message: "Auto-saving..." });
                _context7.next = 14;
                return this.save(true);

              case 14:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function launchVehicleDlg(_x4, _x5) {
        return _ref7.apply(this, arguments);
      }

      return launchVehicleDlg;
    }();

    Customer.prototype.launchNoteDlg = function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(index, record) {
        var isNew, model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                isNew = false;

                if (!record) {
                  record = this.newNote();
                  isNew = true;
                }
                model = {
                  header: "Customer Note",
                  close: "Close",
                  data: record,
                  lookups: this.lookups,
                  isNew: isNew
                };
                options = { viewModel: _noteDialog.NoteDialog, model: model };
                _context8.next = 6;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 6:
                closeResult = _context8.sent;

                if (!closeResult.wasCancelled) {
                  _context8.next = 9;
                  break;
                }

                return _context8.abrupt('return');

              case 9:
                record = closeResult.output;

                if (!isNew) {
                  _context8.next = 15;
                  break;
                }

                this.addNote(record);
                this.notifier.growl({ message: "Auto-saving..." });
                _context8.next = 15;
                return this.save(true);

              case 15:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function launchNoteDlg(_x6, _x7) {
        return _ref8.apply(this, arguments);
      }

      return launchNoteDlg;
    }();

    Customer.prototype.selectChange = function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context9.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context9.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context9.sent;
                _context9.next = 9;
                break;

              case 8:
                return _context9.abrupt('return', true);

              case 9:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function selectChange(_x8, _x9, _x10) {
        return _ref9.apply(this, arguments);
      }

      return selectChange;
    }();

    Customer.prototype.setValue = function setValue(e, src, srcField, targetField) {
      var source = this[src];
      var sField = source[srcField];
      source[targetField] = sField;
    };

    Customer.prototype.disabled = function disabled(value) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !args.includes(value);
    };

    Customer.prototype.newHouseholdVehicle = function newHouseholdVehicle() {
      var d = Date.now();
      var record = {
        vin: '',
        year: '',
        make: '',
        model: '',
        description: '',
        custom_equipment_type: '',
        additional_electronic_type: '',
        vehicle_use_code: '',
        vehicle_symbol_code: '',
        airbag_type: '',
        created_date: d,
        created_by: this.user.username,
        modified_date: d,
        modified_by: this.user.username,
        is_active: true
      };
      return record;
    };

    Customer.prototype.addHouseholdVehicle = function addHouseholdVehicle(record) {
      this.currentItem.household_vehicles.push(record);
      this.signaler.signal('update-vehicles');
    };

    Customer.prototype.removeHouseholdVehicle = function removeHouseholdVehicle(record, index) {
      this.currentItem.household_vehicles.splice(index, 1);
      this.signaler.signal('update-vehicles');
    };

    Customer.prototype.newHouseholdMember = function newHouseholdMember() {
      var d = Date.now();
      var record = {
        first_name: '',
        middle_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        social_security_number: '',
        marital_status: '',
        driver: {
          license_status: '',
          license_number: '',
          license_state: '',
          license_date: '',
          license_years_experience: '',
          relationship_to_customer: '',
          driver_type: '',
          military_student_type: '',
          military_paygrade: ''
        },
        created_date: d,
        created_by: this.user.username,
        modified_date: d,
        modified_by: this.user.username,
        is_active: true
      };
      return record;
    };

    Customer.prototype.addHouseholdMember = function addHouseholdMember(record) {
      this.currentItem.household_members.push(record);
      this.signaler.signal('update-members');
    };

    Customer.prototype.removeHouseholdMember = function removeHouseholdMember(record, index) {
      this.currentItem.household_members.splice(index, 1);
    };

    Customer.prototype.newNote = function newNote() {
      var d = Date.now();
      var record = {
        note: '',
        created_date: d,
        created_by: this.user.username,
        modified_date: d,
        modified_by: this.user.username,
        is_active: true
      };
      return record;
    };

    Customer.prototype.addNote = function addNote(record) {
      this.currentItem.notes.push(record);
      this.signaler.signal('update-notes');
    };

    Customer.prototype.save = function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(ignoreNav) {
        var response, view;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this.currentItem.is_active = true;
                _context10.next = 3;
                return this.dataSvc.save("quote-one", "customers", this.currentItem);

              case 3:
                response = _context10.sent;

                if (response.message) {
                  if (response.message.includes("Unique index constraint violated")) {
                    this.notifier.growl({
                      type: "error", message: "this name has already been taken. The name must be unique!", showClose: true, timeout: 10000
                    });
                  } else {
                    this.notifier.growl({
                      type: "error", message: response.message, showClose: true, timeout: 10000
                    });
                  }
                } else {
                  view = "customers";

                  this.notifier.growl({ message: "Save complete!" });
                  this.origItem = JSON.parse(JSON.stringify(this.currentItem));
                  this.signaler.signal('update-binding');
                  if (!ignoreNav) {
                    this.router.navigateToRoute(view);
                  }
                }

              case 5:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function save(_x11) {
        return _ref10.apply(this, arguments);
      }

      return save;
    }();

    Customer.prototype.licenseDateChange = function licenseDateChange(e, driver) {
      var date = new Date(driver.license_date);
      driver.license_years_experience = this.calculateAge(date);
    };

    Customer.prototype.calculateAge = function calculateAge(date) {
      var birthYear = date.getFullYear();
      var birthMonth = date.getMonth();
      var birthDay = date.getDate();
      var todayDate = new Date();
      var todayYear = todayDate.getFullYear();
      var todayMonth = todayDate.getMonth();
      var todayDay = todayDate.getDate();
      var age = todayYear - birthYear;
      if (todayMonth < birthMonth - 1) {
        age--;
      }
      if (birthMonth - 1 == todayMonth && todayDay < birthDay) {
        age--;
      }
      return age;
    };

    Customer.prototype.manageImages = function manageImages() {
      this.router.navigate('quote/' + this.recordid + '/images');
    };

    Customer.prototype.computeDateTime = function computeDateTime(date) {
      var today = (0, _moment2.default)(date).format("MM-DD-YYYY");
      var time = (0, _moment2.default)(date).format("HH:mm");
      var format = today + ' ' + time;
      return format;
    };

    _createClass(Customer, [{
      key: 'hasChanged',
      get: function get() {
        return !this.isEqual(this.origItem, this.currentItem);
      }
    }]);

    return Customer;
  }(), _class2.inject = [_aureliaRouter.Router, _aureliaTemplatingResources.BindingSignaler, _aureliaDialog.DialogService, _sessionService.SessionService, _dataService.DataService, _notifier.Notifier], _temp), (_applyDecoratedDescriptor(_class.prototype, 'hasChanged', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'hasChanged'), _class.prototype)), _class));
});
define('views/customers/customer.html!text', ['module'], function(module) { module.exports = "<template><div class=\"view-section customer-view flex-column full-height\"><header class=\"flex flex-none frontendcreator-header margin-right-15 margin-top-5\"><div class=\"flex-row-1 align-items-center margin-left-15\"><span class=app-title>Customer - ${currentItem.first_name} ${currentItem.last_name} ${hasChanged ? '*' : '' & signal:'update-binding'}</span></div><div class=\"flex-row-1 justify-content-center\"></div><div class=\"flex-row-1 justify-content-end\"></div></header><main class=\"flex-row-1 overflow-y-auto\"><form class=\"flex-column-1 margin-15\" validator=\"data-context.bind: currentItem; schema.bind: schema;\" data-context=dataContext><personal-info current-item.bind=currentItem lookups.bind=lookups></personal-info><address-info current-item.bind=currentItem.address lookups.bind=lookups></address-info><contact-info current-item.bind=currentItem.contact lookups.bind=lookups></contact-info><driver-info current-item.bind=currentItem.driver lookups.bind=lookups></driver-info><fieldset tag=\"Household Members\" class=\"flex-row-none form-fields\"><legend>Household Members<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" click.delegate=launchMemberDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Member</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>First</th><th>Last</th><th>DOB</th><th>Lic. #</th><th>Lic. Dt</th><th>Lic. State</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.household_members\" click.delegate=\"launchMemberDlg($index, row)\"><td>${row.first_name}</td><td>${row.last_name}</td><td>${row.birth_date}</td><td>${row.driver.license_number}</td><td>${row.driver.license_date}</td><td>${row.driver.license_state}</td></tr></tbody></table></div></fieldset><fieldset tag=\"Household Vehicles\" class=\"flex-row-none form-fields\"><legend>Household Vehicles<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" click.delegate=launchVehicleDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Vehicle</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>VIN</th><th>Year</th><th>Make</th><th>Model</th><th>Description</th><th>Custom Equ.</th><th>Add Elec</th><th>Veh Use</th><th>Actions</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.household_vehicles\" click.delegate=\"launchVehicleDlg($index, row)\"><td>${row.vin}</td><td>${row.year}</td><td>${row.make}</td><td>${row.model}</td><td>${row.description}</td><td>${row.custom_equipment_type}</td><td>${row.additional_electronic_type}</td><td>${row.vehicle_use_code}</td><td></td></tr></tbody></table></div></fieldset><fieldset tag=Notes class=\"flex-row-none form-fields\"><legend>Notes<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" click.delegate=launchNoteDlg()><i class=\"fa fa-plus\"></i><span class=margin-left-5>Add Note</span></button></legend><div class=\"flex-row-none form-fields\"><table class=\"table-condensed table\"><thead class=table-header><tr><th>Created Date</th><th>Note</th><th>Created By</th></tr></thead><tbody><tr repeat.for=\"row of currentItem.notes\" click.delegate=\"launchNoteDlg($index, row)\"><td>${computeDateTime(row.created_date)} </td><td>${row.note} </td><td>${row.created_by} </td></tr></tbody></table></div></fieldset><fieldset tag=Images class=\"flex-row-none form-fields\"><legend>Images<button class=\"btn btn-primary margin-top-10 margin-bottom-10\" click.delegate=manageImages()><i class=\"fa fa-picture-o\"></i><span class=margin-left-5>Manage Images</span></button></legend><div class=\"flex-row-none form-fields\"></div></fieldset></form></main></div></template>"; });
define('views/callback/callback',['exports', '../../services/session-service'], function (exports, _sessionService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Callback = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Callback = exports.Callback = (_temp = _class = function Callback(sessionSvc) {
    _classCallCheck(this, Callback);

    this.sessionSvc = sessionSvc;
    this.sessionSvc.handleAuthentication();
  }, _class.inject = [_sessionService.SessionService], _temp);
});
define('views/callback/callback.html!text', ['module'], function(module) { module.exports = "<template><div class=spinner><div class=bounce1></div><div class=bounce2></div><div class=bounce3></div></div></template>"; });
define('views/access-denied/access-denied',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var AccessDenied = exports.AccessDenied = function AccessDenied() {
    _classCallCheck(this, AccessDenied);

    this.imgUrl = "static/access-denied.jpg";
  };
});
define('views/access-denied/access-denied.html!text', ['module'], function(module) { module.exports = "<template><style>body .navbar{display:none}.absolute-center{margin:auto;position:absolute;top:0;left:0;bottom:0;right:0;width:50%;height:50%;min-width:200px;max-width:700px;padding:40px}</style><img class=absolute-center src.bind=imgUrl></template>"; });
define('services/user-service',['exports', './data-service'], function (exports, _dataService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UserService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var UserService = exports.UserService = (_temp = _class = function () {
    function UserService(dataService) {
      _classCallCheck(this, UserService);

      this.isAuthenticated = false;
      this.user = null;
      this.isAdmin = false;

      this.dataService = dataService;
    }

    UserService.prototype.authenticate = function authenticate(payload) {
      var _this = this;

      var query = { email: payload.email, password: payload.password };
      return this.dataService.findOne('frontendcreator-security', 'users', query).then(function (response) {
        if (response) {
          _this.userid = response._id.$oid;
          _this.isAuthenticated = response && response.email == payload.email ? true : false;
          return {
            email: payload.email,
            isAuthenticated: _this.isAuthenticated
          };
        } else {
          return {
            email: payload.email,
            isAuthenticated: false
          };
        }
      });
    };

    UserService.prototype.authorize = function authorize(email) {
      var _this2 = this;

      var query = { email: email };
      return this.dataService.findOne('frontendcreator-security', 'user-profiles', query).then(function (profile) {
        _this2.profile = JSON.parse(JSON.stringify(profile));
        return profile;
      });
    };

    UserService.prototype.setAvatar = function setAvatar(avatar) {
      this.profile.avatar = avatar;
      this.user.avatar = avatar;
      return this.dataService.save('frontendcreator-security', 'user-profiles', this.profile);
    };

    return UserService;
  }(), _class.inject = [_dataService.DataService], _temp);
});
define('services/session-service',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SessionService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var SessionService = exports.SessionService = (_temp = _class = function () {
    function SessionService(router, messageBus) {
      _classCallCheck(this, SessionService);

      this.auth0 = new auth0.WebAuth({
        domain: 'quote1ins.auth0.com',
        clientID: 'hy9l2I2xghH3f5_eiwGJqiVKEVdhGdce',
        redirectUri: 'https://mattduffield.github.io/quoteone-dev/callback',

        audience: 'https://quote1ins.auth0.com/userinfo',
        responseType: 'token id_token',
        scope: 'openid profile'
      });

      this.router = router;
      this.messageBus = messageBus;

      if (localStorage.getItem('username') && localStorage.getItem('email') && localStorage.getItem('roles')) {
        var username = localStorage.getItem('username');
        var email = localStorage.getItem('email');
        var roles = JSON.parse(localStorage.getItem('roles'));
        this.user = { username: username, email: email, roles: roles };
      }
    }

    SessionService.prototype.login = function login() {
      this.auth0.authorize();
    };

    SessionService.prototype.handleAuthentication = function handleAuthentication() {
      var _this = this;

      this.auth0.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          _this.setSession(authResult);
          _this.router.navigate('');
          _this.messageBus.publish('authChange', { authenticated: true });
        } else if (err) {
          console.log(err);
        }
      });
    };

    SessionService.prototype.setSession = function setSession(authResult) {
      var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
      this.user = {
        username: authResult.idTokenPayload.nickname,
        email: authResult.idTokenPayload.name,
        roles: authResult.idTokenPayload['https://pegramins.com/roles']
      };
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
      localStorage.setItem('username', authResult.idTokenPayload.nickname);
      localStorage.setItem('email', authResult.idTokenPayload.name);
      localStorage.setItem('roles', JSON.stringify(authResult.idTokenPayload['https://pegramins.com/roles']));
    };

    SessionService.prototype.logout = function logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('roles');
      this.user = null;
      this.messageBus.publish('authChange', { authenticated: false });
      var origin = window.location.origin;

      var href = origin + '/quoteone-dev';

      window.location.href = href;
    };

    SessionService.prototype.isAuthenticated = function isAuthenticated() {
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      var isTokenValid = new Date().getTime() < expiresAt;

      if (isTokenValid) {
        var username = localStorage.getItem('username');
        var email = localStorage.getItem('email');
        var roles = JSON.parse(localStorage.getItem('roles'));
        this.user = { username: username, email: email, roles: roles };
      }
      return isTokenValid;
    };

    return SessionService;
  }(), _class.inject = [_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator], _temp);
});
define('services/md5-service',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Md5Service = exports.Md5Service = function () {
    function Md5Service() {
      _classCallCheck(this, Md5Service);
    }

    Md5Service.prototype.md5 = function md5(string) {

      function RotateLeft(lValue, iShiftBits) {
        return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
      }
      function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = lX & 0x80000000;
        lY8 = lY & 0x80000000;
        lX4 = lX & 0x40000000;
        lY4 = lY & 0x40000000;
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
          return lResult ^ 0x80000000 ^ lX8 ^ lY8;
        }
        if (lX4 | lY4) {
          if (lResult & 0x40000000) {
            return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
          } else {
            return lResult ^ 0x40000000 ^ lX8 ^ lY8;
          }
        } else {
          return lResult ^ lX8 ^ lY8;
        }
      }
      function F(x, y, z) {
        return x & y | ~x & z;
      }
      function G(x, y, z) {
        return x & z | y & ~z;
      }
      function H(x, y, z) {
        return x ^ y ^ z;
      }
      function I(x, y, z) {
        return y ^ (x | ~z);
      }
      function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }
      function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }
      function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }
      function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }
      function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
          lWordCount = (lByteCount - lByteCount % 4) / 4;
          lBytePosition = lByteCount % 4 * 8;
          lWordArray[lWordCount] = lWordArray[lWordCount] | string.charCodeAt(lByteCount) << lBytePosition;
          lByteCount++;
        }
        lWordCount = (lByteCount - lByteCount % 4) / 4;
        lBytePosition = lByteCount % 4 * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | 0x80 << lBytePosition;
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
      }
      function WordToHex(lValue) {
        var WordToHexValue = "",
            WordToHexValue_temp = "",
            lByte,
            lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
          lByte = lValue >>> lCount * 8 & 255;
          WordToHexValue_temp = "0" + lByte.toString(16);
          WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
      }
      function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);

          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if (c > 127 && c < 2048) {
            utftext += String.fromCharCode(c >> 6 | 192);
            utftext += String.fromCharCode(c & 63 | 128);
          } else {
            utftext += String.fromCharCode(c >> 12 | 224);
            utftext += String.fromCharCode(c >> 6 & 63 | 128);
            utftext += String.fromCharCode(c & 63 | 128);
          }
        }
        return utftext;
      }
      var x = Array();
      var k, AA, BB, CC, DD, a, b, c, d;
      var S11 = 7,
          S12 = 12,
          S13 = 17,
          S14 = 22;
      var S21 = 5,
          S22 = 9,
          S23 = 14,
          S24 = 20;
      var S31 = 4,
          S32 = 11,
          S33 = 16,
          S34 = 23;
      var S41 = 6,
          S42 = 10,
          S43 = 15,
          S44 = 21;

      string = Utf8Encode(string);

      x = ConvertToWordArray(string);

      a = 0x67452301;b = 0xEFCDAB89;c = 0x98BADCFE;d = 0x10325476;

      for (k = 0; k < x.length; k += 16) {
        AA = a;BB = b;CC = c;DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
      }
      var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

      return temp.toLowerCase();
    };

    return Md5Service;
  }();
});
define('services/google-address-service',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var GoogleAddressService = exports.GoogleAddressService = function () {
    function GoogleAddressService() {
      _classCallCheck(this, GoogleAddressService);

      this.isLoaded = false;
      this.apiKey = 'AIzaSyDGp2JvL__cn0kHG1U-B4grxuJmwTktqqA';
    }

    GoogleAddressService.prototype.unload = function unload() {
      console.log('unloading listener...');
      if (this.autocomplete) {
        console.log('GoogleAddressService:unload - autocomplete', this.autocomplete);
      }
    };

    GoogleAddressService.prototype.loadJS = function loadJS(url, callback, target) {
      var scriptTag = document.createElement('script');
      scriptTag.id = 'google_places';
      scriptTag.src = url;
      scriptTag.onload = callback;
      target.appendChild(scriptTag);
    };

    GoogleAddressService.prototype.init = function init(inputSelector, data) {
      var el = document.querySelector('#google_places');
      this.isLoaded = el ? true : false;
      this.inputSelector = inputSelector;
      this.inputElement = document.querySelector(this.inputSelector);
      this.data = data;
      if (this.isLoaded) {
        this.loadCallback();
      } else {
        this.loadJS('https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&libraries=places', this.loadCallback.bind(this), document.body);
      }
    };

    GoogleAddressService.prototype.loadCallback = function loadCallback(e) {
      this.autocomplete = new google.maps.places.Autocomplete(this.inputElement, { types: ['geocode'] });

      this.autocomplete.addListener('place_changed', this.fillInAddress.bind(this));
    };

    GoogleAddressService.prototype.fillInAddress = function fillInAddress() {
      var place = this.autocomplete.getPlace();
      var addr = place.address_components;

      var street_number = addr.find(function (x) {
        return x.types.includes("street_number");
      });
      var route = addr.find(function (x) {
        return x.types.includes("route");
      });
      var locality = addr.find(function (x) {
        return x.types.includes("locality");
      });
      var administrative_area_level_2 = addr.find(function (x) {
        return x.types.includes("administrative_area_level_2");
      });
      var administrative_area_level_1 = addr.find(function (x) {
        return x.types.includes("administrative_area_level_1");
      });
      var postal_code = addr.find(function (x) {
        return x.types.includes("postal_code");
      });
      this.data['street'] = street_number.short_name + ' ' + route.short_name;
      this.data['city'] = '' + locality.short_name;
      this.data['state'] = '' + administrative_area_level_1.short_name;
      this.data['postal_code'] = '' + postal_code.short_name;
      this.data['county'] = '' + administrative_area_level_2.short_name;
    };

    GoogleAddressService.prototype.geolocate = function geolocate() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          });
          this.autocomplete.setBounds(circle.getBounds());
        });
      }
    };

    return GoogleAddressService;
  }();
});
define('services/edmunds-service',['exports', 'aurelia-fetch-client'], function (exports, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.EdmundsService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var EdmundsService = exports.EdmundsService = function () {
    function EdmundsService() {
      _classCallCheck(this, EdmundsService);

      this.http = new _aureliaFetchClient.HttpClient();
      this.baseUrl = 'https://api.edmunds.com/api/vehicle/v2/vins/';

      this.fmt = 'json';

      this.apiKey = 'k6hjmkgm2kym5db894t8nah7';
      this.configureFetch();
    }

    EdmundsService.prototype.configureFetch = function configureFetch() {
      var _this = this;

      this.http.configure(function (config) {
        config.withBaseUrl(_this.baseUrl).withDefaults({
          headers: {
            'Content-Type': 'application/json'
          }
        }).withInterceptor({
          request: function request(_request) {
            console.log('Requesting ' + _request.method + ' ' + _request.url);
            return _request;
          },
          response: function response(_response) {
            console.log('Received ' + _response.status + ' ' + _response.url);
            return _response;
          }
        });
      });
    };

    EdmundsService.prototype.performLookup = function performLookup(vin) {
      return this.http.fetch(vin + '?fmt=' + this.fmt + '&api_key=' + this.apiKey, {
        method: 'get'
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    return EdmundsService;
  }();
});
define('services/discovery-insurance-service',['exports', 'aurelia-fetch-client'], function (exports, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DiscoveryInsuranceService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var DiscoveryInsuranceService = exports.DiscoveryInsuranceService = (_temp = _class = function () {
    function DiscoveryInsuranceService(http) {
      _classCallCheck(this, DiscoveryInsuranceService);

      this.http = http;
      this.baseUrl = 'https://www.dicins.com/JenesisQuoting/JenQuoteServlet';
      this.counter = 0;
      this.initReq();
      this.configureHttp();
      var url = 'https://cdn.rawgit.com/abdmob/x2js/master/xml2json';
      this.loadJS(url, this.onScriptLoaded.bind(this));
    }

    DiscoveryInsuranceService.prototype.loadJS = function loadJS(url, callback) {
      require.config({
        paths: {
          "x2js": url
        },
        callback: callback,
        waitSeconds: 40
      });
    };

    DiscoveryInsuranceService.prototype.onScriptLoaded = function onScriptLoaded(e) {
      var _this = this;

      require(["x2js"], function (X2JS) {
        _this.X2JS = X2JS;
      });
    };

    DiscoveryInsuranceService.prototype.initReq = function initReq() {
      this.req = {
        credentials: {
          CustLoginId: 432,
          CustPswd: 'Testwithme'
        },
        RqUID: '',
        TransactionRequestDt: '',
        TransactionEffectiveDt: ''
      };
    };

    DiscoveryInsuranceService.prototype.configureHttp = function configureHttp() {
      var _this2 = this;

      this.http.configure(function (config) {
        config.withBaseUrl(_this2.baseUrl);
        config.withHeader('Content-Type', 'application/xml');
        config.withInterceptor({
          request: function request(message) {
            return message;
          },
          requestError: function requestError(error) {
            throw error;
          },
          response: function response(message) {
            return message;
          },
          responseError: function responseError(error) {
            throw error;
          }
        });
      });
    };

    DiscoveryInsuranceService.prototype.beginRequest = function beginRequest(data) {
      return this.beginHttpRequest(JSON.parse(data));
    };

    DiscoveryInsuranceService.prototype.beginHttpRequest = function beginHttpRequest(data) {
      var _this3 = this;

      var xml = this.buildAcord2(data.SignonRq, data.InsuranceSvcRq);
      console.log('request', xml);
      return this.http.post('', xml).then(function (response) {
        var x2js = new _this3.X2JS();
        var json = x2js.xml_str2json(response);
        console.log('JSON response', json, 'XML response', response);
        return response;
      });
    };

    DiscoveryInsuranceService.prototype.buildSignonRq = function buildSignonRq(SignonRq) {
      var xml = '\n<SignonRq>\n    <SignonPswd>\n        <SignonRoleCd>Agent</SignonRoleCd>\n        <CustId>\n            <SPName>jenesis.com</SPName>\n            <CustPermId>JEN</CustPermId>\n            <CustLoginId>' + SignonRq.SignonPswd.CustId.CustLoginId + '</CustLoginId>\n        </CustId>\n        <CustPswd>\n            <EncryptionTypeCd>NONE</EncryptionTypeCd>\n            <Pswd>' + SignonRq.SignonPswd.CustPswd.Pswd + '</Pswd>\n        </CustPswd>\n    </SignonPswd>\n    <ClientDt>' + SignonRq.ClientDt + '</ClientDt>\n    <CustLangPref>en-US</CustLangPref>\n    <Producer>\n        <ProducerInfo>\n            <ContractNumber>' + SignonRq.Producer.ProducerInfo.ContractNumber + '</ContractNumber>\n            <ProducerRoleCd>Agency</ProducerRoleCd>\n        </ProducerInfo>\n    </Producer>\n    <ClientApp>\n        <Org>QuoteOne Software</Org>\n        <Name>QuoteOne</Name>\n        <Version>1.0</Version>\n    </ClientApp>\n</SignonRq> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildInsuranceSvcRq = function buildInsuranceSvcRq(InsuranceSvcRq) {
      var xml = '\n<InsuranceSvcRq>\n    <RqUID>' + InsuranceSvcRq.RqUID + '</RqUID> \n    ' + this.buildPersAutoPolicyQuoteIndRq(InsuranceSvcRq.PersAutoPolicyQuoteIndRq) + ' \n</InsuranceSvcRq> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersAutoPolicyQuoteIndRq = function buildPersAutoPolicyQuoteIndRq(PersAutoPolicyQuoteIndRq) {
      var xml = '\n<PersAutoPolicyQuoteInqRq>\n  <RqUID>' + PersAutoPolicyQuoteIndRq.RqUID + '</RqUID>\n  <TransactionRequestDt>' + PersAutoPolicyQuoteIndRq.TransactionRequestDt + '</TransactionRequestDt>\n  <TransactionEffectiveDt>' + PersAutoPolicyQuoteIndRq.TransactionEffectiveDt + '</TransactionEffectiveDt>\n  <CurCd>' + PersAutoPolicyQuoteIndRq.CurCd + '</CurCd> \n  ' + this.buildInsuredOrPrincipal(PersAutoPolicyQuoteIndRq.InsuredOrPrincipal) + ' \n  ' + this.buildPersPolicy(PersAutoPolicyQuoteIndRq.PersPolicy) + ' \n  ' + this.buildPersAutoLineBusiness(PersAutoPolicyQuoteIndRq.PersAutoLineBusiness) + ' \n  ' + this.buildLocation(PersAutoPolicyQuoteIndRq.Location) + ' \n</PersAutoPolicyQuoteInqRq> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildInsuredOrPrincipal = function buildInsuredOrPrincipal(InsuredOrPrincipal) {
      var xml = '\n<InsuredOrPrincipal> \n  ' + this.buildGeneralPartyInfo(InsuredOrPrincipal.GeneralPartyInfo) + ' \n  ' + this.buildInsuredOrPrincipalInfo(InsuredOrPrincipal.InsuredOrPrincipalInfo) + ' \n</InsuredOrPrincipal> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildGeneralPartyInfo = function buildGeneralPartyInfo(GeneralPartyInfo) {
      var xml = '\n<GeneralPartyInfo> \n  ' + this.buildNameInfo(GeneralPartyInfo.NameInfo) + ' \n  ' + this.buildAddr(GeneralPartyInfo.Addr) + ' \n  ' + this.buildCommunications(GeneralPartyInfo.Communications) + ' \n</GeneralPartyInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildNameInfo = function buildNameInfo(NameInfo) {
      var xml = '\n<NameInfo>\n    <PersonName>\n        <Surname>' + NameInfo.PersonName.Surname + '</Surname>\n        <GivenName>' + NameInfo.PersonName.GivenName + '</GivenName>\n    </PersonName>\n    <TaxIdentity>\n        <TaxIdTypeCd />\n        <TaxId /> </TaxIdentity>\n</NameInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildAddr = function buildAddr(Addr) {
      var xml = '\n<Addr>\n    <AddrTypeCd>' + Addr.AddrTypeCd + '</AddrTypeCd>\n    <Addr1>' + Addr.Addr1 + '</Addr1>\n    <City>' + Addr.City + '</City>\n    <StateProvCd>' + Addr.StateProvCd + '</StateProvCd>\n    <PostalCode>' + Addr.PostalCode + '</PostalCode>\n    <County>' + Addr.County + '</County>\n</Addr> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildCommunications = function buildCommunications(Communications) {
      var xml = '\n<Communications> \n  ' + this.buildPhoneInfo(Communications.PhoneInfo) + ' \n  ' + this.buildEmailInfo(Communications.EmailInfo) + ' \n</Communications> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPhoneInfo = function buildPhoneInfo(PhoneInfo) {
      var xml = '';
      PhoneInfo.forEach(function (item) {
        var pi = '\n<PhoneInfo>\n    <PhoneTypeCd>' + item.PhoneTypeCd + '</PhoneTypeCd>\n    <CommunicationUseCd>' + item.CommunicationUseCd + '</CommunicationUseCd>\n    <PhoneNumber>' + item.PhoneNumber + '</PhoneNumber>\n</PhoneInfo> ';
        xml += pi;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildEmailInfo = function buildEmailInfo(EmailInfo) {
      var xml = '\n<EmailInfo>\n    <CommunicationUseCd />\n    <EmailAddr /> </EmailInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildInsuredOrPrincipalInfo = function buildInsuredOrPrincipalInfo(InsuredOrPrincipalInfo) {
      var xml = '\n<InsuredOrPrincipalInfo>\n    <InsuredOrPrincipalRoleCd>' + InsuredOrPrincipalInfo.InsuredOrPrincipalRoleCd + '</InsuredOrPrincipalRoleCd> \n    ' + this.buildPersonInfo(InsuredOrPrincipalInfo.PersonInfo) + ' \n    ' + this.buildPrincipalInfo(InsuredOrPrincipalInfo.PrincipalInfo) + ' \n</InsuredOrPrincipalInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersonInfo = function buildPersonInfo(PersonInfo) {
      var xml = '\n<PersonInfo>\n    <GenderCd>' + PersonInfo.GenderCd + '</GenderCd>\n    <BirthDt>' + PersonInfo.BirthDt + '</BirthDt>\n    <MaritalStatusCd>' + PersonInfo.MaritalStatusCd + '</MaritalStatusCd>\n</PersonInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPrincipalInfo = function buildPrincipalInfo(PrincipalInfo) {
      var xml = '\n<PrincipalInfo>\n    <QuestionAnswer>\n        <QuestionCd>' + PrincipalInfo.QuestionAnswer.QuestionCd + '</QuestionCd>\n        <YesNoCd>' + PrincipalInfo.QuestionAnswer.YesNoCd + '</YesNoCd>\n    </QuestionAnswer>\n</PrincipalInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersPolicy = function buildPersPolicy(PersPolicy) {
      var xml = '\n<PersPolicy>\n    <LOBCd>' + PersPolicy.LOBCd + '</LOBCd> \n    ' + this.buildContractTerm(PersPolicy.ContractTerm) + ' \n    ' + this.buildQuoteInfo(PersPolicy.QuoteInfo) + ' \n    ' + this.buildPersApplicationInfo(PersPolicy.PersApplicationInfo) + ' \n    ' + this.buildDriverVeh(PersPolicy.DriverVeh) + ' \n</PersPolicy> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildContractTerm = function buildContractTerm(ContractTerm) {
      var xml = '\n<ContractTerm>\n    <EffectiveDt>' + ContractTerm.EffectiveDt + '</EffectiveDt>\n    <ExpirationDt>' + ContractTerm.ExpirationDt + '</ExpirationDt> \n    ' + this.buildDurationPeriod(ContractTerm.DurationPeriod) + ' \n</ContractTerm> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildDurationPeriod = function buildDurationPeriod(DurationPeriod) {
      var xml = '\n<DurationPeriod>\n    <NumUnits>' + DurationPeriod.NumUnits + '</NumUnits>\n    <UnitMeasurementCd>' + DurationPeriod.UnitMeasurementCd + '</UnitMeasurementCd>\n</DurationPeriod> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildQuoteInfo = function buildQuoteInfo(QuoteInfo) {
      var xml = '\n<QuoteInfo>\n    <CompanysQuoteNumber>' + QuoteInfo.CompanysQuoteNumber + '</CompanysQuoteNumber>\n</QuoteInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersApplicationInfo = function buildPersApplicationInfo(PersApplicationInfo) {
      var xml = '\n<PersApplicationInfo>\n    <InsuredOrPrincipal />\n    <ResidenceOwnedRentedCd>' + PersApplicationInfo.ResidenceOwnedRentedCd + '</ResidenceOwnedRentedCd>\n</PersApplicationInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildDriverVeh = function buildDriverVeh(DriverVeh) {
      var xml = '';
      DriverVeh.forEach(function (item, index) {
        var dv = '\n<DriverVeh VehRef="veh_' + (index + 1) + '" DriverRef="drv_' + (index + 1) + '">\n    <OwnedVehInd>' + (index + 1) + '</OwnedVehInd>\n</DriverVeh> ';
        xml += dv;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersAutoLineBusiness = function buildPersAutoLineBusiness(PersAutoLineBusiness) {
      var xml = '\n<PersAutoLineBusiness>\n    <LOBCd>' + PersAutoLineBusiness.LOBCd + '</LOBCd> \n    ' + this.buildPersDriver(PersAutoLineBusiness.PersDriver) + ' \n    ' + this.buildPersVeh(PersAutoLineBusiness.PersVeh) + ' \n</PersAutoLineBusiness> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersDriver = function buildPersDriver(PersDriver) {
      var _this4 = this;

      var xml = '';
      PersDriver.forEach(function (item, index) {
        var pd = '\n<PersDriver id="drv_' + (index + 1) + '"> \n  ' + _this4.buildGeneralPartyInfo(item.GeneralPartyInfo) + '\n  <DriverInfo> \n    ' + _this4.buildPersonInfo(item.DriverInfo.PersonInfo) + ' \n    ' + _this4.buildLicense(item.DriverInfo.License) + ' \n  </DriverInfo> \n  ' + _this4.buildPersDriverInfo(item.PersDriverInfo) + ' \n</PersDriver> ';
        xml += pd;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildLicense = function buildLicense(License) {
      var xml = '\n<License>\n  <LicenseTypeCd>' + License.LicenseTypeCd + '</LicenseTypeCd>\n  <LicenseStatusCd>' + License.LicenseStatusCd + '</LicenseStatusCd>\n  <LicensedDt>' + License.LicenseDt + '</LicensedDt>\n  <YearsExperience>' + License.YearsExperience + '</YearsExperience>\n  <LicensePermitNumber>' + License.LicensePermitNumber + '</LicensePermitNumber>\n  <StateProvCd>' + License.StateProvCd + '</StateProvCd>\n</License> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersDriverInfo = function buildPersDriverInfo(PersDriverInfo) {
      var xml = '\n<PersDriverInfo>\n  <DriverRelationshipToApplicantCd>' + PersDriverInfo.DriverRelationshipToApplicantCd + '</DriverRelationshipToApplicantCd>\n  <DriverPoints>' + PersDriverInfo.DriverPoints + '</DriverPoints>\n  <DriverTypeCd>' + PersDriverInfo.DriverTypeCd + '</DriverTypeCd>\n  <GoodStudentCd>' + PersDriverInfo.GoodStudentCd + '</GoodStudentCd>\n</PersDriverInfo> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildPersVeh = function buildPersVeh(PersVeh) {
      var _this5 = this;

      var xml = '';
      PersVeh.forEach(function (item, index) {
        var pv = '\n<PersVeh id="veh_' + (index + 1) + '" LocationRef="gar_' + (index + 1) + '">\n  <Manufacturer>' + item.Manufacturer + '</Manufacturer>\n  <Model>' + item.Model + '</Model>\n  <ModelYear>' + item.ModelYear + '</ModelYear>\n  <VehBodyTypeCd>' + item.VehBodyTypeCd + '</VehBodyTypeCd>\n  <LeasedVehInd>' + item.LeasedVehInd + '</LeasedVehInd>\n  <TerritoryCd />\n  <VehIdentificationNumber>' + item.VehIdentificationNumber + '</VehIdentificationNumber>\n  <VehSymbolCd>' + item.VehSymbolCd + '</VehSymbolCd>\n  <NonOwnedVehInd>' + item.NonOwnedVehInd + '</NonOwnedVehInd>\n  <VehUseCd>' + item.VehUseCd + '</VehUseCd>\n  <AirBagTypeCd>' + item.AirBagTypeCd + '</AirBagTypeCd> \n  ' + _this5.buildCoverage(item.Coverage) + ' \n</PersVeh> ';
        xml += pv;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildCoverage = function buildCoverage(Coverage) {
      var _this6 = this;

      var xml = '';
      Coverage.forEach(function (item, index) {
        var c = '\n<Coverage>\n  <CoverageCd>' + item.CoverageCd + '</CoverageCd>\n  <CoverageDesc>' + (item.CoverageDesc || '') + '</CoverageDesc> \n  ' + _this6.buildDeductible(item) + ' \n  ' + _this6.buildLimit(item.Limit) + ' \n</Coverage> ';
        xml += c;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildDeductible = function buildDeductible(Coverage) {
      var xml = '';
      if (Coverage.Deductible) {
        xml += '\n<Deductible>\n  <FormatInteger>' + Coverage.Deductible.FormatInteger + '</FormatInteger>\n</Deductible>';
      }
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildLimit = function buildLimit(Limit) {
      var xml = '';
      if (!Limit) return xml;
      Limit.forEach(function (item, index) {
        var l = '\n<Limit>\n  <FormatInteger>' + item.FormatInteger + '</FormatInteger>';
        if (item.LimitAppliesToCd) {
          l += '\n  <LimitAppliesToCd>' + item.LimitAppliesToCd + '</LimitAppliesToCd>';
        }
        l += ' </Limit>';
        xml += l;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildLocation = function buildLocation(Location) {
      var _this7 = this;

      var xml = '';
      Location.forEach(function (item, index) {
        var l = '\n<Location id="gar_' + (index + 1) + '">\n  <ItemIdInfo /> ' + _this7.buildAddr(item.Addr) + ' </Location> ';
        xml += l;
      });
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildAcord2 = function buildAcord2(signonRq, insuranceSvcRq) {
      console.log('buildAcord2', signonRq, insuranceSvcRq);
      var xml = '\n<?xml version="1.0" encoding="UTF-8"?>\n<!--XML file generated by FCS Acord Ver.1.11-->\n<ACORD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.ACORD.org/standards/PC_Surety/ACORD1.11.0/xml/acord-pcs-v1_11_0-ns-nodoc-codes.xsd">\n  ' + this.buildSignonRq(signonRq) + '\n  ' + this.buildInsuranceSvcRq(insuranceSvcRq) + '\n</ACORD> ';
      return xml.trim();
    };

    DiscoveryInsuranceService.prototype.buildAcord = function buildAcord() {
      var xml = '\n<?xml version="1.0" encoding="UTF-8"?>\n<!--XML file generated by FCS Acord Ver.1.11-->\n<ACORD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.ACORD.org/standards/PC_Surety/ACORD1.11.0/xml/acord-pcs-v1_11_0-ns-nodoc-codes.xsd">\n  <SignonRq>\n    <SignonPswd>\n      <SignonRoleCd>Agent</SignonRoleCd>\n      <CustId>\n        <SPName>jenesis.com</SPName>\n        <CustPermId>JEN</CustPermId>\n        <CustLoginId>' + this.req.credentials.CustLoginId + '</CustLoginId>\n      </CustId>\n      <CustPswd>\n        <EncryptionTypeCd>NONE</EncryptionTypeCd>\n        <Pswd>' + this.req.credentials.CustPswd + '</Pswd>\n      </CustPswd>\n    </SignonPswd>\n    <ClientDt>' + this.req.TransactionRequestDt + '</ClientDt>\n    <CustLangPref>en-US</CustLangPref>\n    <Producer>\n      <ProducerInfo>\n        <ContractNumber>' + this.req.credentials.CustLoginId + '</ContractNumber>\n        <ProducerRoleCd>Agency</ProducerRoleCd>\n      </ProducerInfo>\n    </Producer>\n    <ClientApp>\n      <Org>Jenesis Software</Org>\n      <Name>Jenesis RTR</Name>\n      <Version>1.0</Version>\n    </ClientApp>\n  </SignonRq>\n  <InsuranceSvcRq>\n    <RqUID>20161128-001</RqUID>\n    <PersAutoPolicyQuoteInqRq>\n      <RqUID>20161128-001</RqUID>\n      <TransactionRequestDt>' + this.req.TransactionRequestDt + '</TransactionRequestDt>\n      <TransactionEffectiveDt>' + this.req.TransactionEffectiveDt + '</TransactionEffectiveDt>\n      <CurCd>USD</CurCd>\n      <InsuredOrPrincipal>\n        <GeneralPartyInfo>\n          <NameInfo>\n            <PersonName>\n              <Surname>Turner</Surname>\n              <GivenName>Pamela</GivenName>\n            </PersonName>\n            <TaxIdentity>\n              <TaxIdTypeCd />\n              <TaxId /> \n            </TaxIdentity>\n          </NameInfo>\n          <Addr>\n            <AddrTypeCd>StreetAddress</AddrTypeCd>\n            <Addr1>2552 Forrest Drive</Addr1>\n            <City>Kinston</City>\n            <StateProvCd>NC</StateProvCd>\n            <PostalCode>28504</PostalCode>\n            <County>Lenoir</County>\n          </Addr>\n          <Communications>\n            <PhoneInfo>\n              <PhoneTypeCd>Phone</PhoneTypeCd>\n              <CommunicationUseCd>Home</CommunicationUseCd>\n              <PhoneNumber>252-5231200</PhoneNumber>\n            </PhoneInfo>\n            <PhoneInfo>\n              <PhoneTypeCd>Cell</PhoneTypeCd>\n              <CommunicationUseCd />\n              <PhoneNumber /> \n            </PhoneInfo>\n            <EmailInfo>\n              <CommunicationUseCd />\n              <EmailAddr /> \n            </EmailInfo>\n          </Communications>\n        </GeneralPartyInfo>\n        <InsuredOrPrincipalInfo>\n          <InsuredOrPrincipalRoleCd>Insured</InsuredOrPrincipalRoleCd>\n          <PersonInfo>\n            <GenderCd>F</GenderCd>\n            <BirthDt>1963-05-21</BirthDt>\n            <MaritalStatusCd>M</MaritalStatusCd>\n          </PersonInfo>\n          <PrincipalInfo>\n            <QuestionAnswer>\n              <QuestionCd>Credit</QuestionCd>\n              <YesNoCd>NO</YesNoCd>\n            </QuestionAnswer>\n          </PrincipalInfo>\n        </InsuredOrPrincipalInfo>\n      </InsuredOrPrincipal>\n      <PersPolicy>\n        <LOBCd>AUTO</LOBCd>\n        <ContractTerm>\n          <EffectiveDt>2016-12-15</EffectiveDt>\n          <ExpirationDt>2017-06-15</ExpirationDt>\n          <DurationPeriod>\n            <NumUnits>6</NumUnits>\n            <UnitMeasurementCd>MON</UnitMeasurementCd>\n          </DurationPeriod>\n        </ContractTerm>\n        <QuoteInfo>\n          <CompanysQuoteNumber>541</CompanysQuoteNumber>\n        </QuoteInfo>\n        <PersApplicationInfo>\n          <InsuredOrPrincipal />\n          <ResidenceOwnedRentedCd>OWNED</ResidenceOwnedRentedCd>\n        </PersApplicationInfo>\n        <DriverVeh VehRef="veh_1" DriverRef="drv_1">\n          <OwnedVehInd>1</OwnedVehInd>\n        </DriverVeh>\n        <DriverVeh VehRef="veh_2" DriverRef="drv_2">\n          <OwnedVehInd>1</OwnedVehInd>\n        </DriverVeh>\n      </PersPolicy>\n      <PersAutoLineBusiness>\n        <LOBCd>AUTO</LOBCd>\n        <PersDriver id="drv_1">\n          <GeneralPartyInfo>\n            <NameInfo>\n              <PersonName>\n                <Surname>Turner</Surname>\n                <GivenName>Pamela</GivenName>\n              </PersonName>\n              <TaxIdentity>\n                <TaxIdTypeCd />\n                <TaxId /> \n              </TaxIdentity>\n            </NameInfo>\n            <Addr>\n              <AddrTypeCd>StreetAddress</AddrTypeCd>\n              <Addr1>2552 Forrest Drive</Addr1>\n              <City>Kinston</City>\n              <StateProvCd>NC</StateProvCd>\n              <PostalCode>28504</PostalCode>\n              <County>Lenoir</County>\n            </Addr>\n            <Communications>\n              <PhoneInfo>\n                <PhoneTypeCd>Phone</PhoneTypeCd>\n                <CommunicationUseCd>Home</CommunicationUseCd>\n                <PhoneNumber>252-5231200</PhoneNumber>\n              </PhoneInfo>\n              <PhoneInfo>\n                <PhoneTypeCd>Cell</PhoneTypeCd>\n                <CommunicationUseCd />\n                <PhoneNumber /> \n              </PhoneInfo>\n              <EmailInfo>\n                <CommunicationUseCd />\n                <EmailAddr /> \n              </EmailInfo>\n            </Communications>\n          </GeneralPartyInfo>\n          <DriverInfo>\n            <PersonInfo>\n              <GenderCd>F</GenderCd>\n              <BirthDt>1963-05-21</BirthDt>\n              <MaritalStatusCd>M</MaritalStatusCd>\n            </PersonInfo>\n            <License>\n              <LicenseTypeCd>Driver</LicenseTypeCd>\n              <LicenseStatusCd>Active</LicenseStatusCd>\n              <LicensedDt>1979-12-15</LicensedDt>\n              <YearsExperience>37</YearsExperience>\n              <LicensePermitNumber>6081790</LicensePermitNumber>\n              <StateProvCd>NC</StateProvCd>\n            </License>\n          </DriverInfo>\n          <PersDriverInfo>\n            <DriverRelationshipToApplicantCd>IN</DriverRelationshipToApplicantCd>\n            <DriverPoints>0</DriverPoints>\n            <DriverTypeCd>P</DriverTypeCd>\n            <GoodStudentCd>N</GoodStudentCd>\n          </PersDriverInfo>\n        </PersDriver>\n        <PersDriver id="drv_2">\n          <GeneralPartyInfo>\n            <NameInfo>\n              <PersonName>\n                <Surname>Turner</Surname>\n                <GivenName>Steven</GivenName>\n              </PersonName>\n              <TaxIdentity>\n                <TaxIdTypeCd />\n                <TaxId /> \n              </TaxIdentity>\n            </NameInfo>\n            <Addr>\n              <AddrTypeCd>StreetAddress</AddrTypeCd>\n              <Addr1>2552 Forrest Drive</Addr1>\n              <City>Kinston</City>\n              <StateProvCd>NC</StateProvCd>\n              <PostalCode>28504</PostalCode>\n              <County>Lenoir</County>\n            </Addr>\n            <Communications>\n              <PhoneInfo>\n                <PhoneTypeCd>Phone</PhoneTypeCd>\n                <CommunicationUseCd>Home</CommunicationUseCd>\n                <PhoneNumber>252-5231200</PhoneNumber>\n              </PhoneInfo>\n              <PhoneInfo>\n                <PhoneTypeCd>Cell</PhoneTypeCd>\n                <CommunicationUseCd />\n                <PhoneNumber /> \n              </PhoneInfo>\n              <EmailInfo>\n                <CommunicationUseCd />\n                <EmailAddr /> \n              </EmailInfo>\n            </Communications>\n          </GeneralPartyInfo>\n          <DriverInfo>\n            <PersonInfo>\n              <GenderCd>M</GenderCd>\n              <BirthDt>1962-02-01</BirthDt>\n              <MaritalStatusCd>M</MaritalStatusCd>\n            </PersonInfo>\n            <License>\n              <LicenseTypeCd>Driver</LicenseTypeCd>\n              <LicenseStatusCd>Active</LicenseStatusCd>\n              <LicensedDt>1978-12-15</LicensedDt>\n              <YearsExperience>38</YearsExperience>\n              <LicensePermitNumber>5544712</LicensePermitNumber>\n              <StateProvCd>NC</StateProvCd>\n            </License>\n          </DriverInfo>\n          <PersDriverInfo>\n            <DriverRelationshipToApplicantCd>SP</DriverRelationshipToApplicantCd>\n            <DriverPoints>0</DriverPoints>\n            <DriverTypeCd>P</DriverTypeCd>\n            <GoodStudentCd /> \n          </PersDriverInfo>\n        </PersDriver>\n        <PersVeh id="veh_1" LocationRef="gar_1">\n          <Manufacturer>GMC</Manufacturer>\n          <Model>CANYON EXTENDED CAB SLT</Model>\n          <ModelYear>2010</ModelYear>\n          <VehBodyTypeCd></VehBodyTypeCd>\n          <LeasedVehInd>1</LeasedVehInd>\n          <TerritoryCd />\n          <VehIdentificationNumber>1GTKTFDE0A</VehIdentificationNumber>\n          <VehSymbolCd>14</VehSymbolCd>\n          <NonOwnedVehInd>0</NonOwnedVehInd>\n          <VehUseCd>1B</VehUseCd>\n          <AirBagTypeCd>FrontBoth</AirBagTypeCd>\n          <Coverage>\n            <CoverageCd>BI</CoverageCd>\n            <CoverageDesc>Bodily Injury</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>PD</CoverageCd>\n            <CoverageDesc>Property Damage</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>MEDPM</CoverageCd>\n            <CoverageDesc>Medical</CoverageDesc>\n            <Limit>\n              <FormatInteger>500</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMUIM</CoverageCd>\n            <CoverageDesc>Uninsured Underinsured Motorist-BI</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMPD</CoverageCd>\n            <CoverageDesc>Uninsured Motorist-PD</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>COMP</CoverageCd>\n            <CoverageDesc>Comprehensive</CoverageDesc>\n            <Deductible>\n              <FormatInteger>100</FormatInteger>\n            </Deductible>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>COLL</CoverageCd>\n            <CoverageDesc>Collision</CoverageDesc>\n            <Deductible>\n              <FormatInteger>250</FormatInteger>\n            </Deductible>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>TL</CoverageCd>\n            <Limit>\n              <FormatInteger>25</FormatInteger>\n              <LimitAppliesToCd>PerOcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>RREIM</CoverageCd>\n            <Limit>\n              <FormatInteger>15</FormatInteger>\n            </Limit>\n          </Coverage>\n        </PersVeh>\n        <PersVeh id="veh_2" LocationRef="gar_2">\n          <Manufacturer>CHEV</Manufacturer>\n          <Model>TAHOE LS/LT/Z71</Model>\n          <ModelYear>2004</ModelYear>\n          <VehBodyTypeCd>4D</VehBodyTypeCd>\n          <LeasedVehInd>1</LeasedVehInd>\n          <TerritoryCd />\n          <VehIdentificationNumber>3GN0K13V04</VehIdentificationNumber>\n          <VehSymbolCd>14</VehSymbolCd>\n          <NonOwnedVehInd>0</NonOwnedVehInd>\n          <VehUseCd>1A</VehUseCd>\n          <AirBagTypeCd>FrontBoth</AirBagTypeCd>\n          <Coverage>\n            <CoverageCd>BI</CoverageCd>\n            <CoverageDesc>Bodily Injury</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>PD</CoverageCd>\n            <CoverageDesc>Property Damage</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>MEDPM</CoverageCd>\n            <CoverageDesc>Medical</CoverageDesc>\n            <Limit>\n              <FormatInteger>500</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMUIM</CoverageCd>\n            <CoverageDesc>Uninsured Underinsured Motorist-BI</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMPD</CoverageCd>\n            <CoverageDesc>Uninsured Motorist-PD</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>COMP</CoverageCd>\n            <CoverageDesc>Comprehensive</CoverageDesc>\n            <Deductible>\n              <FormatInteger>250</FormatInteger>\n            </Deductible>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>COLL</CoverageCd>\n            <CoverageDesc>Collision</CoverageDesc>\n            <Deductible>\n              <FormatInteger>250</FormatInteger>\n            </Deductible>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>TL</CoverageCd>\n            <Limit>\n              <FormatInteger>50</FormatInteger>\n              <LimitAppliesToCd>PerOcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>RREIM</CoverageCd>\n            <Limit>\n              <FormatInteger>30</FormatInteger>\n            </Limit>\n          </Coverage>\n        </PersVeh>\n        <PersVeh id="veh_3" LocationRef="gar_3">\n          <Manufacturer>FORD</Manufacturer>\n          <Model>BRONCO</Model>\n          <ModelYear>1995</ModelYear>\n          <VehBodyTypeCd>X4</VehBodyTypeCd>\n          <LeasedVehInd>1</LeasedVehInd>\n          <TerritoryCd />\n          <VehIdentificationNumber>1FM0U15H0S</VehIdentificationNumber>\n          <VehSymbolCd>13</VehSymbolCd>\n          <NonOwnedVehInd>0</NonOwnedVehInd>\n          <VehUseCd>1A</VehUseCd>\n          <AirBagTypeCd>Driver</AirBagTypeCd>\n          <Coverage>\n            <CoverageCd>BI</CoverageCd>\n            <CoverageDesc>Bodily Injury</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>PD</CoverageCd>\n            <CoverageDesc>Property Damage</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>MEDPM</CoverageCd>\n            <CoverageDesc>Medical</CoverageDesc>\n            <Limit>\n              <FormatInteger>500</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMUIM</CoverageCd>\n            <CoverageDesc>Uninsured Underinsured Motorist-BI</CoverageDesc>\n            <Limit>\n              <FormatInteger>100000</FormatInteger>\n              <LimitAppliesToCd>PerPers</LimitAppliesToCd>\n            </Limit>\n            <Limit>\n              <FormatInteger>300000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n          <Coverage>\n            <CoverageCd>UMPD</CoverageCd>\n            <CoverageDesc>Uninsured Motorist-PD</CoverageDesc>\n            <Limit>\n              <FormatInteger>50000</FormatInteger>\n              <LimitAppliesToCd>PerAcc</LimitAppliesToCd>\n            </Limit>\n          </Coverage>\n        </PersVeh>\n      </PersAutoLineBusiness>\n      <Location id="gar_1">\n        <ItemIdInfo />\n        <Addr>\n          <AddrTypeCd>StreetAddress</AddrTypeCd>\n          <Addr1>2552 Forrest Drive</Addr1>\n          <City>Kinston</City>\n          <StateProvCd>NC</StateProvCd>\n          <PostalCode>28504</PostalCode>\n          <County>Lenoir</County>\n        </Addr>\n      </Location>\n      <Location id="gar_2">\n        <ItemIdInfo />\n        <Addr>\n          <AddrTypeCd>StreetAddress</AddrTypeCd>\n          <Addr1>2552 Forrest Drive</Addr1>\n          <City>Kinston</City>\n          <StateProvCd>NC</StateProvCd>\n          <PostalCode>28504</PostalCode>\n          <County>Lenoir</County>\n        </Addr>\n      </Location>\n      <Location id="gar_3">\n        <ItemIdInfo />\n        <Addr>\n          <AddrTypeCd>StreetAddress</AddrTypeCd>\n          <Addr1>2552 Forrest Drive</Addr1>\n          <City>Kinston</City>\n          <StateProvCd>NC</StateProvCd>\n          <PostalCode>28504</PostalCode>\n          <County>Lenoir</County>\n        </Addr>\n      </Location>\n    </PersAutoPolicyQuoteInqRq>\n  </InsuranceSvcRq>\n</ACORD> ';
      return xml.trim();
    };

    return DiscoveryInsuranceService;
  }(), _class.inject = [_aureliaFetchClient.HttpClient], _temp);
});
define('services/discovery-insurance-map',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var DiscoveryInsuranceMap = exports.DiscoveryInsuranceMap = function () {
    function DiscoveryInsuranceMap() {
      _classCallCheck(this, DiscoveryInsuranceMap);

      this.counter = 0;
    }

    DiscoveryInsuranceMap.prototype.mapDataToAcord = function mapDataToAcord(data) {
      this.data = data;
      var dt = new Date().toISOString();
      var mos = Number(data.TermLength);
      var d = new Date(data.TransactionRequestDt);
      var year = d.getFullYear();
      var month = d.getMonth();
      var day = d.getDate();

      var exp = new Date(year, month + mos, day).toISOString();
      this.data.TransactionExpirationDt = exp.substring(0, exp.indexOf('T'));

      this.data.RqUID = '$ {\n            dt.slice(0, 10).replace(/\\-/g, \'\')\n        }\n        -$ {\n            this.counter++\n        }\n        ';
      var driver = data.drivers[0];
      var json = ('{\n      "SignonRq": {\n        "SignonPswd": {\n          "SignonRoleCd":"Agent",\n          "CustId": {\n            "SPName": "jenesis.com", "CustPermId": "JEN", "CustLoginId": "432"\n          },\n          "CustPswd": {\n            "EncryptionTypeCd": "NONE", "Pswd": "Testwithme"\n          }\n        },\n        "ClientDt":"' + data.TransactionRequestDt + '",\n        "CustLangPref":"en-US",\n        "Producer": {\n          "ProducerInfo": {\n            "ContractNumber": "432", "ProducerRoleCd": "Agency"\n          }\n        },\n        "ClientApp": {\n          "Org": "Pegram Insurance", "Name": "QuoteOne", "Version": "1.0"\n        }\n      },\n      "InsuranceSvcRq": {\n        "RqUID":"' + data.RqUID + '",\n        "PersAutoPolicyQuoteIndRq": {\n          "RqUID":"' + data.RqUID + '",\n          "TransactionRequestDt":"' + data.TransactionRequestDt + '",\n          "TransactionEffectiveDt":"' + data.TransactionEffectiveDt + '",\n          "CurCd":"USD",\n          "InsuredOrPrincipal": {\n            "GeneralPartyInfo": {\n              "NameInfo": {\n                "PersonName": {\n                  "Surname":"' + data.InsuredLastName1 + '",\n                  "GivenName":"' + data.InsuredFirstName1 + '"\n                },\n                "TaxIdentity": {\n                  "TaxIdTypeCd": "", "TaxId": ""\n                }\n              },\n              "Addr": {\n                "AddrTypeCd":"StreetAddress",\n                "Addr1":"' + data.Addr1 + '",\n                "City":"' + data.City + '",\n                "StateProvCd":"' + data.StateProvCd + '",\n                "PostalCode":"' + data.PostalCode + '",\n                "County":"' + data.County + '"\n              },\n              "Communications": {\n                "PhoneInfo":[ \n                  {\n                    "PhoneTypeCd":"Phone",\n                    "CommunicationUseCd":"Home",\n                    "PhoneNumber":"' + data.PhoneNumber1 + '"\n                  },\n                  {\n                    "PhoneTypeCd": "Cell", \n                    "CommunicationUseCd": "", \n                    "PhoneNumber": ""\n                  }\n                ],\n                "EmailInfo": {\n                  "CommunicationUseCd": "", \n                  "EmailAddr": ""\n                }\n              }\n            },\n            "InsuredOrPrincipalInfo": {\n              "InsuredOrPrincipalRoleCd":"Insured",\n              "PersonInfo": {\n                "GenderCd":"' + driver.GenderCd + '",\n                "BirthDt":"' + driver.BirthDt + '",\n                "MaritalStatusCd":"' + driver.MaritalStatusCd + '"\n              },\n              "PrincipalInfo": {\n                "QuestionAnswer": {\n                  "QuestionCd": "Credit", \n                  "YesNoCd": "NO"\n                }\n              }\n            }\n          },\n          "PersPolicy": {\n            "LOBCd":"AUTO",\n            "ContractTerm": {\n              "EffectiveDt":"' + data.TransactionEffectiveDt + '",\n              "ExpirationDt":"' + data.TransactionExpirationDt + '",\n              "DurationPeriod": {\n                "NumUnits":"' + data.TermLength + '",\n                "UnitMeasurementCd": "MON"\n              }\n            },\n            "QuoteInfo": {\n              "CompanysQuoteNumber": "541"\n            },\n            "PersApplicationInfo": {\n              "InsuredOrPrincipal":"",\n              "ResidenceOwnedRentedCd":"' + data.HomeOwnerType + '"\n            },\n            "DriverVeh":[ \n              ' + this.getDriverVeh() + '\n            ]\n          },\n          "PersAutoLineBusiness": {\n            "LOBCd":"AUTO",\n            "PersDriver":[ \n              ' + this.getPersDriver() + '\n            ],\n            "PersVeh":[ \n              ' + this.getPersVeh() + '\n            ]\n          },\n          "Location":[ \n            ' + this.getLocation() + '\n          ]\n        }\n      }\n    }').trim();
      var result = null;
      try {
        result = JSON.parse(json);
      } catch (e) {
        console.log('Error mapping to Acord format.', e);
      }
      return json;
    };

    DiscoveryInsuranceMap.prototype.getDriverVeh = function getDriverVeh() {
      var json = '';
      this.data.drivers.forEach(function (item, index) {
        json += (' {\n        "OwnedVehInd":"' + (index + 1) + '", \n        "_VehRef":"veh_' + (index + 1) + '", \n        "_DriverRef":"drv_' + (index + 1) + '"\n      }, ').trim();
      });
      json = json.substring(0, json.length - 1);
      return json;
    };

    DiscoveryInsuranceMap.prototype.getPersDriver = function getPersDriver() {
      var _this = this;

      var json = '';
      this.data.drivers.forEach(function (item, index) {
        json += (' {\n        "GeneralPartyInfo": {\n          "NameInfo": {\n            "PersonName": {\n              "Surname":"' + item.LastName + '", \n              "GivenName":"' + item.FirstName + '"\n            }, \n            "TaxIdentity": {\n              "TaxIdTypeCd": "", \n              "TaxId": ""\n            }\n          }, \n          "Addr": {\n            "AddrTypeCd":"StreetAddress", \n            "Addr1":"' + _this.data.Addr1 + '", \n            "City":"' + _this.data.City + '", \n            "StateProvCd":"' + _this.data.StateProvCd + '", \n            "PostalCode":"' + _this.data.PostalCode + '", \n            "County":"' + _this.data.County + '"\n          }, \n          "Communications": {\n            "PhoneInfo":[ \n              {\n                "PhoneTypeCd":"Phone", \n                "CommunicationUseCd":"Home", \n                "PhoneNumber":"' + _this.data.PhoneNumber1 + '"\n              }, \n              {\n                "PhoneTypeCd":"Cell", \n                "CommunicationUseCd":"Home", \n                "PhoneNumber":"' + (_this.data.PhoneNumber2 || '') + '"\n              }\n            ], \n            "EmailInfo": {\n              "CommunicationUseCd": "", \n              "EmailAddr": ""\n            }\n          }\n        }, \n        "DriverInfo": {\n          "PersonInfo": {\n            "GenderCd":"' + item.GenderCd + '", \n            "BirthDt":"' + item.BirthDt + '", \n            "MaritalStatusCd":"' + item.MaritalStatusCd + '"\n          }, \n          "License": {\n            "LicenseTypeCd":"Driver", \n            "LicenseStatusCd":"' + item.LicenseStatus + '", \n            "LicenseDt":"' + item.LicenseDt + '", \n            "YearsExperience":"' + item.YearsExperience + '", \n            "LicensePermitNumber":"' + item.LicensePermitNumber + '", \n            "StateProvCd":"' + item.StateProvCd + '"\n          }\n        }, \n        "PersDriverInfo": {\n          "DriverRelationshipToApplicantCd":"' + item.DriverRelationshipToApplicantCd + '", \n          "DriverPoints": "0", \n          "DriverTypeCd": "P", \n          "GoodStudentCd": "N"\n        }, \n        "_id":"drv_' + (index + 1) + '"\n      }, ').trim();
      });
      json = json.substring(0, json.length - 1);
      return json;
    };

    DiscoveryInsuranceMap.prototype.getPersVeh = function getPersVeh() {
      var json = '';
      var bi = this.data.BIType.split('/');
      var biPerPers = bi[0].replace(',', '');
      var biPerAcc = bi[1].replace(',', '');
      var pdType = this.data.PDType.replace(',', '');
      var medType = this.data.MedType.replace(',', '');
      var unbi = this.data.UnBIType.split('/');
      var unbiPerPers = unbi[0].replace(',', '');
      var unbiPerAcc = unbi[1].replace(',', '');
      var unpdType = this.data.UnPDType.replace(',', '');
      this.data.vehicles.forEach(function (item, index) {
        var coll = item.Coll.replace(',', '');
        var comp = item.Comp.replace(',', '');
        console.log('comp:coll', comp, coll);
        json += (' {\n        "Manufacturer":"' + item.Manufacturer + '", \n        "Model":"' + item.Model + '", \n        "ModelYear":"' + item.ModelYear + '", \n        "VehBodyTypeCd":"' + item.VehDescription + '", \n        "LeasedVehInd":"1", \n        "TerritoryCd":"", \n        "VehIdentificationNumber":"' + item.VehIdentificationNumber + '", \n        "VehSymbolCd":"' + (item.VehSymCd || 0) + '", \n        "NonOwnedVehInd":"0", \n        "VehUseCd":"' + item.VehUseCd + '", \n        "AirBagTypeCd":"' + item.AirBagType + '", \n        "Coverage":[ \n          {\n            "CoverageCd":"BI", \n            "CoverageDesc":"Bodily Injury", \n            "Limit":[ \n              {\n                "FormatInteger":"' + biPerPers + '", \n                "LimitAppliesToCd": "PerPers"\n              }, \n              {\n                "FormatInteger":"' + biPerAcc + '", \n                "LimitAppliesToCd": "PerAcc"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"PD", \n            "CoverageDesc":"Property Damage", \n            "Limit":[ \n              {\n                "FormatInteger":"' + pdType + '", \n                "LimitAppliesToCd": "PerAcc"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"MEDPM", \n            "CoverageDesc":"Medical Payments", \n            "Limit":[ \n              {\n                "FormatInteger":"' + medType + '", \n                "LimitAppliesToCd": "PerPers"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"UMUIM", \n            "CoverageDesc":"Uninsured Underinsured Motorist-BI", \n            "Limit":[ \n              {\n                "FormatInteger":"' + unbiPerPers + '", \n                "LimitAppliesToCd": "PerPers"\n              }, \n              {\n                "FormatInteger":"' + unbiPerAcc + '", \n                "LimitAppliesToCd": "PerAcc"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"UMPD", \n            "CoverageDesc":"Uninsured Motorist-PD", \n            "Limit":[ \n              {\n                "FormatInteger":"' + unpdType + '", \n                "LimitAppliesToCd": "PerAcc"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"COMP", \n            "CoverageDesc":"Comprehensive", \n            "Deductible": {\n              "FormatInteger":"' + comp + '"\n            }\n          }, \n          {\n            "CoverageCd":"COLL", \n            "CoverageDesc":"Collision", \n            "Deductible": {\n              "FormatInteger":"' + coll + '"\n            }\n          },\n          {\n            "CoverageCd":"TL", \n            "Limit":[ \n              {\n                "FormatInteger": "25", \n                "LimitAppliesToCd": "PerOcc"\n              }\n            ]\n          }, \n          {\n            "CoverageCd":"RREIM", "Limit":[ \n              {\n                "FormatInteger":"' + item.RentalType + '"\n              }\n            ]\n          }\n        ], \n        "_id":"veh_' + (index + 1) + '", \n        "_LocationRef":"gar_' + (index + 1) + '"\n      }, ').trim();
      });
      json = json.substring(0, json.length - 1);
      return json;
    };

    DiscoveryInsuranceMap.prototype.getLocation = function getLocation() {
      var _this2 = this;

      var json = '';
      this.data.vehicles.forEach(function (item, index) {
        json += (' {\n        "ItemIdInfo":"", "Addr": {\n          "AddrTypeCd":"StreetAddress", \n          "Addr1":"' + _this2.data.Addr1 + '", \n          "City":"' + _this2.data.City + '", \n          "StateProvCd":"' + _this2.data.StateProvCd + '", \n          "PostalCode":"' + _this2.data.PostalCode + '", \n          "County":"' + _this2.data.County + '"\n        }\n        , "_id":"gar_' + (index + 1) + '"\n      }, ').trim();
      });
      json = json.substring(0, json.length - 1);
      return json;
    };

    return DiscoveryInsuranceMap;
  }();
});
define('services/data-service',['exports', 'aurelia-fetch-client'], function (exports, _aureliaFetchClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DataService = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var DataService = exports.DataService = function () {
    function DataService() {
      var _this = this;

      _classCallCheck(this, DataService);

      this.url = 'databases/';
      this.baseUrl = 'https://api.mlab.com/api/1/' + this.url;
      this.apiKey = 'apiKey=GDOWW9TNkcG5xZC45XcKXm6gFIjdBWcE';
      this.modal = {
        metaSrc: '',
        metaKey: '',
        dataSrc: '',
        dataKey: '',
        title: ''
      };

      this.http = new _aureliaFetchClient.HttpClient();
      this.http.configure(function (config) {
        config.withBaseUrl(_this.baseUrl).withDefaults({
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'Fetch'
          }
        }).withInterceptor({
          request: function request(_request) {
            return _request;
          },
          response: function response(_response) {
            return _response;
          }
        });
      });
    }

    DataService.prototype.queryByExample = function queryByExample(values) {
      return function (item) {
        var keys = Object.keys(values);
        var answer = true;

        for (var i = 0, len = keys.length; i < len; i++) {
          if (item[keys[i]] !== values[keys[i]]) {
            answer = false;
            break;
          }
        }
        return answer;
      };
    };

    DataService.prototype.findById = function findById(database, collection, id) {
      return this.http.fetch(database + '/collections/' + collection + '/' + id + '?' + this.apiKey).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.findOne = function findOne(database, collection, filter) {
      var query = '?fo=true&';
      if (filter) {
        query = '?q=' + JSON.stringify(filter) + '&fo=true&';
      }
      console.log('data-service:findOne query', query);
      return this.http.fetch(database + '/collections/' + collection + query + this.apiKey).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.findAll = function findAll(database, collection, filter, orderBy) {
      var query = '?';
      var sort = '';
      if (filter) {
        query = '?q=' + JSON.stringify(filter) + '&';
        console.log('filter', query);
      }
      if (orderBy) {
        sort = 's=' + JSON.stringify(orderBy) + '&';
      }
      return this.http.fetch(database + '/collections/' + collection + query + sort + this.apiKey).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.insert = function insert(database, collection, data) {
      return this.http.fetch(database + '/collections/' + collection + '?' + this.apiKey, {
        method: 'post',
        body: (0, _aureliaFetchClient.json)(data)
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.update = function update(database, collection, filter, data) {
      var query = '?';
      if (filter) {
        query = '?q=' + JSON.stringify(filter) + '&';
      }
      return this.http.fetch(database + '/collections/' + collection + query + this.apiKey, {
        method: 'put',
        body: (0, _aureliaFetchClient.json)(data)
      }).then(function (response) {
        return response.json();
      }).then(function (upd) {
        return upd;
      });
    };

    DataService.prototype.deleteOne = function deleteOne(database, collection, id) {
      return this.http.fetch(database + '/collections/' + collection + '/' + id + '?' + this.apiKey, {
        method: 'delete'
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.deleteAll = function deleteAll(database, collection, filter) {
      var query = '?';
      if (filter) {
        query = '?q=' + JSON.stringify(filter) + '&';
      }
      return this.http.fetch(database + '/collections/' + collection + query + this.apiKey, {
        method: 'put',
        body: (0, _aureliaFetchClient.json)([])
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        return data;
      });
    };

    DataService.prototype.save = function save(database, collection, data) {
      if (data._id && data._id.$oid) {
        var filter = { _id: data._id };
        return this.update(database, collection, filter, data);
      } else {
        delete data._id;
        return this.insert(database, collection, data);
      }
    };

    return DataService;
  }();
});
define('security/rule',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Rule = exports.Rule = function () {
    function Rule(options) {
      _classCallCheck(this, Rule);

      this.base_behavior = options.base_behavior;
      this.action = options.action;
      this.subject = options.subject;
      this.conditions = options.conditions;
      this.initialize();
    }

    Rule.prototype.initialize = function initialize() {
      if (!this.actions && this.action) {
        this.actions = _.flatten([this.action]);
      }
      if (!this.subjects && this.subject) {
        this.subjects = _.flatten([this.subject]);
      }
      if (!this.conditions) {
        this.conditions = {};
      }
    };

    Rule.prototype.is_relevant = function is_relevant(action, subject) {
      return this.matches_action(action) && this.matches_subject(subject);
    };

    Rule.prototype.matches_conditions = function matches_conditions(action, subject) {
      if (_.isObject(this.conditions) && !_.isEmpty(this.conditions) && !this.subject_class(subject)) {
        return this.matches_conditions_hash(subject);
      } else {
        return _.isEmpty(this.conditions) ? true : this.base_behavior;
      }
    };

    Rule.prototype.subject_class = function subject_class(subject) {
      return subject.hasOwnProperty("__name");
    };

    Rule.prototype.matches_action = function matches_action(action) {
      return _.includes(this.expanded_actions, "manage") || _.includes(this.expanded_actions, action);
    };

    Rule.prototype.matches_subject = function matches_subject(subject) {
      return _.includes(this.subjects, "all") || _.includes(this.subjects, subject) || this.matches_subject_class(subject);
    };

    Rule.prototype.matches_subject_class = function matches_subject_class(subject) {
      return _.some(this.subjects, function (sub) {
        if (subject.hasOwnProperty("__name")) {
          return subject.__name === sub;
        } else {
          return false;
        }
      });
    };

    Rule.prototype.matches_conditions_hash = function matches_conditions_hash(subject, conditions) {
      if (!conditions) conditions = this.conditions;

      if (_.isEmpty(conditions)) {
        return true;
      } else {
        return _.all(conditions, function (value, name) {
          var attribute = subject[name];
          if (_.isUndefined(attribute)) {
            attribute = subject.get(name);
          }
          if (_.isObject(value) && !_.isArray(value)) {
            if (_.isArray(attribute)) {
              return _.some(attribute, function (element) {
                this.matches_conditions_hash(element, value);
              }, this);
            } else {
              return attribute && this.matches_conditions_hash(attribute, value);
            }
          } else if (_.isArray(value)) {
            return _.includes(value, attribute) || _.isEqual(value, attribute);
          } else {
            return attribute == value;
          }
        }, this);
      }
    };

    return Rule;
  }();
});
define('security/can-can-step',['exports', 'aurelia-framework', 'aurelia-router', './ability', '../services/user-service'], function (exports, _aureliaFramework, _aureliaRouter, _ability, _userService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CanCanStep = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var CanCanStep = exports.CanCanStep = (_temp = _class = function () {
    function CanCanStep(aurelia, userService) {
      _classCallCheck(this, CanCanStep);

      this.aurelia = aurelia;
      this.userService = userService;

      var ability = new _ability.Ability(this.userService.user);
      this.userService.user.ability = ability;
    }

    CanCanStep.prototype.run = function run(navigationInstruction, next) {
      return this.can(this.userService.user, navigationInstruction, next);
    };

    CanCanStep.prototype.can = function can(user, navigationInstruction, next) {
      var canAccess = navigationInstruction.getAllInstructions().every(function (i) {
        return user.ability.can("view", i.config.moduleId);
      });
      if (canAccess) {
        console.log("Permissions granted for the route: '" + navigationInstruction.config.moduleId + "'");
        return next();
      } else {
        console.log("You have no permissions for the route: '" + navigationInstruction.config.moduleId + "'");

        return next.cancel(new _aureliaRouter.Redirect('/access-denied'));
      }
    };

    return CanCanStep;
  }(), _class.inject = [_aureliaFramework.Aurelia, _userService.UserService], _temp);
});
define('security/authorize-step',['exports', '../services/session-service'], function (exports, _sessionService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthorizeStep = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var AuthorizeStep = exports.AuthorizeStep = (_temp = _class = function () {
    function AuthorizeStep(sessionSvc) {
      _classCallCheck(this, AuthorizeStep);

      this.sessionSvc = sessionSvc;
    }

    AuthorizeStep.prototype.run = function run(navigationInstruction, next) {
      var instructions = navigationInstruction.getAllInstructions();
      if (navigationInstruction.getAllInstructions().some(function (i) {
        return i.config.settings.roles.indexOf('authorized') !== -1;
      })) {
        if (this.sessionSvc.isAuthenticated()) {
          var message = 'Authorized for route ' + navigationInstruction.fragment;
          console.debug(message);
          return next();
        } else {
          this.sessionSvc.login();
        }
      }

      return next();
    };

    return AuthorizeStep;
  }(), _class.inject = [_sessionService.SessionService], _temp);
});
define('security/ability',["exports", "./rule"], function (exports, _rule) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Ability = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Ability = exports.Ability = function () {
    function Ability(user) {
      _classCallCheck(this, Ability);

      this.user = user;
      this.initialize(user);
    }

    Ability.prototype.defaults = function defaults() {
      return {
        rules: [],
        aliased_actions: {
          read: ["index", "show"],
          create: ["new"],
          update: ["edit"]
        }
      };
    };

    Ability.prototype.initialize = function initialize(user) {
      if (!_.isEmpty(user.rules)) {
        this.rules = _.map(user.rules, function (rule) {
          return new _rule.Rule(rule);
        });
      } else {
        this.rules = [];
      }

      this.aliased_actions = {
        read: ["index", "show"],
        create: ["new"],
        update: ["edit"]
      };
    };

    Ability.prototype.can = function can(action, subject, conditions) {
      var match = _.find(this.relevant_rules(action, subject), function (rule) {
        return rule.matches_conditions(action, subject);
      }, this);
      return match ? match.base_behavior : false;
    };

    Ability.prototype.cannot = function cannot(action, subject) {
      return !this.can(action, subject);
    };

    Ability.prototype.set_can = function set_can(action, subject, conditions) {
      this.rules.push(new _rule.Rule({ base_behavior: true, action: action, subject: subject, conditions: conditions }));
    };

    Ability.prototype.set_cannot = function set_cannot(action, subject, conditions) {
      this.rules.push(new _rule.Rule({ base_behavior: false, action: action, subject: subject, conditions: conditions }));
    };

    Ability.prototype.alias_action = function alias_action(from, target) {
      this.validate_target(target);
      if (!_.isArray(this.aliased_actions[target])) this.aliased_actions[target] = [];
      this.aliased_actions[target] = this.aliased_actions[target].concat(from);
    };

    Ability.prototype.validate_target = function validate_target(target) {
      if (_.chain(this.aliased_actions).values().flatten().include(target).value()) {
        throw new Error("You can't specify target (" + target + ") as alias because it is the real action name.");
      }
    };

    Ability.prototype.clear_aliased_actions = function clear_aliased_actions() {
      this.aliased_actions = {};
    };

    Ability.prototype.expand_actions = function expand_actions(actions) {
      var _this = this;

      return _.chain(actions).map(function (action) {
        if (_this.aliased_actions[action]) {
          return [action].concat(_this.expand_actions(_this.aliased_actions[action]));
        } else {
          return action;
        }
      }, this).flatten().value();
    };

    Ability.prototype.relevant_rules = function relevant_rules(action, subject) {
      var _this2 = this;

      var reversed_rules = this.rules.slice(0);
      return _.filter(reversed_rules.reverse(), function (rule) {
        rule.expanded_actions = _this2.expand_actions(rule.actions);
        return rule.is_relevant(action, subject);
      }, this);
    };

    return Ability;
  }();
});
define('resources/index',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(['./attributes/input-mask/input-mask', './attributes/set-focus/set-focus', './elements/address-info/address-info', './elements/contact-info/contact-info', './elements/data-pager/data-pager', './elements/driver-info/driver-info', './elements/gravatar/gravatar', './elements/notifier/notifier', './elements/personal-info/personal-info', './elements/quote-info/quote-info', './elements/user-settings/user-settings', './elements/vehicle-info/vehicle-info']);
  }
});
define('resources/elements/vehicle-info/vehicle-info',['exports', 'aurelia-framework', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaDialog, _sessionService, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VehicleInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _temp;

  var VehicleInfo = exports.VehicleInfo = (_dec = (0, _aureliaFramework.customElement)('vehicle-info'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function VehicleInfo(dialogSvc, sessionSvc) {
      _classCallCheck(this, VehicleInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'lookups', _descriptor2, this);

      _initDefineProp(this, 'isReadonly', _descriptor3, this);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    VehicleInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    VehicleInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    VehicleInfo.prototype.disabled = function disabled(value) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !args.includes(value);
    };

    VehicleInfo.prototype.selectChange = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context.sent;
                _context.next = 9;
                break;

              case 8:
                return _context.abrupt('return', true);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return selectChange;
    }();

    return VehicleInfo;
  }(), _class3.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'isReadonly', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  })), _class2)) || _class);
});
define('resources/elements/vehicle-info/vehicle-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Vehicle Info\" class=\"flex-row-none form-fields\"><legend>Vehicle Info</legend><div class=\"flex-row-none form-fields\"><div class=form-group><label for=vin>VIN</label><input type=text id=vin class=form-control value.bind=currentItem.vin set-focus readonly.bind=isReadonly></div><div class=form-group><label for=year>Year</label><input type=text id=year class=form-control value.bind=currentItem.year readonly.bind=isReadonly></div><div class=form-group><label for=make>Make</label><input type=text id=make class=form-control value.bind=currentItem.make readonly.bind=isReadonly></div><div class=form-group><label for=model>Model</label><input type=text id=model class=form-control value.bind=currentItem.model readonly.bind=isReadonly></div></div><div class=\"flex-row-none form-fields\"><div class=\"form-group full-width\"><label for=description>Description</label><input type=text id=description class=form-control value.bind=currentItem.description readonly.bind=isReadonly></div></div><div class=\"flex-row-none form-fields\"><div class=form-group><label for=custom_equipment_type>Custom Equip. Type</label><select class=form-control id=custom_equipment_type value.two-way=currentItem.custom_equipment_type keydown.delegate=\"selectChange($event, 'CustomEquType', 'Custom Equipment Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('CustomEquType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=additional_electronic_type>Add Elec. Type</label><select class=form-control id=additional_electronic_type value.two-way=currentItem.additional_electronic_type keydown.delegate=\"selectChange($event, 'AddElecType', 'Add Elec. Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('AddElecType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=vehicle_use_code>Use Type</label><select class=form-control id=vehicle_use_code value.two-way=currentItem.vehicle_use_code keydown.delegate=\"selectChange($event, 'UseType', 'Use Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('UseType')\" model.bind=item.value>${item.name}</option></select></div></div></fieldset></template>"; });
define('resources/elements/user-settings/user-settings',['exports', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/user-settings-dialog'], function (exports, _aureliaDialog, _sessionService, _userSettingsDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UserSettings = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var UserSettings = exports.UserSettings = (_temp = _class = function () {
    function UserSettings(dialogSvc, sessionSvc) {
      _classCallCheck(this, UserSettings);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    UserSettings.prototype.showUserSettings = function showUserSettings(e) {
      var model = {};
      this.dialogSvc.open({
        viewModel: _userSettingsDialog.UserSettingsDialog, model: model, lock: false
      });
    };

    return UserSettings;
  }(), _class.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp);
});
define('resources/elements/user-settings/user-settings.html!text', ['module'], function(module) { module.exports = "<template><button id=userAvatar if.bind=sessionSvc.user class=\"btn flat full-height\" click.delegate=showUserSettings($event)><gravatar credential=\"${sessionSvc.user.email}\" size=64></gravatar></button></template>"; });
define('resources/elements/quote-info/quote-info',['exports', 'aurelia-framework', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaDialog, _sessionService, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.QuoteInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _class3, _temp;

  var QuoteInfo = exports.QuoteInfo = (_dec = (0, _aureliaFramework.customElement)('quote-info'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function QuoteInfo(dialogSvc, sessionSvc) {
      _classCallCheck(this, QuoteInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'lookups', _descriptor2, this);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    QuoteInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    QuoteInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    QuoteInfo.prototype.selectChange = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context.sent;
                _context.next = 9;
                break;

              case 8:
                return _context.abrupt('return', true);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return selectChange;
    }();

    return QuoteInfo;
  }(), _class3.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class);
});
define('resources/elements/quote-info/quote-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Contact Info\" class=\"flex-row-none form-fields\"><legend>Quote Info</legend><div class=\"flex-row-none form-fields\"><div class=form-group><label for=quote_method>Quote Method</label><select class=form-control id=quote_method value.two-way=currentItem.quote_method keydown.delegate=\"selectChange($event, 'QuoteMethod', 'Quote Method Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('QuoteMethod')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=effective_date>Effective Date</label><input id=effective_date class=form-control value.bind=currentItem.effective_date input-mask=\"pattern: ##-##-####;\" placeholder=MM-DD-YYYY></div><div class=form-group><label for=quote_status>Quote Status</label><select class=form-control id=quote_status value.two-way=currentItem.quote_status keydown.delegate=\"selectChange($event, 'QuoteStatus', 'Quote Status Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('QuoteStatus')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=insurance_type>Insurance Type</label><select class=form-control id=insurance_type value.two-way=currentItem.insurance_type keydown.delegate=\"selectChange($event, 'InsuranceType', 'Insurance Type Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('InsuranceType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=coverage_type>Coverage Type</label><select class=form-control id=coverage_type value.two-way=currentItem.coverage_type keydown.delegate=\"selectChange($event, 'CoverageType', 'Coverage Type Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('CoverageType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=term_length>Term Length</label><select class=form-control id=term_length value.two-way=currentItem.term_length keydown.delegate=\"selectChange($event, 'TermLength', 'Term Length Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('TermLength')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=has_prior_coverage>Prior Coverage</label><select class=form-control id=has_prior_coverage value.two-way=currentItem.has_prior_coverage keydown.delegate=\"selectChange($event, 'YesNoType', 'YesNo Type Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('YesNoType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=prior_coverage_company>Prior Cov. Company</label><input id=prior_coverage_company class=form-control value.bind=currentItem.prior_coverage_company placeholder=\"Company name...\" disabled.bind=\"currentItem.has_prior_coverage !== 'yes'\"></div></div></fieldset></template>"; });
define('resources/elements/personal-info/personal-info',['exports', 'aurelia-framework', 'aurelia-templating-resources', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/customer-dialog', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaTemplatingResources, _aureliaDialog, _sessionService, _customerDialog, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.PersonalInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _class3, _temp;

  var PersonalInfo = exports.PersonalInfo = (_dec = (0, _aureliaFramework.customElement)('personal-info'), _dec2 = (0, _aureliaFramework.bindable)({ defaultBindingMode: _aureliaFramework.bindingMode.twoWay }), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function PersonalInfo(signaler, dialogSvc, sessionSvc) {
      _classCallCheck(this, PersonalInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'currentItem', _descriptor2, this);

      _initDefineProp(this, 'lookups', _descriptor3, this);

      _initDefineProp(this, 'showCustomerLookup', _descriptor4, this);

      _initDefineProp(this, 'saveCallback', _descriptor5, this);

      _initDefineProp(this, 'isReadonly', _descriptor6, this);

      this.signaler = signaler;
      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    PersonalInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    PersonalInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    PersonalInfo.prototype.selectChange = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context.sent;
                _context.next = 9;
                break;

              case 8:
                return _context.abrupt('return', true);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return selectChange;
    }();

    PersonalInfo.prototype.launchCustomerDlg = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                model = {
                  header: "Customer",
                  close: "Close",
                  lookups: this.lookups
                };
                options = { viewModel: _customerDialog.CustomerDialog, model: model };
                _context2.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context2.sent;

                if (!closeResult.wasCancelled) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt('return');

              case 7:
                this.currentItem = closeResult.output;
                this.currentItem.customerId = this.currentItem._id.$oid;
                delete this.currentItem._id;
                this.currentItem.household_members = [];
                this.currentItem.household_vehicles = [];
                this.signaler.signal('binding-signal');
                setTimeout(function () {
                  if (_this.saveCallback) {
                    _this.saveCallback();
                  }
                }, 250);

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function launchCustomerDlg() {
        return _ref2.apply(this, arguments);
      }

      return launchCustomerDlg;
    }();

    return PersonalInfo;
  }(), _class3.inject = [_aureliaTemplatingResources.BindingSignaler, _aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_dec2], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'showCustomerLookup', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'saveCallback', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'isReadonly', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  })), _class2)) || _class);
});
define('resources/elements/personal-info/personal-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Personal Info\" class=\"flex-row-none form-fields\"><legend>Personal Info</legend><div class=\"flex-row-none form-fields\"><div class=\"form-group width-40\" show.bind=showCustomerLookup><label></label><button class=\"btn btn-primary form-control\" click.delegate=launchCustomerDlg()><i class=\"fa fa-user\"></i></button></div><div class=form-group><label for=first_name>First Name</label><input type=text id=first_name class=form-control value.bind=currentItem.first_name set-focus readonly.bind=isReadonly></div><div class=\"form-group width-40\"><label for=middle_name>MI</label><input type=text id=middle_name class=form-control value.bind=currentItem.middle_name readonly.bind=isReadonly></div><div class=form-group><label for=last_name>Last Name</label><input type=text id=last_name class=form-control value.bind=currentItem.last_name readonly.bind=isReadonly></div><div class=form-group><label for=birth_date>Birth Date</label><input type=text id=birth_date class=form-control value.bind=currentItem.birth_date input-mask=\"pattern: ##-##-####;\" placeholder=MM-DD-YYYY readonly.bind=isReadonly></div><div class=form-group><label for=gender>Gender</label><select class=form-control id=gender value.two-way=currentItem.gender keydown.delegate=\"selectChange($event, 'Genders', 'Genders Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('Genders')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=social_security_number>Social Security Number</label><input type=text id=social_security_number class=form-control value.bind=currentItem.social_security_number input-mask=\"pattern: ###-##-####;\" placeholder=###-###-#### readonly.bind=isReadonly></div><div class=form-group><label for=marital_status>Marital Status</label><select class=form-control id=marital_status value.two-way=currentItem.marital_status keydown.delegate=\"selectChange($event, 'MaritalStatus', 'Marital Status Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('MaritalStatus')\" model.bind=item.value>${item.name}</option></select></div></div></fieldset></template>"; });
define('resources/elements/notifier/notifier',['exports', './notification'], function (exports, _notification) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Notifier = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var currentZIndex = 300000;

  function getNextZIndex() {
    return ++currentZIndex;
  }

  var Notifier = exports.Notifier = function () {
    function Notifier() {
      _classCallCheck(this, Notifier);

      this.notifications = [];
    }

    Notifier.prototype.add = function add(notification) {
      var _this = this;

      notification.controller = this;
      this.notifications.push(notification);

      if (!notification.isModal && notification.timeout) {
        setTimeout(function () {
          _this.remove(notification);
        }, notification.timeout);
      }
    };

    Notifier.prototype.remove = function remove(notification) {
      var i = this.notifications.indexOf(notification);
      this.notifications.splice(i, 1);
    };

    Notifier.prototype.growl = function growl(options) {
      document.querySelector('.note-container').style.zIndex = getNextZIndex();

      var n = new _notification.Notification(options);
      this.add(n);
    };

    return Notifier;
  }();
});
define('resources/elements/notifier/notifier.html!text', ['module'], function(module) { module.exports = "<template><require from=./notifier.css></require><div class=note-container><ul><li repeat.for=\"n of notifications\" class=\"au-animate toast\"><compose view-model.bind=n></compose></li></ul></div></template>"; });
define('resources/elements/notifier/notifier.css!text', ['module'], function(module) { module.exports = ".note-container { padding: 0; position: absolute; right: 24px; bottom: 8px; border-radius: 15px; }\n.note-container ul { padding: 0; list-style-type: none; }\n\n.note { display: flex; flex-direction: row; border: 1px solid black; border-radius: 5px; align-items: center; justify-content: flex-start; box-shadow: 0 0 10px rgba(0,0,0, .5); width: 300px; margin-bottom: 6px; }\n.content { display: flex; flex-direction: column; flex: 1 1 auto; padding: 5px; }\n.icon { flex: 0 0 auto; border-radius: 50%; height: 20px; width: 20px; margin-left: 5px; margin-right: 5px; }\nheader { font-size: larger; }\nfooter { font-size: smaller; }\n.close { margin-left: 8px; margin-right:10px; font-size:18px; font-weight: normal; }\n\n.note-light { background: white; }\n.note-dark { background: black; color: white; }\n.note-dark .close { color: white; }\n\n.success { background: green; }\n.error { background: red; }\n.info { background: blue; }\n.warn { background: orange; }\n\n\n.toast.au-enter {\n  opacity: 0!important;\n}\n\n.toast.au-enter-active {\n  -webkit-animation: fadeIn 2s;\n  animation: fadeIn 2s;\n}\n\n\n/* animation definitions */\n@-webkit-keyframes fadeInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0)\n  }\n  100% {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none\n  }\n}\n\n@keyframes fadeInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    -ms-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0)\n  }\n  100% {\n    opacity: 1;\n    -webkit-transform: none;\n    -ms-transform: none;\n    transform: none\n  }\n}\n\n\n@-webkit-keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@-webkit-keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n\n@keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n"; });
define('resources/elements/notifier/notification',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var Notification = exports.Notification = (_temp = _class = function () {
    function Notification(options) {
      _classCallCheck(this, Notification);

      this.title = options.title || '';
      this.message = options.message;
      this.footer = options.footer || '';
      this.type = options.type || 'success';
      this.showClose = options.showClose || false;
      this.isModal = options.isModal || false;
      this.theme = options.theme || 'note-dark';
      this.timeout = options.timeout || Notification.standardTimeout;
      if (this.timeout < 0) this.timeout = 0;
    }

    Notification.prototype.close = function close() {
      this.controller.remove(this);
    };

    Notification.info = function info(message, title) {
      return new Notification(message, title || 'Success', 'success');
    };

    return Notification;
  }(), _class.standardTimeout = 3000, _temp);
});
define('resources/elements/notifier/notification.html!text', ['module'], function(module) { module.exports = "<template><div class=\"note ${theme}\"><div class=\"icon ${type}\"></div><div class=content><header if.bind=title>${title}</header><main>${message}</main><footer if.bind=footer>${footer}</footer></div><a if.bind=showClose click.delegate=close() class=\"close glyphicon glyphicon-remove\"></a></div></template>"; });
define('resources/elements/gravatar/gravatar',['exports', 'aurelia-framework', '../../../services/md5-service'], function (exports, _aureliaFramework, _md5Service) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Gravatar = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _class3, _temp;

  var Gravatar = exports.Gravatar = (_dec = (0, _aureliaFramework.customElement)('gravatar'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function Gravatar(md5Svc) {
      _classCallCheck(this, Gravatar);

      _initDefineProp(this, 'credential', _descriptor, this);

      _initDefineProp(this, 'size', _descriptor2, this);

      _initDefineProp(this, 'defaultImage', _descriptor3, this);

      _initDefineProp(this, 'rating', _descriptor4, this);

      _initDefineProp(this, 'isSecure', _descriptor5, this);

      _initDefineProp(this, 'url', _descriptor6, this);

      this.md5Svc = md5Svc;
    }

    Gravatar.prototype.attached = function attached() {
      this.refreshBindings();
    };

    Gravatar.prototype.propertyChanged = function propertyChanged() {
      this.refreshBindings();
    };

    Gravatar.prototype.refreshBindings = function refreshBindings() {
      this.url = this.generate();
    };

    Gravatar.prototype.generate = function generate() {
      var hashedCredential = this.isEmail(this.credential) ? this.md5Svc.md5(this.credential) : this.credential;
      var url = this.isSecure ? "https://secure.gravatar.com/avatar/" : "http://www.gravatar.com/avatar/";
      url += hashedCredential + '.jpg?';

      if (this.size) {
        url += 's=' + this.size + '&';
      }
      if (this.rating) {
        url += 'r=' + this.rating + '&';
      }
      if (this.defaultImage) {
        url += 'd=' + encodeURIComponent(this.defaultImage);
      }
      return url;
    };

    Gravatar.prototype.isEmail = function isEmail() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return input.indexOf("@") >= 0;
    };

    return Gravatar;
  }(), _class3.inject = [_md5Service.Md5Service], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'credential', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return '';
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'size', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 64;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'defaultImage', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'mm';
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'rating', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'g';
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'isSecure', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return true;
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'url', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return "";
    }
  })), _class2)) || _class);
});
define('resources/elements/gravatar/gravatar.html!text', ['module'], function(module) { module.exports = "<template><require from=./gravatar.css></require><img class=gravatar-img src.bind=url></template>"; });
define('resources/elements/gravatar/gravatar.css!text', ['module'], function(module) { module.exports = ".gravatar-img {\n  border-radius: 15px;\n  height: 32px;\n  width: 32px;\n}"; });
define('resources/elements/driver-info/driver-info',['exports', 'aurelia-framework', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaDialog, _sessionService, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DriverInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _temp;

  var DriverInfo = exports.DriverInfo = (_dec = (0, _aureliaFramework.customElement)('driver-info'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function DriverInfo(dialogSvc, sessionSvc) {
      _classCallCheck(this, DriverInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'lookups', _descriptor2, this);

      _initDefineProp(this, 'isReadonly', _descriptor3, this);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    DriverInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    DriverInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    DriverInfo.prototype.disabled = function disabled(value) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !args.includes(value);
    };

    DriverInfo.prototype.selectChange = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context.sent;
                _context.next = 9;
                break;

              case 8:
                return _context.abrupt('return', true);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return selectChange;
    }();

    DriverInfo.prototype.licenseDateChange = function licenseDateChange(e, driver) {
      var date = new Date(driver.license_date);
      driver.license_years_experience = this.calculateAge(date);
    };

    DriverInfo.prototype.calculateAge = function calculateAge(date) {
      var birthYear = date.getFullYear();
      var birthMonth = date.getMonth();
      var birthDay = date.getDate();
      var todayDate = new Date();
      var todayYear = todayDate.getFullYear();
      var todayMonth = todayDate.getMonth();
      var todayDay = todayDate.getDate();
      var age = todayYear - birthYear;
      if (todayMonth < birthMonth - 1) {
        age--;
      }
      if (birthMonth - 1 == todayMonth && todayDay < birthDay) {
        age--;
      }
      return age;
    };

    return DriverInfo;
  }(), _class3.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'isReadonly', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  })), _class2)) || _class);
});
define('resources/elements/driver-info/driver-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Driver Info\" class=\"flex-row-none form-fields\"><legend>Driver Info</legend><div class=\"flex-row-none form-fields align-items-end\"><div class=form-group><label for=license_status>Lic. Status</label><select class=form-control id=license_status value.two-way=currentItem.license_status keydown.delegate=\"selectChange($event, 'LicenseStatus', 'License Status Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('LicenseStatus')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=license_number>Lic. Number</label><input id=license_number class=form-control value.bind=currentItem.license_number readonly.bind=isReadonly></div><div class=\"form-group width-120\"><label for=license_state>Lic. State</label><select class=form-control id=license_state value.two-way=currentItem.license_state keydown.delegate=\"selectChange($event, 'USStates', 'US States Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('USStates')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=license_date>Lic. Date</label><input type=text id=license_date class=form-control value.bind=currentItem.license_date change.delegate=\"licenseDateChange($event, currentItem)\" input-mask=\"pattern: ##-##-####;\" placeholder=MM-DD-YYYY readonly.bind=isReadonly></div><div class=\"form-group width-60\"><label for=license_years_experience>Years Exp.</label><input id=license_years_experience class=form-control value.bind=currentItem.license_years_experience readonly></div><div class=form-group><label for=relationship_to_customer>Customer Relation</label><select class=form-control id=relationship_to_customer value.two-way=currentItem.relationship_to_customer keydown.delegate=\"selectChange($event, 'RelationType', 'Relation Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('RelationType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=driver_type>Driver Type</label><select class=form-control id=driver_type value.two-way=currentItem.driver_type keydown.delegate=\"selectChange($event, 'DriverType', 'Driver Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('DriverType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=military_student_type>Military/Student</label><select class=form-control id=military_student_type value.two-way=currentItem.military_student_type keydown.delegate=\"selectChange($event, 'MilitaryStudentType', 'Military Student Type Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('MilitaryStudentType')\" model.bind=item.value>${item.name}</option></select></div><div class=form-group><label for=military_paygrade>Military Paygrade</label><select class=form-control id=military_paygrade value.two-way=currentItem.military_paygrade disabled.bind=\"disabled(currentItem.military_student_type, 'ar', 'af', 'cg', 'mr', 'nv')\" keydown.delegate=\"selectChange($event, 'PayType', 'Pay Type Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('PayType')\" model.bind=item.value>${item.name}</option></select></div></div></fieldset></template>"; });
define('resources/elements/data-pager/data-pager',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DataPager = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _class3, _temp;

  var DataPager = exports.DataPager = (_dec = (0, _aureliaFramework.customElement)('data-pager'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function DataPager(messageBus) {
      var _this = this;

      _classCallCheck(this, DataPager);

      _initDefineProp(this, 'pagedItems', _descriptor, this);

      _initDefineProp(this, 'items', _descriptor2, this);

      _initDefineProp(this, 'pageSize', _descriptor3, this);

      _initDefineProp(this, 'pages', _descriptor4, this);

      _initDefineProp(this, 'currentPage', _descriptor5, this);

      this.messageBus = messageBus;

      this.messageBus.subscribe('data-filter:filter', function (payload) {
        _this.items = payload.filter;
        _this.initPage();
      });
    }

    DataPager.prototype.bind = function bind() {};

    DataPager.prototype.attached = function attached() {
      this.initPage();
    };

    DataPager.prototype.initPage = function initPage() {
      var _this2 = this;

      this.pages = Math.ceil(this.items.length / parseInt(this.pageSize));

      this.currentPage = 0;
      var payload = {
        pageSize: parseInt(this.pageSize),
        currentPage: 0,
        items: this.items
      };
      setTimeout(function () {
        _this2.messageBus.publish('data-pager:page', payload);
      }, 45);
    };

    DataPager.prototype.setCurrentPage = function setCurrentPage(index) {
      this.currentPage = index;
      var payload = {
        pageSize: parseInt(this.pageSize),
        currentPage: index,
        items: this.items
      };
      this.messageBus.publish('data-pager:page', payload);
    };

    DataPager.prototype.previousPage = function previousPage() {
      if (this.currentPage === 0) return;
      this.currentPage--;
      this.setCurrentPage(this.currentPage);
    };

    DataPager.prototype.nextPage = function nextPage() {
      if (this.currentPage === this.pages - 1) return;
      this.currentPage++;
      this.setCurrentPage(this.currentPage);
    };

    return DataPager;
  }(), _class3.inject = [_aureliaEventAggregator.EventAggregator], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'pagedItems', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'items', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'pageSize', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 5;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'pages', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'currentPage', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 0;
    }
  })), _class2)) || _class);
});
define('resources/elements/data-pager/data-pager.html!text', ['module'], function(module) { module.exports = "<template><require from=./data-pager.css></require><nav class=data-pager aria-label=\"Data page navigation\"><ul class=pagination><li class=\"page-item ${currentPage === 0 ? 'disabled' : ''}\"><a class=page-link click.delegate=previousPage()>Previous</a></li><li class=\"page-item ${currentPage === $index ? 'active' : ''}\" repeat.for=\"item of pages\"><a class=page-link click.delegate=setCurrentPage($index)>${$index + 1}</a></li><li class=\"page-item ${currentPage === pages - 1 ? 'disabled' : ''}\"><a class=page-link click.delegate=nextPage()>Next</a></li></ul></nav></template>"; });
define('resources/elements/data-pager/data-pager.css!text', ['module'], function(module) { module.exports = ".data-pager .page-item {\n  user-select: none;\n  cursor: pointer;\n}\n"; });
define('resources/elements/contact-info/contact-info',['exports', 'aurelia-framework', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaDialog, _sessionService, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _class3, _temp;

  var ContactInfo = exports.ContactInfo = (_dec = (0, _aureliaFramework.customElement)('contact-info'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function ContactInfo(dialogSvc, sessionSvc) {
      _classCallCheck(this, ContactInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'lookups', _descriptor2, this);

      _initDefineProp(this, 'isReadonly', _descriptor3, this);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    ContactInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    ContactInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    ContactInfo.prototype.selectChange = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context.sent;
                _context.next = 9;
                break;

              case 8:
                return _context.abrupt('return', true);

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return selectChange;
    }();

    return ContactInfo;
  }(), _class3.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'isReadonly', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  })), _class2)) || _class);
});
define('resources/elements/contact-info/contact-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Contact Info\" class=\"flex-row-none form-fields\"><legend>Contact Info</legend><div class=\"flex-row-none form-fields\"><div class=form-group><label for=email>Email</label><input type=email id=email class=form-control value.bind=currentItem.email placeholder=john@doe.com readonly.bind=isReadonly></div><div class=form-group><label for=home_number>Home Number</label><input id=home_number class=form-control value.bind=currentItem.home_number input-mask=\"pattern: (###) ###-####;\" placeholder=\"(###) ###-####\" readonly.bind=isReadonly></div><div class=form-group><label for=mobile_number>Mobile Number</label><input id=mobile_number class=form-control value.bind=currentItem.mobile_number input-mask=\"pattern: (###) ###-####;\" placeholder=\"(###) ###-####\" readonly.bind=isReadonly></div><div class=form-group><label for=preferred_contact_method>Preferred Contact Method</label><select class=form-control id=preferred_contact_method value.two-way=currentItem.preferred_contact_method keydown.delegate=\"selectChange($event, 'PreferredContactMethod', 'Preferred Contact Method Lookup')\" disabled.bind=isReadonly><option>Choose...</option><option repeat.for=\"item of getLookupItems('PreferredContactMethod')\" model.bind=item.value>${item.name}</option></select></div></div></fieldset></template>"; });
define('resources/elements/address-info/address-info',['exports', 'aurelia-framework', 'aurelia-dialog', '../../../services/session-service', '../../../dialogs/address-dialog', '../../../dialogs/lookup-dialog'], function (exports, _aureliaFramework, _aureliaDialog, _sessionService, _addressDialog, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AddressInfo = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3, _temp;

  var AddressInfo = exports.AddressInfo = (_dec = (0, _aureliaFramework.customElement)('address-info'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function AddressInfo(dialogSvc, sessionSvc) {
      _classCallCheck(this, AddressInfo);

      _initDefineProp(this, 'currentItem', _descriptor, this);

      _initDefineProp(this, 'lookups', _descriptor2, this);

      _initDefineProp(this, 'saveCallback', _descriptor3, this);

      _initDefineProp(this, 'isReadonly', _descriptor4, this);

      this.dialogSvc = dialogSvc;
      this.sessionSvc = sessionSvc;
    }

    AddressInfo.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    AddressInfo.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    AddressInfo.prototype.launchAddressDlg = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                model = {
                  header: "Address",
                  close: "Close",
                  data: this.currentItem.address
                };
                options = { viewModel: _addressDialog.AddressDialog, model: model };
                _context.next = 4;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 4:
                closeResult = _context.sent;

                if (!closeResult.wasCancelled) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt('return');

              case 7:
                setTimeout(function () {
                  if (_this.saveCallback) {
                    _this.saveCallback();
                  }
                }, 250);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function launchAddressDlg() {
        return _ref.apply(this, arguments);
      }

      return launchAddressDlg;
    }();

    AddressInfo.prototype.selectChange = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(e, key, title) {
        var model, options, closeResult;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(e.key === 'F3' && this.sessionSvc.user.roles.includes('admin'))) {
                  _context2.next = 8;
                  break;
                }

                model = {
                  data: {
                    database: 'quote-one',
                    collection: 'lookups',
                    header: title,
                    lookupName: key,
                    currentLookup: this.getLookup(key)
                  }
                };
                options = { viewModel: _lookupDialog.LookupDialog, model: model };
                _context2.next = 5;
                return this.dialogSvc.open(options).then(function (result) {
                  return result.closeResult;
                });

              case 5:
                closeResult = _context2.sent;
                _context2.next = 9;
                break;

              case 8:
                return _context2.abrupt('return', true);

              case 9:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function selectChange(_x, _x2, _x3) {
        return _ref2.apply(this, arguments);
      }

      return selectChange;
    }();

    return AddressInfo;
  }(), _class3.inject = [_aureliaDialog.DialogService, _sessionService.SessionService], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'currentItem', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'lookups', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'saveCallback', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'isReadonly', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return false;
    }
  })), _class2)) || _class);
});
define('resources/elements/address-info/address-info.html!text', ['module'], function(module) { module.exports = "<template><fieldset tag=\"Address Info\" class=\"flex-row-none form-fields\"><legend>Address Info</legend><div class=\"flex-row-none align-items-center form-fields\"><div show.bind=!isReadonly class=\"form-group width-40\"><label></label><button class=\"btn btn-primary form-control\" click.delegate=launchAddressDlg()><i class=\"fa fa-home\"></i></button></div><div class=form-group><label for=street>Street</label><input type=text id=street class=form-control value.bind=currentItem.street placeholder=\"Street address...\" readonly.bind=isReadonly></div><div class=form-group><label for=city>City</label><input type=text id=city class=form-control value.bind=currentItem.city placeholder=City... readonly.bind=isReadonly></div><div class=form-group><label for=state>State</label><input type=text id=state class=form-control value.bind=currentItem.state placeholder=State... readonly.bind=isReadonly></div><div class=form-group><label for=postal_code>Postal Code</label><input type=text id=postal_code class=form-control value.bind=currentItem.postal_code placeholder=\"Postal Code...\" readonly.bind=isReadonly></div><div class=form-group><label for=county>County</label><input type=text id=county class=form-control value.bind=currentItem.county placeholder=County... readonly.bind=isReadonly></div><div class=form-group><label for=home_owner>Home Owner</label><select class=form-control id=home_owner value.two-way=currentItem.home_owner keydown.delegate=\"selectChange($event, 'HomeOwnerType', 'Home Owner Type Lookup')\"><option>Choose...</option><option repeat.for=\"item of getLookupItems('HomeOwnerType')\" model.bind=item.value>${item.name}</option></select></div></div></fieldset></template>"; });
define('resources/behaviors/dirty-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DirtyBindingBehavior = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var DirtyBindingBehavior = exports.DirtyBindingBehavior = function () {
    function DirtyBindingBehavior() {
      _classCallCheck(this, DirtyBindingBehavior);
    }

    DirtyBindingBehavior.prototype.bind = function bind(binding, source, event) {
      var _this = this;

      var period = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 140;

      if (!binding.updateTarget) {
        throw new Error('Only property bindings and string interpolation bindings can be dirty checked.  Trigger, delegate and call bindings cannot be dirty checked.');
      }
      binding.interceptedupdateTarget = binding.updateTarget;
      binding.updateTarget = function (a) {
        if (_this.isDirtyCheck(binding.value, a)) {
          var propname = binding.sourceExpression.expression.name;
          var callevent = event || binding.source.controller.viewModel[propname + 'Changed'];
          if (typeof event == 'function') callevent(a, binding.value, propname);
          binding.interceptedupdateTarget(a);
        }
      };
      binding.dirtyTimer = setInterval(function (t) {
        return binding.call(_aureliaBinding.sourceContext);
      }, period);
    };

    DirtyBindingBehavior.prototype.unbind = function unbind(binding, source) {
      clearInterval(binding.dirtyTimer);
      binding.updateTarget = binding.interceptedupdateTarget;
      binding.interceptedupdateTarget = null;
    };

    DirtyBindingBehavior.prototype.isDirtyCheck = function isDirtyCheck(previous, current) {
      if (typeof current.getMonth === 'function' && typeof previous.getMonth === 'function') return previous.getTime() != current.getTime();

      if (previous != current) return true;

      return JSON.stringify(previous) != JSON.stringify(current);
    };

    return DirtyBindingBehavior;
  }();
});
define('resources/attributes/set-focus/set-focus',['exports', 'aurelia-templating', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SetFocus = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class, _class2, _temp;

  var SetFocus = exports.SetFocus = (_dec = (0, _aureliaTemplating.customAttribute)('set-focus'), _dec(_class = (_temp = _class2 = function () {
    function SetFocus(element) {
      _classCallCheck(this, SetFocus);

      this.element = element;
    }

    SetFocus.prototype.attached = function attached() {
      this.element.focus();
    };

    return SetFocus;
  }(), _class2.inject = [_aureliaPal.DOM.Element], _temp)) || _class);
});
define('resources/attributes/input-mask/input-mask',['exports', 'aurelia-framework', 'aurelia-pal'], function (exports, _aureliaFramework, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.InputMask = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _class, _desc, _value, _class2, _descriptor, _class3, _temp;

  var InputMask = exports.InputMask = (_dec = (0, _aureliaFramework.customAttribute)('input-mask'), _dec(_class = (_class2 = (_temp = _class3 = function () {
    function InputMask(element) {
      _classCallCheck(this, InputMask);

      _initDefineProp(this, 'pattern', _descriptor, this);

      this.element = element;
      if (element instanceof HTMLInputElement) {
        this.element = element;
      } else {
        throw new Error('The input-mask attribute can only be applied on Input elements.');
      }
    }

    InputMask.prototype.attached = function attached() {
      this.element.addEventListener("keydown", this.keyDownHandler.bind(this));
    };

    InputMask.prototype.detached = function detached() {
      this.element.removeEventListener("keydown", this.keyDownHandler.bind(this));
    };

    InputMask.prototype.getOptions = function getOptions(e) {
      if (!e.key) return null;
      var value = e.target.value;
      var isInt = Number.isInteger(Number.parseInt(e.key));
      var key = e.key.toLowerCase();
      var valueLen = value.length;
      var patternLen = this.pattern.length;
      var char = this.pattern[valueLen];
      var options = {
        e: e,
        value: value,
        isInt: isInt,
        key: key,
        valueLen: valueLen,
        patternLen: patternLen,
        char: char
      };
      return options;
    };

    InputMask.prototype.keyDownHandler = function keyDownHandler(e) {
      var options = this.getOptions(e);
      var result = true;
      if (options) {
        if (this.isValidNonInputKey(options.key)) {} else if (options.valueLen === options.patternLen) {
          console.log('lengths are equal', e);
          if (e.target.selectionEnd - e.target.selectionStart > 0) {
            e.target.value = '';

            options = this.getOptions(e);
            console.log('clearing out...', e.target.value);
            result = this.processKey(options);
          } else {
            e.preventDefault();
            result = false;
          }
        } else if (options.char === '#' && options.isInt) {} else if (this.processKey(options)) {} else {
          console.log('bad input');
          e.preventDefault();
          result = false;
        }
      }
      return result;
    };

    InputMask.prototype.processKey = function processKey(options) {
      if (options.key === options.char) {
        return true;
      } else if (options.char !== '#' && options.isInt) {
        var nextChar = this.pattern[options.valueLen + 1];
        if (nextChar === ' ') {
          options.e.target.value = options.e.target.value + options.char + ' ';
        } else {
          options.e.target.value = options.e.target.value + options.char;
        }
        return true;
      }
      console.log('cannot process key', options.key);
      return false;
    };

    InputMask.prototype.isValidNonInputKey = function isValidNonInputKey(key) {
      var keys = ["backspace", "arrowleft", "arrowright", "arrowup", "arrowdown", "home", "end", "tab"];
      return keys.includes(key);
    };

    return InputMask;
  }(), _class3.inject = [_aureliaPal.DOM.Element], _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'pattern', [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return '';
    }
  })), _class2)) || _class);
});
define('nav-bar.html!text', ['module'], function(module) { module.exports = "<template bindable=router><nav class=\"navbar navbar-default navbar-fixed-top\" role=navigation><div class=navbar-header><button type=button class=navbar-toggle data-toggle=collapse data-target=#skeleton-navigation-navbar-collapse><span class=sr-only>Toggle Navigation</span><span class=icon-bar></span><span class=icon-bar></span><span class=icon-bar></span></button><a class=navbar-brand href=#><i class=\"fa fa-home\"></i><span>${router.title}</span></a></div><div class=\"collapse navbar-collapse\" id=skeleton-navigation-navbar-collapse><ul class=\"nav navbar-nav\"><li repeat.for=\"row of router.navigation\" class=\"${row.isActive ? 'active' : ''}\"><a data-toggle=collapse data-target=#skeleton-navigation-navbar-collapse.in href.bind=row.href>${row.title}</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li class=loader if.bind=router.isNavigating><i class=\"fa fa-spinner fa-spin fa-2x\"></i></li></ul></div></nav></template>"; });
define('main',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(aurelia) {
    aurelia.use.standardConfiguration().developmentLogging().feature('resources').plugin('aurelia-dialog', function (config) {
      config.useDefaults();
      config.settings.lock = true;
      config.settings.centerHorizontalOnly = false;
      config.settings.startingZIndex = 5;
      config.settings.keyboard = true;
    });

    aurelia.start().then(function (a) {
      return a.setRoot();
    });
  }
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('dialogs/vin-dialog',['exports', 'aurelia-dialog', '../services/edmunds-service'], function (exports, _aureliaDialog, _edmundsService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VinDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var VinDialog = exports.VinDialog = (_temp = _class = function () {
    function VinDialog(controller) {
      _classCallCheck(this, VinDialog);

      this.model = {};

      this.controller = controller;
    }

    VinDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.owner = model.owner;
      this.edmundsSvc = new _edmundsService.EdmundsService();
    };

    VinDialog.prototype.attached = function attached() {};

    VinDialog.prototype.lookup = function lookup(e, record) {
      this.performLookup(record);
    };

    VinDialog.prototype.performLookup = function performLookup(record) {
      var _this = this;

      var query = {
        vin: record.vin
      };
      return this.owner.dataSvc.findOne(this.owner.database, 'vins', query).then(function (result) {
        if (result) {
          _this.setVinData(record.vin, result);
          _this.owner.notifier.growl({ type: 'info', message: 'VIN #' + result.vin + ' loaded from database.' });
          _this.controller.ok(true);
        } else {
          _this.edmundsSvc.performLookup(record.vin).then(function (data) {
            if (data.status) {
              _this.owner.notifier.growl({ type: 'error', message: data.message });
            } else {
              data.vin = record.vin;
              _this.setVinData(record.vin, data);
              _this.owner.notifier.growl({ type: 'info', message: 'VIN #' + data.vin + ' loaded from Edmunds Service.' });
              _this.owner.dataSvc.save(_this.owner.database, 'vins', data).then(function (s) {
                _this.owner.notifier.growl({ type: 'success', message: 'VIN #' + data.vin + ' added to database.' });
              });
              _this.controller.ok(true);
            }
          });
        }
        return result;
      });
    };

    VinDialog.prototype.setVinData = function setVinData(vin, data) {
      this.model.data['vin'] = vin;
      this.model.data['year'] = data.years[0].year;
      this.model.data['make'] = data.make.name;
      this.model.data['model'] = data.model.name;
      this.model.data['description'] = data.years[0].styles[0].trim;
    };

    return VinDialog;
  }(), _class.inject = [_aureliaDialog.DialogController], _temp);
});
define('dialogs/vin-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog class=\"drag-container drag-item\"><ux-dialog-header class=\"\">${model.header}</ux-dialog-header><ux-dialog-body class=\"\"><form id=vinDialog class=width-350><div class=form-group><label for=vin class=\"\">${model.vin}</label><input id=vin class=form-control value.bind=model.data.vin placeholder=Search... set-focus=\"\"></div></form></ux-dialog-body><ux-dialog-footer class=\"\"><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=\"lookup($event, model.data)\">${model.lookup}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/vehicle-lookup-dialog',['exports', 'aurelia-dialog', 'aurelia-templating-resources', 'aurelia-event-aggregator', '../services/data-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _aureliaTemplatingResources, _aureliaEventAggregator, _dataService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VehicleLookupDialog = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var VehicleLookupDialog = exports.VehicleLookupDialog = (_temp = _class = function () {
    function VehicleLookupDialog(controller, signaler, messageBus, dataSvc, notifier) {
      var _this = this;

      _classCallCheck(this, VehicleLookupDialog);

      this.database = 'quote-one';
      this.model = {};
      this.items = [];
      this.origItems = [];

      this.controller = controller;
      this.signaler = signaler;
      this.dataSvc = dataSvc;
      this.notifier = notifier;
      this.messageBus = messageBus;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    VehicleLookupDialog.prototype.activate = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(model) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.model = model;
                _context.next = 3;
                return this.getResources();

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function activate(_x) {
        return _ref.apply(this, arguments);
      }

      return activate;
    }();

    VehicleLookupDialog.prototype.getResources = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var values;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all([this.dataSvc.findById(this.database, "customers", this.model.recordId)]);

              case 2:
                values = _context2.sent;

                this.items = values[0].household_vehicles;

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getResources() {
        return _ref2.apply(this, arguments);
      }

      return getResources;
    }();

    VehicleLookupDialog.prototype.selectRecord = function selectRecord(record) {
      this.items.forEach(function (r) {
        return r.isSelected = false;
      });
      record.isSelected = true;
      this.currentItem = record;
    };

    return VehicleLookupDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaTemplatingResources.BindingSignaler, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('dialogs/vehicle-lookup-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>Vehicle Lookup</span></h4></ux-dialog-header><ux-dialog-body><div class=\"flex-1 table-response\"><table class=\"table-condensed table vehicle-lookup-table\"><thead class=table-header-blue><tr><th>VIN</th><th>Year</th><th>Make</th><th>Model</th><th>Description</th><th>Custom Equ.</th><th>Add Elec</th><th>Veh Use</th></tr></thead><tbody><tr repeat.for=\"row of items\" class=\"${row.isSelected ? 'is-selected' : ''}\" click.delegate=selectRecord(row)><td>${row.vin}</td><td>${row.year}</td><td>${row.make}</td><td>${row.model}</td><td>${row.description}</td><td>${row.custom_equipment_type}</td><td>${row.additional_electronic_type}</td><td>${row.vehicle_use_code}</td></tr></tbody></table></div><div class=\"flex-none text-center\"></div></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/vehicle-dialog',['exports', 'aurelia-dialog', 'aurelia-event-aggregator', '../services/data-service', '../services/session-service', '../resources/elements/notifier/notifier', './lookup-dialog'], function (exports, _aureliaDialog, _aureliaEventAggregator, _dataService, _sessionService, _notifier, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VehicleDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var VehicleDialog = exports.VehicleDialog = (_temp = _class = function () {
    function VehicleDialog(controller, messageBus, dialogSvc, dataSvc, sessionSvc, notifier) {
      _classCallCheck(this, VehicleDialog);

      this.model = {};
      this.isReadonly = false;

      this.controller = controller;
      this.messageBus = messageBus;
      this.dialogSvc = dialogSvc;
      this.dataSvc = dataSvc;
      this.sessionSvc = sessionSvc;
      this.notifier = notifier;
    }

    VehicleDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.currentItem = model.data;
      if (model.isReadonly) {
        this.isReadonly = model.isReadonly;
      }
      this.lookups = model.lookups;
    };

    VehicleDialog.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    VehicleDialog.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    VehicleDialog.prototype.selectChange = function selectChange(e, key, title) {
      if (e.key === 'F3' && this.sessionSvc.user.roles.includes('admin')) {
        var model = {
          data: {
            database: 'quote-one',
            collection: 'lookups',
            header: title,
            lookupName: key,
            currentLookup: this.getLookup(key)
          }
        };
        console.debug('lookups', this.dialogSvc);
        var options = { viewModel: _lookupDialog.LookupDialog, model: model };
        this.dialogSvc.open(options).whenClosed(function (response) {
          if (!response.wasCancelled) {} else {}
        });
      } else {
        return true;
      }
    };

    return VehicleDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _dataService.DataService, _sessionService.SessionService, _notifier.Notifier], _temp);
});
define('dialogs/vehicle-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>${model.header} - ${currentItem.year} ${currentItem.make} ${currentItem.model}</span></h4></ux-dialog-header><ux-dialog-body><form class=customer-view><vehicle-info current-item.two-way=currentItem lookups.bind=lookups is-readonly.bind=isReadonly></vehicle-info></form></ux-dialog-body><ux-dialog-footer><button show.bind=!isReadonly class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button show.bind=!isReadonly class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button><button show.bind=isReadonly class=\"btn btn-primary btn-dlg\" click.trigger=controller.cancel()>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/user-settings-dialog',['exports', 'aurelia-dialog', '../services/session-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _sessionService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UserSettingsDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var UserSettingsDialog = exports.UserSettingsDialog = (_temp = _class = function () {
    function UserSettingsDialog(dialogSvc, controller, sessionSvc, notifier) {
      _classCallCheck(this, UserSettingsDialog);

      this.model = {};

      this.dialogSvc = dialogSvc;
      this.controller = controller;
      this.sessionSvc = sessionSvc;
      this.notifier = notifier;
    }

    UserSettingsDialog.prototype.activate = function activate(model) {
      this.model = model;
      console.debug('users-settings-dialog:sessionSvc', this.sessionSvc);
    };

    UserSettingsDialog.prototype.logout = function logout() {
      this.controller.ok(true);
      this.sessionSvc.logout();
    };

    return UserSettingsDialog;
  }(), _class.inject = [_aureliaDialog.DialogService, _aureliaDialog.DialogController, _sessionService.SessionService, _notifier.Notifier], _temp);
});
define('dialogs/user-settings-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><div class=flex-row-none><div class=flex-row-1><h4>User Settings</h4></div><div class=\"flex-row-1 justify-content-end align-items-center\"><gravatar credential=\"${sessionSvc.user.email}\" size=64></gravatar></div></div></ux-dialog-header><ux-dialog-body><form lpformnum=1><div class=form-group><label class=\"\">Username</label><input class=form-control value.bind=sessionSvc.user.username readonly></div><div class=form-group><label class=\"\">Email</label><input class=form-control value.bind=sessionSvc.user.email readonly></div></form></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>Cancel</button><button class=\"btn btn-primary btn-dlg\" click.trigger=logout()>Logout</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/submit-dialog',['exports', 'aurelia-templating-resources', 'aurelia-dialog'], function (exports, _aureliaTemplatingResources, _aureliaDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SubmitDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var SubmitDialog = exports.SubmitDialog = (_temp = _class = function () {
    function SubmitDialog(signaler, controller) {
      _classCallCheck(this, SubmitDialog);

      this.model = {};
      this.carriers = [];
      this.autoRun = false;
      this.canSubmit = false;

      this.signaler = signaler;
      this.controller = controller;
      this.init();
    }

    SubmitDialog.prototype.init = function init() {
      this.carriers = [{ name: "Diaryland", isSelected: false }, { name: "Discovery", isSelected: false }, { name: "National General", isSelected: false }, { name: "Progressive", isSelected: false }, { name: "Southern", isSelected: false }];
    };

    SubmitDialog.prototype.activate = function activate(model) {
      this.model = model;
    };

    SubmitDialog.prototype.toggleSelect = function toggleSelect($index, item) {
      item.isSelected = !item.isSelected;
      var selectedItems = this.carriers.filter(function (c) {
        return c.isSelected;
      });
      console.log('selectedItems', selectedItems);
      if (selectedItems && selectedItems.length > 0) {
        this.canSubmit = true;
      } else {
        this.canSubmit = false;
      }
      this.signaler.signal('binding-signal');
      return true;
    };

    SubmitDialog.prototype.submit = function submit() {
      this.controller.ok(true);
    };

    return SubmitDialog;
  }(), _class.inject = [_aureliaTemplatingResources.BindingSignaler, _aureliaDialog.DialogController], _temp);
});
define('dialogs/submit-dialog.html!text', ['module'], function(module) { module.exports = "<template><require from=./submit-dialog.css></require><ux-dialog class=submit-dialog><ux-dialog-header><h4>Submit Quote to Carriers</h4></ux-dialog-header><ux-dialog-body><form><h5>Select Carriers to Quote</h5><ul><li repeat.for=\"item of carriers\" click.delegate=\"toggleSelect($index, item)\"><div class=flex><span class=\"flex-column-1 user-select-none\">${item.name}</span><input class=flex-none type=checkbox checked.bind=item.isSelected></div></li></ul><h5>Auto-run?</h5><input type=checkbox checked.bind=autoRun></form></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>Cancel</button><button class=\"btn btn-primary btn-dlg\" click.trigger=submit() disabled.bind=\"!canSubmit & signal:'binding-signal'\">OK</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/submit-dialog.css!text', ['module'], function(module) { module.exports = ".submit-dialog {\n\n}\n\n.submit-dialog ul {\n  list-style: none;\n  padding-left: 0;\n}\n.submit-dialog ul li {\n  padding-top: 2px;\n  padding-bottom: 2px;\n  padding-right: 10px;\n  padding-left: 10px;  \n}\n.submit-dialog ul li:hover {\n  background-color: lightgray;\n}\n\n.submit-dialog ul li input {\n  /* float: right; */\n}"; });
define('dialogs/note-dialog',['exports', 'aurelia-dialog', 'aurelia-event-aggregator', '../services/data-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _aureliaEventAggregator, _dataService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NoteDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var NoteDialog = exports.NoteDialog = (_temp = _class = function () {
    function NoteDialog(controller, messageBus, dataSvc, notifier) {
      _classCallCheck(this, NoteDialog);

      this.model = {};

      this.controller = controller;
      this.dataSvc = dataSvc;
      this.notifier = notifier;
      this.messageBus = messageBus;
    }

    NoteDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.currentItem = model.data;
      this.lookups = model.lookups;
    };

    NoteDialog.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    return NoteDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('dialogs/note-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>${model.header} ${model.isNew ? '' : '(VIEW ONLY)'}</span></h4></ux-dialog-header><ux-dialog-body><form class=customer-view><div class=form-group><label for=note>Note</label><textarea id=note class=form-control value.bind=currentItem.note cols=70 rows=16 readonly.bind=!model.isNew set-focus>\n          </textarea></div></form></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/member-lookup-dialog',['exports', 'aurelia-dialog', 'aurelia-templating-resources', 'aurelia-event-aggregator', '../services/data-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _aureliaTemplatingResources, _aureliaEventAggregator, _dataService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MemberLookupDialog = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var MemberLookupDialog = exports.MemberLookupDialog = (_temp = _class = function () {
    function MemberLookupDialog(controller, signaler, messageBus, dataSvc, notifier) {
      var _this = this;

      _classCallCheck(this, MemberLookupDialog);

      this.database = 'quote-one';
      this.model = {};
      this.items = [];
      this.origItems = [];

      this.controller = controller;
      this.signaler = signaler;
      this.dataSvc = dataSvc;
      this.notifier = notifier;
      this.messageBus = messageBus;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    MemberLookupDialog.prototype.activate = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(model) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.model = model;
                _context.next = 3;
                return this.getResources();

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function activate(_x) {
        return _ref.apply(this, arguments);
      }

      return activate;
    }();

    MemberLookupDialog.prototype.getResources = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var values;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all([this.dataSvc.findById(this.database, "customers", this.model.recordId)]);

              case 2:
                values = _context2.sent;

                this.items = values[0].household_members;

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getResources() {
        return _ref2.apply(this, arguments);
      }

      return getResources;
    }();

    MemberLookupDialog.prototype.selectRecord = function selectRecord(record) {
      this.items.forEach(function (r) {
        return r.isSelected = false;
      });
      record.isSelected = true;
      this.currentItem = record;
    };

    return MemberLookupDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaTemplatingResources.BindingSignaler, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('dialogs/member-lookup-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>Member Lookup</span></h4></ux-dialog-header><ux-dialog-body><div class=\"flex-1 table-response\"><table class=\"table-condensed table member-lookup-table\"><thead class=table-header-blue><tr><th>First</th><th>Last</th><th>DOB</th><th>Lic. #</th><th>Lic. Dt</th><th>Lic. State</th></tr></thead><tbody><tr repeat.for=\"row of items\" class=\"${row.isSelected ? 'is-selected' : ''}\" click.delegate=selectRecord(row)><td>${row.first_name}</td><td>${row.last_name}</td><td>${row.birth_date}</td><td>${row.driver.license_number}</td><td>${row.driver.license_date}</td><td>${row.driver.license_state}</td></tr></tbody></table></div><div class=\"flex-none text-center\"></div></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/member-dialog',['exports', 'aurelia-dialog', 'aurelia-event-aggregator', '../services/data-service', '../services/session-service', '../resources/elements/notifier/notifier', './lookup-dialog'], function (exports, _aureliaDialog, _aureliaEventAggregator, _dataService, _sessionService, _notifier, _lookupDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MemberDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var MemberDialog = exports.MemberDialog = (_temp = _class = function () {
    function MemberDialog(controller, messageBus, dialogSvc, dataSvc, sessionSvc, notifier) {
      _classCallCheck(this, MemberDialog);

      this.model = {};
      this.isReadonly = false;

      this.controller = controller;
      this.messageBus = messageBus;
      this.dialogSvc = dialogSvc;
      this.dataSvc = dataSvc;
      this.sessionSvc = sessionSvc;
      this.notifier = notifier;
    }

    MemberDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.currentItem = model.data;
      if (model.isReadonly) {
        this.isReadonly = model.isReadonly;
      }
      this.lookups = model.lookups;
    };

    MemberDialog.prototype.getLookup = function getLookup(name) {
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      return lookup;
    };

    MemberDialog.prototype.getLookupItems = function getLookupItems(name) {
      if (!this.lookups) return [];
      var lookup = this.lookups.find(function (l) {
        return l.name === name;
      });
      if (lookup && lookup.fields) return lookup.fields;
      return [];
    };

    MemberDialog.prototype.selectChange = function selectChange(e, key, title) {
      if (e.key === 'F3' && this.sessionSvc.user.roles.includes('admin')) {
        var model = {
          data: {
            database: 'quote-one',
            collection: 'lookups',
            header: title,
            lookupName: key,
            currentLookup: this.getLookup(key)
          }
        };
        console.debug('lookups', this.dialogSvc);
        var options = { viewModel: _lookupDialog.LookupDialog, model: model };
        this.dialogSvc.open(options).whenClosed(function (response) {
          if (!response.wasCancelled) {}
        });
      } else {
        return true;
      }
    };

    MemberDialog.prototype.disabled = function disabled(value) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return !args.includes(value);
    };

    return MemberDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _dataService.DataService, _sessionService.SessionService, _notifier.Notifier], _temp);
});
define('dialogs/member-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>${model.header} - ${currentItem.first_name} ${currentItem.last_name}</span></h4></ux-dialog-header><ux-dialog-body><form class=customer-view><personal-info current-item.two-way=currentItem lookups.bind=lookups is-readonly.bind=isReadonly></personal-info><driver-info current-item.two-way=currentItem.driver lookups.bind=lookups is-readonly.bind=isReadonly></driver-info></form></ux-dialog-body><ux-dialog-footer><button show.bind=!isReadonly class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button show.bind=!isReadonly class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button><button show.bind=isReadonly class=\"btn btn-primary btn-dlg\" click.trigger=controller.cancel()>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/lookup-dialog',['exports', 'aurelia-dialog', 'aurelia-event-aggregator', '../services/data-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _aureliaEventAggregator, _dataService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LookupDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var LookupDialog = exports.LookupDialog = (_temp = _class = function () {
    function LookupDialog(controller, messageBus, dataService, notifier) {
      var _this = this;

      _classCallCheck(this, LookupDialog);

      this.model = {};
      this.items = [];
      this.origItems = [];

      this.controller = controller;
      this.dataService = dataService;
      this.notifier = notifier;
      this.messageBus = messageBus;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    LookupDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.database = model.data.database;
      this.collection = model.data.collection;
      this.items = model.data.currentLookup.fields;
    };

    LookupDialog.prototype.addRecord = function addRecord() {
      this.items.push({ name: 'Test', value: 'test' });
    };

    LookupDialog.prototype.removeRecord = function removeRecord(index, item) {
      this.items.splice(index, 1);
    };

    LookupDialog.prototype.save = function save() {
      var _this2 = this;

      console.log('save', this.model.data.currentLookup);
      console.log('database', this.database, 'collection', this.collection);

      this.dataService.save(this.database, this.collection, this.model.data.currentLookup).then(function (response) {
        _this2.notifier.growl({ message: 'Save complete!' });
        _this2.controller.ok(true);
      });
    };

    return LookupDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('dialogs/lookup-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>${model.data.header}</span><button class=\"btn btn-success pull-right\" click.delegate=addRecord() style=margin-bottom:-3px><span class=\"glyphicon glyphicon-plus\"></span><span class=\"\">Add New</span></button></h4></ux-dialog-header><ux-dialog-body><div class=table-response><table tag=\"lookup table\" class=\"table-condensed table\"><thead><tr><th class=\"\">Name</th><th class=\"\">Value</th><th class=\"\"></th></tr></thead><tbody><tr repeat.for=\"row of items\"><td class=\"\"><input class=form-control placeholder=Name value.bind=row.name></td><td class=\"\"><input class=form-control placeholder=Value value.bind=row.value></td><td class=\"\"><div class=\"col-xs-1 align-bottom\"><button class=\"btn btn-danger btn-sm\" click.delegate=\"removeRecord($index, row)\" style=margin-bottom:-3px><span class=\"glyphicon glyphicon-trash\"></span></button></div></td></tr></tbody></table></div><div class=\"col-xs-12 text-center\"></div></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=save()>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/customer-dialog',['exports', 'aurelia-dialog', 'aurelia-templating-resources', 'aurelia-event-aggregator', '../services/data-service', '../resources/elements/notifier/notifier'], function (exports, _aureliaDialog, _aureliaTemplatingResources, _aureliaEventAggregator, _dataService, _notifier) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CustomerDialog = undefined;

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var CustomerDialog = exports.CustomerDialog = (_temp = _class = function () {
    function CustomerDialog(controller, signaler, messageBus, dataSvc, notifier) {
      var _this = this;

      _classCallCheck(this, CustomerDialog);

      this.database = 'quote-one';
      this.model = {};
      this.items = [];
      this.origItems = [];

      this.controller = controller;
      this.signaler = signaler;
      this.dataSvc = dataSvc;
      this.notifier = notifier;
      this.messageBus = messageBus;

      this.messageBus.subscribe('data-pager:page', function (payload) {
        var startIndex = payload.currentPage * payload.pageSize;
        var amount = payload.pageSize;
        _this.items = _this.origItems.filter(function (item, index) {
          return index >= startIndex && index < startIndex + amount;
        });
      });
    }

    CustomerDialog.prototype.activate = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(model) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.model = model;
                _context.next = 3;
                return this.getResources();

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function activate(_x) {
        return _ref.apply(this, arguments);
      }

      return activate;
    }();

    CustomerDialog.prototype.getResources = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var values;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all([this.dataSvc.findAll(this.database, "customers", null, { name: 1 })]);

              case 2:
                values = _context2.sent;

                this.items = values[0];

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getResources() {
        return _ref2.apply(this, arguments);
      }

      return getResources;
    }();

    CustomerDialog.prototype.selectRecord = function selectRecord(record) {
      this.items.forEach(function (r) {
        return r.isSelected = false;
      });
      record.isSelected = true;
      this.currentItem = record;
    };

    return CustomerDialog;
  }(), _class.inject = [_aureliaDialog.DialogController, _aureliaTemplatingResources.BindingSignaler, _aureliaEventAggregator.EventAggregator, _dataService.DataService, _notifier.Notifier], _temp);
});
define('dialogs/customer-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><span class=user-select-none>Customer Lookup</span><button class=\"btn btn-success pull-right\" click.delegate=addRecord() style=margin-bottom:-3px><span class=\"glyphicon glyphicon-plus\"></span><span class=\"\">Add New</span></button></h4></ux-dialog-header><ux-dialog-body><div class=\"flex-1 table-response\"><table class=\"table-condensed table customer-lookup-table\"><thead><tr><th class=\"\">First Name</th><th class=\"\">Last Name</th><th class=\"\">Email</th><th class=\"\">Home Phone</th><th class=\"\">Street</th><th class=\"\">City</th><th class=\"\">State</th></tr></thead><tbody><tr repeat.for=\"row of items\" class=\"${row.isSelected ? 'is-selected' : ''}\" click.delegate=selectRecord(row)><td class=\"\">${row.first_name}</td><td class=\"\">${row.last_name}</td><td class=\"\">${row.contact.email}</td><td class=\"\">${row.contact.home_number}</td><td class=\"\">${row.address.street}</td><td class=\"\">${row.address.city}</td><td class=\"\">${row.address.state}</td></tr></tbody></table></div><div class=\"flex-none text-center\"></div></ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>${model.cancel || 'Cancel'}</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(currentItem)>${model.ok || 'OK'}</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/confirm-delete',['exports', 'aurelia-dialog'], function (exports, _aureliaDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ConfirmDelete = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var ConfirmDelete = exports.ConfirmDelete = (_temp = _class = function () {
    function ConfirmDelete(controller) {
      _classCallCheck(this, ConfirmDelete);

      this.model = {};

      this.controller = controller;
    }

    ConfirmDelete.prototype.activate = function activate(model) {
      this.model = model;
    };

    return ConfirmDelete;
  }(), _class.inject = [_aureliaDialog.DialogController], _temp);
});
define('dialogs/confirm-delete.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header>${model.header}</ux-dialog-header><ux-dialog-body> ${model.prompt} </ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>Cancel</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(true)>OK</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/confirm-delete-dialog',['exports', 'aurelia-dialog'], function (exports, _aureliaDialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ConfirmDeleteDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var ConfirmDeleteDialog = exports.ConfirmDeleteDialog = (_temp = _class = function () {
    function ConfirmDeleteDialog(controller) {
      _classCallCheck(this, ConfirmDeleteDialog);

      this.model = {};

      this.controller = controller;
    }

    ConfirmDeleteDialog.prototype.activate = function activate(model) {
      this.model = model;
    };

    return ConfirmDeleteDialog;
  }(), _class.inject = [_aureliaDialog.DialogController], _temp);
});
define('dialogs/confirm-delete-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header>${model.header}</ux-dialog-header><ux-dialog-body> ${model.prompt} </ux-dialog-body><ux-dialog-footer><button class=\"btn btn-default btn-dlg\" click.trigger=controller.cancel()>Cancel</button><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(true)>OK</button></ux-dialog-footer></ux-dialog></template>"; });
define('dialogs/address-dialog',['exports', 'aurelia-dialog', '../services/google-address-service'], function (exports, _aureliaDialog, _googleAddressService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AddressDialog = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var AddressDialog = exports.AddressDialog = (_temp = _class = function () {
    function AddressDialog(controller) {
      _classCallCheck(this, AddressDialog);

      this.model = {};

      this.controller = controller;
    }

    AddressDialog.prototype.activate = function activate(model) {
      this.model = model;
      this.googleAddressSvc = new _googleAddressService.GoogleAddressService();
    };

    AddressDialog.prototype.attached = function attached() {
      this.googleAddressSvc.init('#autocomplete', this.model.data);
    };

    AddressDialog.prototype.detached = function detached() {
      this.googleAddressSvc.unload();
    };

    AddressDialog.prototype.save = function save(e, record) {
      this.controller.ok(true);
    };

    return AddressDialog;
  }(), _class.inject = [_aureliaDialog.DialogController], _temp);
});
define('dialogs/address-dialog.html!text', ['module'], function(module) { module.exports = "<template><ux-dialog class=\"drag-container drag-item\"><ux-dialog-header class=\"\">${model.header}</ux-dialog-header><ux-dialog-body class=\"\"><form id=addressDialog class=width-350><div class=form-group><label for=autocomplete class=\"\">${model.address}</label><input id=autocomplete class=form-control placeholder=Search... set-focus=\"\" focus.delegate=googleAddressService.geolocate()></div></form></ux-dialog-body><ux-dialog-footer class=\"\"><button class=\"btn btn-primary btn-dlg\" click.trigger=controller.ok(true)>${model.close}</button></ux-dialog-footer></ux-dialog></template>"; });
define('assets/css/layout.css!text', ['module'], function(module) { module.exports = ".display-none { display: none; }\n\n.full-height { height: 100%; }\n.height-0 { height: 0; }\n.height-5 { height: 5px; }\n.height-10 { height: 10px; }\n.height-15 { height: 15px; }\n.height-20 { height: 20px; }\n.height-25 { height: 25px; }\n.height-30 { height: 30px; }\n.height-35 { height: 35px; }\n.height-40 { height: 40px; }\n.height-45 { height: 45px; }\n.height-50 { height: 50px; }\n.height-55 { height: 55px; }\n.height-60 { height: 60px; }\n.height-65 { height: 65px; }\n.height-70 { height: 70px; }\n.height-75 { height: 75px; }\n.height-80 { height: 80px; }\n.height-85 { height: 85px; }\n.height-90 { height: 90px; }\n.height-95 { height: 95px; }\n.height-100 { height: 100px; }\n.height-105 { height: 105px; }\n.height-110 { height: 110px; }\n.height-115 { height: 115px; }\n.height-120 { height: 120px; }\n.height-125 { height: 125px; }\n.height-130 { height: 130px; }\n.height-135 { height: 135px; }\n.height-140 { height: 140px; }\n.height-145 { height: 145px; }\n.height-150 { height: 150px; }\n.height-155 { height: 155px; }\n.height-160 { height: 160px; }\n.height-165 { height: 165px; }\n.height-170 { height: 170px; }\n.height-175 { height: 175px; }\n.height-200 { height: 200px; }\n.height-300 { height: 300px; }\n.height-400 { height: 400px; }\n.height-500 { height: 500px; }\n.height-600 { height: 600px; }\n\n.full-width { width: 100%; }\n.width-0 { width: 0; }\n.width-5 { width: 5px; }\n.width-10 { width: 10px; }\n.width-15 { width: 15px; }\n.width-20 { width: 20px; }\n.width-25 { width: 25px; }\n.width-30 { width: 30px; }\n.width-35 { width: 35px; }\n.width-40 { width: 40px; }\n.width-45 { width: 45px; }\n.width-50 { width: 50px; }\n.width-55 { width: 55px; }\n.width-60 { width: 60px; }\n.width-65 { width: 65px; }\n.width-70 { width: 70px; }\n.width-75 { width: 75px; }\n.width-80 { width: 80px; }\n.width-85 { width: 85px; }\n.width-90 { width: 90px; }\n.width-95 { width: 95px; }\n.width-100 { width: 100px; }\n.width-105 { width: 105px; }\n.width-110 { width: 110px; }\n.width-115 { width: 115px; }\n.width-120 { width: 120px; }\n.width-125 { width: 125px; }\n.width-130 { width: 130px; }\n.width-135 { width: 135px; }\n.width-140 { width: 140px; }\n.width-145 { width: 145px; }\n.width-150 { width: 150px; }\n.width-155 { width: 155px; }\n.width-160 { width: 160px; }\n.width-165 { width: 165px; }\n.width-170 { width: 170px; }\n.width-175 { width: 175px; }\n.width-180 { width: 180px; }\n.width-185 { width: 185px; }\n.width-190 { width: 190px; }\n.width-195 { width: 195px; }\n.width-200 { width: 200px; }\n.width-205 { width: 205px; }\n.width-210 { width: 210px; }\n.width-215 { width: 215px; }\n.width-220 { width: 220px; }\n.width-225 { width: 225px; }\n.width-230 { width: 230px; }\n.width-235 { width: 235px; }\n.width-240 { width: 240px; }\n.width-245 { width: 245px; }\n.width-250 { width: 250px; }\n.width-300 { width: 300px; }\n.width-350 { width: 350px; }\n.width-400 { width: 400px; }\n.width-450 { width: 450px; }\n.width-500 { width: 500px; }\n.width-550 { width: 550px; }\n.width-600 { width: 600px; }\n.width-650 { width: 650px; }\n.width-700 { width: 700px; }\n.width-750 { width: 750px; }\n.width-800 { width: 800px; }\n.width-850 { width: 850px; }\n.width-900 { width: 900px; }\n.width-950 { width: 950px; }\n\n.min-max-width-5 { min-width: 5px; max-width: 5px; }\n.min-max-width-10 { min-width: 10px; max-width: 10px; }\n.min-max-width-15 { min-width: 15px; max-width: 15px; }\n.min-max-width-20 { min-width: 20px; max-width: 20px; }\n.min-max-width-25 { min-width: 25px; max-width: 25px; }\n.min-max-width-30 { min-width: 30px; max-width: 30px; }\n.min-max-width-35 { min-width: 35px; max-width: 35px; }\n.min-max-width-40 { min-width: 40px; max-width: 40px; }\n.min-max-width-45 { min-width: 45px; max-width: 45px; }\n.min-max-width-50 { min-width: 50px; max-width: 50px; }\n.min-max-width-55 { min-width: 55px; max-width: 55px; }\n.min-max-width-60 { min-width: 60px; max-width: 60px; }\n.min-max-width-65 { min-width: 65px; max-width: 65px; }\n.min-max-width-70 { min-width: 70px; max-width: 70px; }\n.min-max-width-75 { min-width: 75px; max-width: 75px; }\n.min-max-width-80 { min-width: 80px; max-width: 80px; }\n.min-max-width-85 { min-width: 85px; max-width: 85px; }\n.min-max-width-90 { min-width: 90px; max-width: 90px; }\n.min-max-width-95 { min-width: 95px; max-width: 95px; }\n.min-max-width-100 { min-width: 100px; max-width: 100px; }\n.min-max-width-105 { min-width: 105px; max-width: 105px; }\n.min-max-width-110 { min-width: 110px; max-width: 110px; }\n.min-max-width-115 { min-width: 115px; max-width: 115px; }\n.min-max-width-120 { min-width: 120px; max-width: 120px; }\n.min-max-width-125 { min-width: 125px; max-width: 125px; }\n.min-max-width-130 { min-width: 130px; max-width: 130px; }\n.min-max-width-135 { min-width: 135px; max-width: 135px; }\n.min-max-width-140 { min-width: 140px; max-width: 140px; }\n.min-max-width-145 { min-width: 145px; max-width: 145px; }\n.min-max-width-150 { min-width: 150px; max-width: 150px; }\n.min-max-width-155 { min-width: 155px; max-width: 155px; }\n.min-max-width-160 { min-width: 160px; max-width: 160px; }\n.min-max-width-165 { min-width: 165px; max-width: 165px; }\n.min-max-width-170 { min-width: 170px; max-width: 170px; }\n.min-max-width-175 { min-width: 175px; max-width: 175px; }\n.min-max-width-180 { min-width: 180px; max-width: 180px; }\n.min-max-width-185 { min-width: 185px; max-width: 185px; }\n.min-max-width-190 { min-width: 190px; max-width: 190px; }\n.min-max-width-195 { min-width: 195px; max-width: 195px; }\n.min-max-width-200 { min-width: 200px; max-width: 200px; }\n.min-max-width-205 { min-width: 205px; max-width: 205px; }\n.min-max-width-210 { min-width: 210px; max-width: 210px; }\n.min-max-width-215 { min-width: 215px; max-width: 215px; }\n.min-max-width-220 { min-width: 220px; max-width: 220px; }\n.min-max-width-225 { min-width: 225px; max-width: 225px; }\n.min-max-width-230 { min-width: 230px; max-width: 230px; }\n.min-max-width-235 { min-width: 235px; max-width: 235px; }\n.min-max-width-240 { min-width: 240px; max-width: 240px; }\n.min-max-width-245 { min-width: 245px; max-width: 245px; }\n.min-max-width-250 { min-width: 250px; max-width: 250px; }\n.min-max-width-255 { min-width: 255px; max-width: 255px; }\n.min-max-width-260 { min-width: 260px; max-width: 260px; }\n.min-max-width-265 { min-width: 265px; max-width: 265px; }\n.min-max-width-270 { min-width: 270px; max-width: 270px; }\n.min-max-width-275 { min-width: 275px; max-width: 275px; }\n.min-max-width-280 { min-width: 280px; max-width: 280px; }\n.min-max-width-285 { min-width: 285px; max-width: 285px; }\n.min-max-width-290 { min-width: 290px; max-width: 290px; }\n.min-max-width-295 { min-width: 295px; max-width: 295px; }\n.min-max-width-300 { min-width: 300px; max-width: 300px; }\n.min-max-width-305 { min-width: 305px; max-width: 305px; }\n.min-max-width-310 { min-width: 310px; max-width: 310px; }\n.min-max-width-315 { min-width: 315px; max-width: 315px; }\n.min-max-width-320 { min-width: 320px; max-width: 320px; }\n.min-max-width-325 { min-width: 325px; max-width: 325px; }\n.min-max-width-330 { min-width: 330px; max-width: 330px; }\n.min-max-width-335 { min-width: 335px; max-width: 335px; }\n.min-max-width-340 { min-width: 340px; max-width: 340px; }\n.min-max-width-345 { min-width: 345px; max-width: 345px; }\n.min-max-width-350 { min-width: 350px; max-width: 350px; }\n.min-max-width-355 { min-width: 355px; max-width: 355px; }\n.min-max-width-360 { min-width: 360px; max-width: 360px; }\n.min-max-width-365 { min-width: 365px; max-width: 365px; }\n.min-max-width-370 { min-width: 370px; max-width: 370px; }\n.min-max-width-375 { min-width: 375px; max-width: 375px; }\n.min-max-width-380 { min-width: 380px; max-width: 380px; }\n.min-max-width-385 { min-width: 385px; max-width: 385px; }\n.min-max-width-390 { min-width: 390px; max-width: 390px; }\n.min-max-width-395 { min-width: 395px; max-width: 395px; }\n.min-max-width-400 { min-width: 400px; max-width: 400px; }\n.min-max-width-405 { min-width: 405px; max-width: 405px; }\n.min-max-width-410 { min-width: 410px; max-width: 410px; }\n.min-max-width-415 { min-width: 415px; max-width: 415px; }\n.min-max-width-420 { min-width: 420px; max-width: 420px; }\n.min-max-width-425 { min-width: 425px; max-width: 425px; }\n.min-max-width-430 { min-width: 430px; max-width: 430px; }\n.min-max-width-435 { min-width: 435px; max-width: 435px; }\n.min-max-width-440 { min-width: 440px; max-width: 440px; }\n.min-max-width-445 { min-width: 445px; max-width: 445px; }\n.min-max-width-450 { min-width: 450px; max-width: 450px; }\n.min-max-width-455 { min-width: 455px; max-width: 455px; }\n.min-max-width-460 { min-width: 460px; max-width: 460px; }\n.min-max-width-465 { min-width: 465px; max-width: 465px; }\n.min-max-width-470 { min-width: 470px; max-width: 470px; }\n.min-max-width-475 { min-width: 475px; max-width: 475px; }\n.min-max-width-480 { min-width: 480px; max-width: 480px; }\n.min-max-width-485 { min-width: 485px; max-width: 485px; }\n.min-max-width-490 { min-width: 490px; max-width: 490px; }\n.min-max-width-495 { min-width: 495px; max-width: 495px; }\n.min-max-width-500 { min-width: 500px; max-width: 500px; }\n.min-max-width-505 { min-width: 505px; max-width: 505px; }\n.min-max-width-510 { min-width: 510px; max-width: 510px; }\n.min-max-width-515 { min-width: 515px; max-width: 515px; }\n.min-max-width-520 { min-width: 520px; max-width: 520px; }\n.min-max-width-525 { min-width: 525px; max-width: 525px; }\n.min-max-width-530 { min-width: 530px; max-width: 530px; }\n.min-max-width-535 { min-width: 535px; max-width: 535px; }\n.min-max-width-540 { min-width: 540px; max-width: 540px; }\n.min-max-width-545 { min-width: 545px; max-width: 545px; }\n.min-max-width-550 { min-width: 550px; max-width: 550px; }\n.min-max-width-555 { min-width: 555px; max-width: 555px; }\n.min-max-width-560 { min-width: 560px; max-width: 560px; }\n.min-max-width-565 { min-width: 565px; max-width: 565px; }\n.min-max-width-570 { min-width: 570px; max-width: 570px; }\n.min-max-width-575 { min-width: 575px; max-width: 575px; }\n.min-max-width-580 { min-width: 580px; max-width: 580px; }\n.min-max-width-585 { min-width: 585px; max-width: 585px; }\n.min-max-width-590 { min-width: 590px; max-width: 590px; }\n.min-max-width-595 { min-width: 595px; max-width: 595px; }\n.min-max-width-600 { min-width: 600px; max-width: 600px; }\n.min-max-width-605 { min-width: 605px; max-width: 605px; }\n.min-max-width-610 { min-width: 610px; max-width: 610px; }\n.min-max-width-615 { min-width: 615px; max-width: 615px; }\n.min-max-width-620 { min-width: 620px; max-width: 620px; }\n.min-max-width-625 { min-width: 625px; max-width: 625px; }\n.min-max-width-630 { min-width: 630px; max-width: 630px; }\n.min-max-width-635 { min-width: 635px; max-width: 635px; }\n.min-max-width-640 { min-width: 640px; max-width: 640px; }\n.min-max-width-645 { min-width: 645px; max-width: 645px; }\n.min-max-width-650 { min-width: 650px; max-width: 650px; }\n.min-max-width-655 { min-width: 655px; max-width: 655px; }\n.min-max-width-660 { min-width: 660px; max-width: 660px; }\n.min-max-width-665 { min-width: 665px; max-width: 665px; }\n.min-max-width-670 { min-width: 670px; max-width: 670px; }\n.min-max-width-675 { min-width: 675px; max-width: 675px; }\n.min-max-width-680 { min-width: 680px; max-width: 680px; }\n.min-max-width-685 { min-width: 685px; max-width: 685px; }\n.min-max-width-690 { min-width: 690px; max-width: 690px; }\n.min-max-width-695 { min-width: 695px; max-width: 695px; }\n.min-max-width-700 { min-width: 700px; max-width: 700px; }\n.min-max-width-705 { min-width: 705px; max-width: 705px; }\n.min-max-width-710 { min-width: 710px; max-width: 710px; }\n.min-max-width-715 { min-width: 715px; max-width: 715px; }\n.min-max-width-720 { min-width: 720px; max-width: 720px; }\n.min-max-width-725 { min-width: 725px; max-width: 725px; }\n.min-max-width-730 { min-width: 730px; max-width: 730px; }\n.min-max-width-735 { min-width: 735px; max-width: 735px; }\n.min-max-width-740 { min-width: 740px; max-width: 740px; }\n.min-max-width-745 { min-width: 745px; max-width: 745px; }\n.min-max-width-750 { min-width: 750px; max-width: 750px; }\n.min-max-width-755 { min-width: 755px; max-width: 755px; }\n.min-max-width-760 { min-width: 760px; max-width: 760px; }\n.min-max-width-765 { min-width: 765px; max-width: 765px; }\n.min-max-width-770 { min-width: 770px; max-width: 770px; }\n.min-max-width-775 { min-width: 775px; max-width: 775px; }\n.min-max-width-780 { min-width: 780px; max-width: 780px; }\n.min-max-width-785 { min-width: 785px; max-width: 785px; }\n.min-max-width-790 { min-width: 790px; max-width: 790px; }\n.min-max-width-795 { min-width: 795px; max-width: 795px; }\n.min-max-width-800 { min-width: 800px; max-width: 800px; }\n.min-max-width-805 { min-width: 805px; max-width: 805px; }\n.min-max-width-810 { min-width: 810px; max-width: 810px; }\n.min-max-width-815 { min-width: 815px; max-width: 815px; }\n.min-max-width-820 { min-width: 820px; max-width: 820px; }\n.min-max-width-825 { min-width: 825px; max-width: 825px; }\n.min-max-width-830 { min-width: 830px; max-width: 830px; }\n.min-max-width-835 { min-width: 835px; max-width: 835px; }\n.min-max-width-840 { min-width: 840px; max-width: 840px; }\n.min-max-width-845 { min-width: 845px; max-width: 845px; }\n.min-max-width-850 { min-width: 850px; max-width: 850px; }\n.min-max-width-855 { min-width: 855px; max-width: 855px; }\n.min-max-width-860 { min-width: 860px; max-width: 860px; }\n.min-max-width-865 { min-width: 865px; max-width: 865px; }\n.min-max-width-870 { min-width: 870px; max-width: 870px; }\n.min-max-width-875 { min-width: 875px; max-width: 875px; }\n.min-max-width-880 { min-width: 880px; max-width: 880px; }\n.min-max-width-885 { min-width: 885px; max-width: 885px; }\n.min-max-width-890 { min-width: 890px; max-width: 890px; }\n.min-max-width-895 { min-width: 895px; max-width: 895px; }\n.min-max-width-900 { min-width: 900px; max-width: 900px; }\n.min-max-width-905 { min-width: 905px; max-width: 905px; }\n.min-max-width-910 { min-width: 910px; max-width: 910px; }\n.min-max-width-915 { min-width: 915px; max-width: 915px; }\n.min-max-width-920 { min-width: 920px; max-width: 920px; }\n.min-max-width-925 { min-width: 925px; max-width: 925px; }\n.min-max-width-930 { min-width: 930px; max-width: 930px; }\n.min-max-width-935 { min-width: 935px; max-width: 935px; }\n.min-max-width-940 { min-width: 940px; max-width: 940px; }\n.min-max-width-945 { min-width: 945px; max-width: 945px; }\n.min-max-width-950 { min-width: 950px; max-width: 950px; }\n.min-max-width-955 { min-width: 955px; max-width: 955px; }\n.min-max-width-960 { min-width: 960px; max-width: 960px; }\n.min-max-width-965 { min-width: 965px; max-width: 965px; }\n.min-max-width-970 { min-width: 970px; max-width: 970px; }\n.min-max-width-975 { min-width: 975px; max-width: 975px; }\n.min-max-width-980 { min-width: 980px; max-width: 980px; }\n.min-max-width-985 { min-width: 985px; max-width: 985px; }\n.min-max-width-990 { min-width: 990px; max-width: 990px; }\n.min-max-width-995 { min-width: 995px; max-width: 995px; }\n\n.min-max-height-5 { min-height: 5px; max-height: 5px; }\n.min-max-height-10 { min-height: 10px; max-height: 10px; }\n.min-max-height-15 { min-height: 15px; max-height: 15px; }\n.min-max-height-20 { min-height: 20px; max-height: 20px; }\n.min-max-height-25 { min-height: 25px; max-height: 25px; }\n.min-max-height-30 { min-height: 30px; max-height: 30px; }\n.min-max-height-35 { min-height: 35px; max-height: 35px; }\n.min-max-height-40 { min-height: 40px; max-height: 40px; }\n.min-max-height-45 { min-height: 45px; max-height: 45px; }\n.min-max-height-50 { min-height: 50px; max-height: 50px; }\n.min-max-height-55 { min-height: 55px; max-height: 55px; }\n.min-max-height-60 { min-height: 60px; max-height: 60px; }\n.min-max-height-65 { min-height: 65px; max-height: 65px; }\n.min-max-height-70 { min-height: 70px; max-height: 70px; }\n.min-max-height-75 { min-height: 75px; max-height: 75px; }\n.min-max-height-80 { min-height: 80px; max-height: 80px; }\n.min-max-height-85 { min-height: 85px; max-height: 85px; }\n.min-max-height-90 { min-height: 90px; max-height: 90px; }\n.min-max-height-95 { min-height: 95px; max-height: 95px; }\n.min-max-height-100 { min-height: 100px; max-height: 100px; }\n.min-max-height-105 { min-height: 105px; max-height: 105px; }\n.min-max-height-110 { min-height: 110px; max-height: 110px; }\n.min-max-height-115 { min-height: 115px; max-height: 115px; }\n.min-max-height-120 { min-height: 120px; max-height: 120px; }\n.min-max-height-125 { min-height: 125px; max-height: 125px; }\n.min-max-height-130 { min-height: 130px; max-height: 130px; }\n.min-max-height-135 { min-height: 135px; max-height: 135px; }\n.min-max-height-140 { min-height: 140px; max-height: 140px; }\n.min-max-height-145 { min-height: 145px; max-height: 145px; }\n.min-max-height-150 { min-height: 150px; max-height: 150px; }\n.min-max-height-155 { min-height: 155px; max-height: 155px; }\n.min-max-height-160 { min-height: 160px; max-height: 160px; }\n.min-max-height-165 { min-height: 165px; max-height: 165px; }\n.min-max-height-170 { min-height: 170px; max-height: 170px; }\n.min-max-height-175 { min-height: 175px; max-height: 175px; }\n.min-max-height-180 { min-height: 180px; max-height: 180px; }\n.min-max-height-185 { min-height: 185px; max-height: 185px; }\n.min-max-height-190 { min-height: 190px; max-height: 190px; }\n.min-max-height-195 { min-height: 195px; max-height: 195px; }\n.min-max-height-200 { min-height: 200px; max-height: 200px; }\n.min-max-height-205 { min-height: 205px; max-height: 205px; }\n.min-max-height-210 { min-height: 210px; max-height: 210px; }\n.min-max-height-215 { min-height: 215px; max-height: 215px; }\n.min-max-height-220 { min-height: 220px; max-height: 220px; }\n.min-max-height-225 { min-height: 225px; max-height: 225px; }\n.min-max-height-230 { min-height: 230px; max-height: 230px; }\n.min-max-height-235 { min-height: 235px; max-height: 235px; }\n.min-max-height-240 { min-height: 240px; max-height: 240px; }\n.min-max-height-245 { min-height: 245px; max-height: 245px; }\n.min-max-height-250 { min-height: 250px; max-height: 250px; }\n.min-max-height-255 { min-height: 255px; max-height: 255px; }\n.min-max-height-260 { min-height: 260px; max-height: 260px; }\n.min-max-height-265 { min-height: 265px; max-height: 265px; }\n.min-max-height-270 { min-height: 270px; max-height: 270px; }\n.min-max-height-275 { min-height: 275px; max-height: 275px; }\n.min-max-height-280 { min-height: 280px; max-height: 280px; }\n.min-max-height-285 { min-height: 285px; max-height: 285px; }\n.min-max-height-290 { min-height: 290px; max-height: 290px; }\n.min-max-height-295 { min-height: 295px; max-height: 295px; }\n.min-max-height-300 { min-height: 300px; max-height: 300px; }\n.min-max-height-305 { min-height: 305px; max-height: 305px; }\n.min-max-height-310 { min-height: 310px; max-height: 310px; }\n.min-max-height-315 { min-height: 315px; max-height: 315px; }\n.min-max-height-320 { min-height: 320px; max-height: 320px; }\n.min-max-height-325 { min-height: 325px; max-height: 325px; }\n.min-max-height-330 { min-height: 330px; max-height: 330px; }\n.min-max-height-335 { min-height: 335px; max-height: 335px; }\n.min-max-height-340 { min-height: 340px; max-height: 340px; }\n.min-max-height-345 { min-height: 345px; max-height: 345px; }\n.min-max-height-350 { min-height: 350px; max-height: 350px; }\n.min-max-height-355 { min-height: 355px; max-height: 355px; }\n.min-max-height-360 { min-height: 360px; max-height: 360px; }\n.min-max-height-365 { min-height: 365px; max-height: 365px; }\n.min-max-height-370 { min-height: 370px; max-height: 370px; }\n.min-max-height-375 { min-height: 375px; max-height: 375px; }\n.min-max-height-380 { min-height: 380px; max-height: 380px; }\n.min-max-height-385 { min-height: 385px; max-height: 385px; }\n.min-max-height-390 { min-height: 390px; max-height: 390px; }\n.min-max-height-395 { min-height: 395px; max-height: 395px; }\n.min-max-height-400 { min-height: 400px; max-height: 400px; }\n.min-max-height-405 { min-height: 405px; max-height: 405px; }\n.min-max-height-410 { min-height: 410px; max-height: 410px; }\n.min-max-height-415 { min-height: 415px; max-height: 415px; }\n.min-max-height-420 { min-height: 420px; max-height: 420px; }\n.min-max-height-425 { min-height: 425px; max-height: 425px; }\n.min-max-height-430 { min-height: 430px; max-height: 430px; }\n.min-max-height-435 { min-height: 435px; max-height: 435px; }\n.min-max-height-440 { min-height: 440px; max-height: 440px; }\n.min-max-height-445 { min-height: 445px; max-height: 445px; }\n.min-max-height-450 { min-height: 450px; max-height: 450px; }\n.min-max-height-455 { min-height: 455px; max-height: 455px; }\n.min-max-height-460 { min-height: 460px; max-height: 460px; }\n.min-max-height-465 { min-height: 465px; max-height: 465px; }\n.min-max-height-470 { min-height: 470px; max-height: 470px; }\n.min-max-height-475 { min-height: 475px; max-height: 475px; }\n.min-max-height-480 { min-height: 480px; max-height: 480px; }\n.min-max-height-485 { min-height: 485px; max-height: 485px; }\n.min-max-height-490 { min-height: 490px; max-height: 490px; }\n.min-max-height-495 { min-height: 495px; max-height: 495px; }\n.min-max-height-500 { min-height: 500px; max-height: 500px; }\n.min-max-height-505 { min-height: 505px; max-height: 505px; }\n.min-max-height-510 { min-height: 510px; max-height: 510px; }\n.min-max-height-515 { min-height: 515px; max-height: 515px; }\n.min-max-height-520 { min-height: 520px; max-height: 520px; }\n.min-max-height-525 { min-height: 525px; max-height: 525px; }\n.min-max-height-530 { min-height: 530px; max-height: 530px; }\n.min-max-height-535 { min-height: 535px; max-height: 535px; }\n.min-max-height-540 { min-height: 540px; max-height: 540px; }\n.min-max-height-545 { min-height: 545px; max-height: 545px; }\n.min-max-height-550 { min-height: 550px; max-height: 550px; }\n.min-max-height-555 { min-height: 555px; max-height: 555px; }\n.min-max-height-560 { min-height: 560px; max-height: 560px; }\n.min-max-height-565 { min-height: 565px; max-height: 565px; }\n.min-max-height-570 { min-height: 570px; max-height: 570px; }\n.min-max-height-575 { min-height: 575px; max-height: 575px; }\n.min-max-height-580 { min-height: 580px; max-height: 580px; }\n.min-max-height-585 { min-height: 585px; max-height: 585px; }\n.min-max-height-590 { min-height: 590px; max-height: 590px; }\n.min-max-height-595 { min-height: 595px; max-height: 595px; }\n.min-max-height-600 { min-height: 600px; max-height: 600px; }\n.min-max-height-605 { min-height: 605px; max-height: 605px; }\n.min-max-height-610 { min-height: 610px; max-height: 610px; }\n.min-max-height-615 { min-height: 615px; max-height: 615px; }\n.min-max-height-620 { min-height: 620px; max-height: 620px; }\n.min-max-height-625 { min-height: 625px; max-height: 625px; }\n.min-max-height-630 { min-height: 630px; max-height: 630px; }\n.min-max-height-635 { min-height: 635px; max-height: 635px; }\n.min-max-height-640 { min-height: 640px; max-height: 640px; }\n.min-max-height-645 { min-height: 645px; max-height: 645px; }\n.min-max-height-650 { min-height: 650px; max-height: 650px; }\n.min-max-height-655 { min-height: 655px; max-height: 655px; }\n.min-max-height-660 { min-height: 660px; max-height: 660px; }\n.min-max-height-665 { min-height: 665px; max-height: 665px; }\n.min-max-height-670 { min-height: 670px; max-height: 670px; }\n.min-max-height-675 { min-height: 675px; max-height: 675px; }\n.min-max-height-680 { min-height: 680px; max-height: 680px; }\n.min-max-height-685 { min-height: 685px; max-height: 685px; }\n.min-max-height-690 { min-height: 690px; max-height: 690px; }\n.min-max-height-695 { min-height: 695px; max-height: 695px; }\n.min-max-height-700 { min-height: 700px; max-height: 700px; }\n.min-max-height-705 { min-height: 705px; max-height: 705px; }\n.min-max-height-710 { min-height: 710px; max-height: 710px; }\n.min-max-height-715 { min-height: 715px; max-height: 715px; }\n.min-max-height-720 { min-height: 720px; max-height: 720px; }\n.min-max-height-725 { min-height: 725px; max-height: 725px; }\n.min-max-height-730 { min-height: 730px; max-height: 730px; }\n.min-max-height-735 { min-height: 735px; max-height: 735px; }\n.min-max-height-740 { min-height: 740px; max-height: 740px; }\n.min-max-height-745 { min-height: 745px; max-height: 745px; }\n.min-max-height-750 { min-height: 750px; max-height: 750px; }\n.min-max-height-755 { min-height: 755px; max-height: 755px; }\n.min-max-height-760 { min-height: 760px; max-height: 760px; }\n.min-max-height-765 { min-height: 765px; max-height: 765px; }\n.min-max-height-770 { min-height: 770px; max-height: 770px; }\n.min-max-height-775 { min-height: 775px; max-height: 775px; }\n.min-max-height-780 { min-height: 780px; max-height: 780px; }\n.min-max-height-785 { min-height: 785px; max-height: 785px; }\n.min-max-height-790 { min-height: 790px; max-height: 790px; }\n.min-max-height-795 { min-height: 795px; max-height: 795px; }\n.min-max-height-800 { min-height: 800px; max-height: 800px; }\n.min-max-height-805 { min-height: 805px; max-height: 805px; }\n.min-max-height-810 { min-height: 810px; max-height: 810px; }\n.min-max-height-815 { min-height: 815px; max-height: 815px; }\n.min-max-height-820 { min-height: 820px; max-height: 820px; }\n.min-max-height-825 { min-height: 825px; max-height: 825px; }\n.min-max-height-830 { min-height: 830px; max-height: 830px; }\n.min-max-height-835 { min-height: 835px; max-height: 835px; }\n.min-max-height-840 { min-height: 840px; max-height: 840px; }\n.min-max-height-845 { min-height: 845px; max-height: 845px; }\n.min-max-height-850 { min-height: 850px; max-height: 850px; }\n.min-max-height-855 { min-height: 855px; max-height: 855px; }\n.min-max-height-860 { min-height: 860px; max-height: 860px; }\n.min-max-height-865 { min-height: 865px; max-height: 865px; }\n.min-max-height-870 { min-height: 870px; max-height: 870px; }\n.min-max-height-875 { min-height: 875px; max-height: 875px; }\n.min-max-height-880 { min-height: 880px; max-height: 880px; }\n.min-max-height-885 { min-height: 885px; max-height: 885px; }\n.min-max-height-890 { min-height: 890px; max-height: 890px; }\n.min-max-height-895 { min-height: 895px; max-height: 895px; }\n.min-max-height-900 { min-height: 900px; max-height: 900px; }\n.min-max-height-905 { min-height: 905px; max-height: 905px; }\n.min-max-height-910 { min-height: 910px; max-height: 910px; }\n.min-max-height-915 { min-height: 915px; max-height: 915px; }\n.min-max-height-920 { min-height: 920px; max-height: 920px; }\n.min-max-height-925 { min-height: 925px; max-height: 925px; }\n.min-max-height-930 { min-height: 930px; max-height: 930px; }\n.min-max-height-935 { min-height: 935px; max-height: 935px; }\n.min-max-height-940 { min-height: 940px; max-height: 940px; }\n.min-max-height-945 { min-height: 945px; max-height: 945px; }\n.min-max-height-950 { min-height: 950px; max-height: 950px; }\n.min-max-height-955 { min-height: 955px; max-height: 955px; }\n.min-max-height-960 { min-height: 960px; max-height: 960px; }\n.min-max-height-965 { min-height: 965px; max-height: 965px; }\n.min-max-height-970 { min-height: 970px; max-height: 970px; }\n.min-max-height-975 { min-height: 975px; max-height: 975px; }\n.min-max-height-980 { min-height: 980px; max-height: 980px; }\n.min-max-height-985 { min-height: 985px; max-height: 985px; }\n.min-max-height-990 { min-height: 990px; max-height: 990px; }\n.min-max-height-995 { min-height: 995px; max-height: 995px; }\n\n.margin-0 { margin: 0; }\n.margin-1 { margin: 1px; }\n.margin-2 { margin: 2px; }\n.margin-3 { margin: 3px; }\n.margin-4 { margin: 4px; }\n.margin-5 { margin: 5px; }\n.margin-10 { margin: 10px; }\n.margin-15 { margin: 15px; }\n.margin-20 { margin: 20px; }\n.margin-25 { margin: 25px; }\n.margin-30 { margin: 30px; }\n.margin-35 { margin: 35px; }\n.margin-40 { margin: 40px; }\n.margin-45 { margin: 45px; }\n.margin-50 { margin: 50px; }\n\n.margin-top-0 { margin-top: 0; }\n.margin-top-1 { margin-top: 1px; }\n.margin-top-2 { margin-top: 2px; }\n.margin-top-3 { margin-top: 3px; }\n.margin-top-4 { margin-top: 4px; }\n.margin-top-5 { margin-top: 5px; }\n.margin-top-10 { margin-top: 10px; }\n.margin-top-15 { margin-top: 15px; }\n.margin-top-20 { margin-top: 20px; }\n.margin-top-25 { margin-top: 25px; }\n.margin-top-30 { margin-top: 30px; }\n.margin-top-35 { margin-top: 35px; }\n.margin-top-40 { margin-top: 40px; }\n.margin-top-45 { margin-top: 45px; }\n.margin-top-50 { margin-top: 50px; }\n\n.margin-right-0 { margin-right: 0; }\n.margin-right-1 { margin-right: 1px; }\n.margin-right-2 { margin-right: 2px; }\n.margin-right-3 { margin-right: 3px; }\n.margin-right-4 { margin-right: 4px; }\n.margin-right-5 { margin-right: 5px; }\n.margin-right-10 { margin-right: 10px; }\n.margin-right-15 { margin-right: 15px; }\n.margin-right-20 { margin-right: 20px; }\n.margin-right-25 { margin-right: 25px; }\n.margin-right-30 { margin-right: 30px; }\n.margin-right-35 { margin-right: 35px; }\n.margin-right-40 { margin-right: 40px; }\n.margin-right-45 { margin-right: 45px; }\n.margin-right-50 { margin-right: 50px; }\n\n.margin-bottom-0 { margin-bottom: 0; }\n.margin-bottom-1 { margin-bottom: 1px; }\n.margin-bottom-2 { margin-bottom: 2px; }\n.margin-bottom-3 { margin-bottom: 3px; }\n.margin-bottom-4 { margin-bottom: 4px; }\n.margin-bottom-5 { margin-bottom: 5px; }\n.margin-bottom-10 { margin-bottom: 10px; }\n.margin-bottom-15 { margin-bottom: 15px; }\n.margin-bottom-20 { margin-bottom: 20px; }\n.margin-bottom-25 { margin-bottom: 25px; }\n.margin-bottom-30 { margin-bottom: 30px; }\n.margin-bottom-35 { margin-bottom: 35px; }\n.margin-bottom-40 { margin-bottom: 40px; }\n.margin-bottom-45 { margin-bottom: 45px; }\n.margin-bottom-50 { margin-bottom: 50px; }\n\n.margin-left-0 { margin-left: 0; }\n.margin-left-1 { margin-left: 1px; }\n.margin-left-2 { margin-left: 2px; }\n.margin-left-3 { margin-left: 3px; }\n.margin-left-4 { margin-left: 4px; }\n.margin-left-5 { margin-left: 5px; }\n.margin-left-10 { margin-left: 10px; }\n.margin-left-15 { margin-left: 15px; }\n.margin-left-20 { margin-left: 20px; }\n.margin-left-25 { margin-left: 25px; }\n.margin-left-30 { margin-left: 30px; }\n.margin-left-35 { margin-left: 35px; }\n.margin-left-40 { margin-left: 40px; }\n.margin-left-45 { margin-left: 45px; }\n.margin-left-50 { margin-left: 50px; }\n\n.margin-top-bottom-0 { margin-top: 0; margin-bottom: 0; }\n.margin-top-bottom-1 { margin-top: 1px; margin-bottom: 1px; }\n.margin-top-bottom-2 { margin-top: 2px; margin-bottom: 2px; }\n.margin-top-bottom-3 { margin-top: 3px; margin-bottom: 3px; }\n.margin-top-bottom-4 { margin-top: 4px; margin-bottom: 4px; }\n.margin-top-bottom-5 { margin-top: 5px; margin-bottom: 5px; }\n.margin-top-bottom-10 { margin-top: 10px; margin-bottom: 10px; }\n.margin-top-bottom-15 { margin-top: 15px; margin-bottom: 15px; }\n.margin-top-bottom-20 { margin-top: 20px; margin-bottom: 20px; }\n.margin-top-bottom-25 { margin-top: 25px; margin-bottom: 25px; }\n.margin-top-bottom-30 { margin-top: 30px; margin-bottom: 30px; }\n.margin-top-bottom-35 { margin-top: 35px; margin-bottom: 35px; }\n.margin-top-bottom-40 { margin-top: 40px; margin-bottom: 40px; }\n.margin-top-bottom-45 { margin-top: 45px; margin-bottom: 45px; }\n.margin-top-bottom-50 { margin-top: 50px; margin-bottom: 50px; }\n\n.margin-left-right-0 { margin-left: 0; margin-right: 0; }\n.margin-left-right-1 { margin-left: 1px; margin-right: 1px; }\n.margin-left-right-2 { margin-left: 2px; margin-right: 2px; }\n.margin-left-right-3 { margin-left: 3px; margin-right: 3px; }\n.margin-left-right-4 { margin-left: 4px; margin-right: 4px; }\n.margin-left-right-5 { margin-left: 5px; margin-right: 5px; }\n.margin-left-right-10 { margin-left: 10px; margin-right: 10px; }\n.margin-left-right-15 { margin-left: 15px; margin-right: 15px; }\n.margin-left-right-20 { margin-left: 20px; margin-right: 20px; }\n.margin-left-right-25 { margin-left: 25px; margin-right: 25px; }\n.margin-left-right-30 { margin-left: 30px; margin-right: 30px; }\n.margin-left-right-35 { margin-left: 35px; margin-right: 35px; }\n.margin-left-right-40 { margin-left: 40px; margin-right: 40px; }\n.margin-left-right-45 { margin-left: 45px; margin-right: 45px; }\n.margin-left-right-50 { margin-left: 50px; margin-right: 50px; }\n\n.padding-0 { padding: 0; }\n.padding-1 { padding: 1px; }\n.padding-2 { padding: 2px; }\n.padding-3 { padding: 3px; }\n.padding-4 { padding: 4px; }\n.padding-5 { padding: 5px; }\n.padding-10 { padding: 10px; }\n.padding-15 { padding: 15px; }\n.padding-20 { padding: 20px; }\n.padding-25 { padding: 25px; }\n.padding-30 { padding: 30px; }\n.padding-35 { padding: 35px; }\n.padding-40 { padding: 40px; }\n.padding-45 { padding: 45px; }\n.padding-50 { padding: 50px; }\n\n.padding-top-0 { padding-top: 0; }\n.padding-top-1 { padding-top: 1px; }\n.padding-top-2 { padding-top: 2px; }\n.padding-top-3 { padding-top: 3px; }\n.padding-top-4 { padding-top: 4px; }\n.padding-top-5 { padding-top: 5px; }\n.padding-top-10 { padding-top: 10px; }\n.padding-top-15 { padding-top: 15px; }\n.padding-top-20 { padding-top: 20px; }\n.padding-top-25 { padding-top: 25px; }\n.padding-top-30 { padding-top: 30px; }\n.padding-top-35 { padding-top: 35px; }\n.padding-top-40 { padding-top: 40px; }\n.padding-top-45 { padding-top: 45px; }\n.padding-top-50 { padding-top: 50px; }\n\n.padding-right-0 { padding-right: 0; }\n.padding-right-1 { padding-right: 1px; }\n.padding-right-2 { padding-right: 2px; }\n.padding-right-3 { padding-right: 3px; }\n.padding-right-4 { padding-right: 4px; }\n.padding-right-5 { padding-right: 5px; }\n.padding-right-10 { padding-right: 10px; }\n.padding-right-15 { padding-right: 15px; }\n.padding-right-20 { padding-right: 20px; }\n.padding-right-25 { padding-right: 25px; }\n.padding-right-30 { padding-right: 30px; }\n.padding-right-35 { padding-right: 35px; }\n.padding-right-40 { padding-right: 40px; }\n.padding-right-45 { padding-right: 45px; }\n.padding-right-50 { padding-right: 50px; }\n\n.padding-bottom-0 { padding-bottom: 0; }\n.padding-bottom-1 { padding-bottom: 1px; }\n.padding-bottom-2 { padding-bottom: 2px; }\n.padding-bottom-3 { padding-bottom: 3px; }\n.padding-bottom-4 { padding-bottom: 4px; }\n.padding-bottom-5 { padding-bottom: 5px; }\n.padding-bottom-10 { padding-bottom: 10px; }\n.padding-bottom-15 { padding-bottom: 15px; }\n.padding-bottom-20 { padding-bottom: 20px; }\n.padding-bottom-25 { padding-bottom: 25px; }\n.padding-bottom-30 { padding-bottom: 30px; }\n.padding-bottom-35 { padding-bottom: 35px; }\n.padding-bottom-40 { padding-bottom: 40px; }\n.padding-bottom-45 { padding-bottom: 45px; }\n.padding-bottom-50 { padding-bottom: 50px; }\n\n.padding-left-0 { padding-left: 0; }\n.padding-left-1 { padding-left: 1px; }\n.padding-left-2 { padding-left: 2px; }\n.padding-left-3 { padding-left: 3px; }\n.padding-left-4 { padding-left: 4px; }\n.padding-left-5 { padding-left: 5px; }\n.padding-left-10 { padding-left: 10px; }\n.padding-left-15 { padding-left: 15px; }\n.padding-left-20 { padding-left: 20px; }\n.padding-left-25 { padding-left: 25px; }\n.padding-left-30 { padding-left: 30px; }\n.padding-left-35 { padding-left: 35px; }\n.padding-left-40 { padding-left: 40px; }\n.padding-left-45 { padding-left: 45px; }\n.padding-left-50 { padding-left: 50px; }\n\n.padding-top-bottom-0 { padding-top: 0; padding-bottom: 0; }\n.padding-top-bottom-1 { padding-top: 1px; padding-bottom: 1px; }\n.padding-top-bottom-2 { padding-top: 2px; padding-bottom: 2px; }\n.padding-top-bottom-3 { padding-top: 3px; padding-bottom: 3px; }\n.padding-top-bottom-4 { padding-top: 4px; padding-bottom: 4px; }\n.padding-top-bottom-5 { padding-top: 5px; padding-bottom: 5px; }\n.padding-top-bottom-10 { padding-top: 10px; padding-bottom: 10px; }\n.padding-top-bottom-15 { padding-top: 15px; padding-bottom: 15px; }\n.padding-top-bottom-20 { padding-top: 20px; padding-bottom: 20px; }\n.padding-top-bottom-25 { padding-top: 25px; padding-bottom: 25px; }\n.padding-top-bottom-30 { padding-top: 30px; padding-bottom: 30px; }\n.padding-top-bottom-35 { padding-top: 35px; padding-bottom: 35px; }\n.padding-top-bottom-40 { padding-top: 40px; padding-bottom: 40px; }\n.padding-top-bottom-45 { padding-top: 45px; padding-bottom: 45px; }\n.padding-top-bottom-50 { padding-top: 50px; padding-bottom: 50px; }\n\n.padding-left-right-0 { padding-left: 0; padding-right: 0; }\n.padding-left-right-1 { padding-left: 1px; padding-right: 1px; }\n.padding-left-right-2 { padding-left: 2px; padding-right: 2px; }\n.padding-left-right-3 { padding-left: 3px; padding-right: 3px; }\n.padding-left-right-4 { padding-left: 4px; padding-right: 4px; }\n.padding-left-right-5 { padding-left: 5px; padding-right: 5px; }\n.padding-left-right-10 { padding-left: 10px; padding-right: 10px; }\n.padding-left-right-15 { padding-left: 15px; padding-right: 15px; }\n.padding-left-right-20 { padding-left: 20px; padding-right: 20px; }\n.padding-left-right-25 { padding-left: 25px; padding-right: 25px; }\n.padding-left-right-30 { padding-left: 30px; padding-right: 30px; }\n.padding-left-right-35 { padding-left: 35px; padding-right: 35px; }\n.padding-left-right-40 { padding-left: 40px; padding-right: 40px; }\n.padding-left-right-45 { padding-left: 45px; padding-right: 45px; }\n.padding-left-right-50 { padding-left: 50px; padding-right: 50px; }\n\n.float-left { float: left; }\n.float-right { float: right; }\n\n.text-align-left { text-align: left; }\n.text-align-center { text-align: center; }\n.text-align-right { text-align: right; }\n\n.text-decoration-none { text-decoration: none; }\n\n.text-overflow-clip { text-overflow: clip; }\n.text-overflow-ellipsis { text-overflow: ellipsis; }\n.text-center-ellipsis {\n  text-align: center;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  margin: 0;\n}\n\n.line-clamp-1 {\n  display: -webkit-box;\n  -webkit-line-clamp: 1;\n  -webkit-box-orient: vertical;  \n}\n.line-clamp-2 {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;  \n}\n.line-clamp-3 {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;  \n}\n.line-clamp-4 {\n  display: -webkit-box;\n  -webkit-line-clamp: 4;\n  -webkit-box-orient: vertical;  \n}\n.line-clamp-5 {\n  display: -webkit-box;\n  -webkit-line-clamp: 5;\n  -webkit-box-orient: vertical;  \n}\n\n.border-1 { border: solid 1px gray; }\n.border-top-1 { border-top: solid 1px gray; }\n.border-right-1 { border-right: solid 1px gray; }\n.border-bottom-1 { border-bottom: solid 1px gray; }\n.border-left-1 { border-left: solid 1px gray; }\n\n.border-radius-5 { border-radius: 5px; }\n.border-radius-10 { border-radius: 10px; }\n.border-radius-15 { border-radius: 15px; }\n.border-radius-20 { border-radius: 20px; }\n.border-radius-25 { border-radius: 25px; }\n.border-radius-30 { border-radius: 30px; }\n\n.cursor-auto { cursor: auto; }\n.cursor-default { cursor: default; }\n.cursor-none { cursor: none; }\n.cursor-context-menu { cursor: context-menu; }\n.cursor-help { cursor: help; }\n.cursor-pointer { cursor: pointer; }\n.cursor-progress { cursor: progress; }\n.cursor-wait { cursor: wait; }\n.cursor-cell { cursor: cell; }\n.cursor-crosshair { cursor: crosshair; }\n.cursor-text { cursor: text; }\n.cursor-vertical-text { cursor: vertical-text; }\n.cursor-alias { cursor: alias; }\n.cursor-copy { cursor: copy; }\n.cursor-move { cursor: move; }\n.cursor-no-drop { cursor: no-drop; }\n.cursor-not-allowed { cursor: not-allowed; }\n.cursor-all-scroll { cursor: all-scroll; }\n.cursor-col-resize { cursor: col-resize; }\n.cursor-row-resize { cursor: row-resize; }\n.cursor-n-resize { cursor: n-resize; }\n.cursor-e-resize { cursor: e-resize; }\n.cursor-s-resize { cursor: s-resize; }\n.cursor-w-resize { cursor: w-resize; }\n.cursor-ns-resize { cursor: ns-resize; }\n.cursor-ew-resize { cursor: ew-resize; }\n.cursor-ne-resize { cursor: ne-resize; }\n.cursor-nw-resize { cursor: nw-resize; }\n.cursor-se-resize { cursor: se-resize; }\n.cursor-sw-resize { cursor: sw-resize; }\n.cursor-nesw-resize { cursor: nesw-resize; }\n.cursor-nwse-resize { cursor: nwse-resize; }\n.cursor-grab { cursor: -webkit-grab; cursor: -moz-grab; }\n.cursor-grabbing { cursor: -webkit-grabbing; cursor: -moz-grabbing; }\n.cursor-zoom-in { cursor: -webkit-zoom-in; cursor: -moz-zoom-in; }\n.cursor-zoom-out { cursor: -webkit-zoom-out; cursor: -moz-zoom-out; }\n\n.vertical-align-top { vertical-align: top; }\n.vertical-align-middle { vertical-align: middle; }\n.vertical-align-bottom { vertical-align: bottom }\n\n.vertical-text {\n  writing-mode: vertical-rl;\n  text-orientation: sideways-right;\n  margin-bottom: 5px;\n}\n\n.overflow-auto { overflow: auto; min-height: 0; /* min-height required for Firefox */ }\n.overflow-hidden { overflow: hidden; }\n.overflow-scroll { overflow: scroll; }\n.overflow-visible { overflow: visible; }\n\n.overflow-x-auto { overflow-x: auto; }\n.overflow-x-hidden { overflow-x: hidden; }\n.overflow-x-scroll { overflow-x: scroll; }\n.overflow-x-visible { overflow-x: visible; }\n\n.overflow-y-auto { overflow-y: auto; }\n.overflow-y-hidden { overflow-y: hidden; }\n.overflow-y-scroll { overflow-y: scroll; }\n.overflow-y-visible { overflow-y: visible; }\n\n.no-events { \n  user-select: none;  \n  pointer-events: none;\n}\n.pointer-events-none { pointer-events: none; }\n.user-select-none { user-select: none; }\n\n.font-style-italic { font-style: italic; }\n\n.list-none {\n  list-style-type: none;\n  margin: 0;\n  padding: 0;    \n}\n.list-style-none { list-style: none; }\n\n.position-relative { position: relative; }\n\n\n"; });
define('assets/css/flex.css!text', ['module'], function(module) { module.exports = "/* Flexbox Parent Styles */\n.flex { display: flex; }\n\n.flex-flow-column { flex-flow: column; }\n.flex-flow-column-reverse { flex-flow: column-reverse; }\n.flex-flow-row { flex-flow: row; }\n.flex-flow-row-reverse { flex-flow: row-reverse; }\n\n.flex-flow-wrap { flex-flow: wrap; }\n.flex-flow-nowrap { flex-flow: nowrap; }\n.flex-flow-wrap-reverse { flex-flow: wrap-reverse; }\n\n.flex-flow-row-nowrap { flex-flow: row nowrap; }\n.flex-flow-row-wrap { flex-flow: row wrap; }\n.flex-flow-row-wrap-reverse { flex-flow: row wrap-reverse; }\n.flex-flow-row-reverse-wrap { flex-flow: row-reverse wrap; }\n.flex-flow-row-reverse-wrap-reverse { flex-flow: row-reverse wrap-reverse; }\n.flex-flow-column-nowrap { flex-flow: column nowrap; }\n.flex-flow-column-wrap { flex-flow: column wrap; }\n.flex-flow-column-wrap-reverse { flex-flow: column wrap-reverse; }\n.flex-flow-column-reverse-wrap { flex-flow: column-reverse wrap; }\n.flex-flow-column-reverse-wrap-reverse { flex-flow: column-reverse wrap-reverse; }\n\n.flex-direction-column { flex-direction: column; }\n.flex-direction-column-reverse { flex-direction: column-reverse; }\n.flex-direction-row { flex-direction: row; }\n.flex-direction-row-reverse { flex-direction: row-reverse; }\n\n/* NOTE: Can this or the flex-direction be used for sorting lists?? */\n.flex-wrap-wrap { flex-wrap: wrap; }\n.flex-wrap-nowrap { flex-wrap: nowrap; }\n.flex-wrap-wrap-reverse { flex-wrap: wrap-reverse; }\n\n.flex-row { display: flex; flex-flow: row; }\n.flex-row-none { display: flex; flex-flow: row; flex: none; }\n.flex-row-1 { display: flex; flex-flow: row; flex: 1; }\n.flex-row-2 { display: flex; flex-flow: row; flex: 2; }\n.flex-row-3 { display: flex; flex-flow: row; flex: 3; }\n.flex-row-4 { display: flex; flex-flow: row; flex: 4; }\n.flex-row-5 { display: flex; flex-flow: row; flex: 5; }\n.flex-row-reverse { display: flex; flex-flow: row-reverse; }\n.flex-row-reverse-none { display: flex; flex-flow: row-reverse; flex: none; }\n.flex-row-reverse-1 { display: flex; flex-flow: row-reverse; flex: 1; }\n.flex-row-reverse-2 { display: flex; flex-flow: row-reverse; flex: 2; }\n.flex-row-reverse-3 { display: flex; flex-flow: row-reverse; flex: 3; }\n.flex-row-reverse-4 { display: flex; flex-flow: row-reverse; flex: 4; }\n.flex-row-reverse-5 { display: flex; flex-flow: row-reverse; flex: 5; }\n.flex-row-wrap { display: flex; flex-flow: row wrap; }\n.flex-row-wrap-none { display: flex; flex-flow: row wrap; flex: none; }\n.flex-row-wrap-1 { display: flex; flex-flow: row wrap; flex: 1; }\n.flex-row-wrap-2 { display: flex; flex-flow: row wrap; flex: 2; }\n.flex-row-wrap-3 { display: flex; flex-flow: row wrap; flex: 3; }\n.flex-row-wrap-4 { display: flex; flex-flow: row wrap; flex: 4; }\n.flex-row-wrap-5 { display: flex; flex-flow: row wrap; flex: 5; }\n.flex-row-reverse-wrap { display: flex; flex-flow: row-reverse wrap; }\n.flex-row-reverse-wrap-none { display: flex; flex-flow: row-reverse wrap; flex: none; }\n.flex-row-reverse-wrap-1 { display: flex; flex-flow: row-reverse wrap; flex: 1; }\n.flex-row-reverse-wrap-2 { display: flex; flex-flow: row-reverse wrap; flex: 2; }\n.flex-row-reverse-wrap-3 { display: flex; flex-flow: row-reverse wrap; flex: 3; }\n.flex-row-reverse-wrap-4 { display: flex; flex-flow: row-reverse wrap; flex: 4; }\n.flex-row-reverse-wrap-5 { display: flex; flex-flow: row-reverse wrap; flex: 5; }\n.flex-row-wrap-reverse { display: flex; flex-flow: row wrap-reverse; }\n.flex-row-wrap-reverse-none { display: flex; flex-flow: row wrap-reverse; flex: none; }\n.flex-row-wrap-reverse-1 { display: flex; flex-flow: row wrap-reverse; flex: 1; }\n.flex-row-wrap-reverse-2 { display: flex; flex-flow: row wrap-reverse; flex: 2; }\n.flex-row-wrap-reverse-3 { display: flex; flex-flow: row wrap-reverse; flex: 3; }\n.flex-row-wrap-reverse-4 { display: flex; flex-flow: row wrap-reverse; flex: 4; }\n.flex-row-wrap-reverse-5 { display: flex; flex-flow: row wrap-reverse; flex: 5; }\n.flex-row-reverse-wrap-reverse { display: flex; flex-flow: row-reverse wrap-reverse; }\n.flex-row-reverse-wrap-reverse-none { display: flex; flex-flow: row-reverse wrap-reverse; flex: none; }\n.flex-row-reverse-wrap-reverse-1 { display: flex; flex-flow: row-reverse wrap-reverse; flex: 1; }\n.flex-row-reverse-wrap-reverse-2 { display: flex; flex-flow: row-reverse wrap-reverse; flex: 2; }\n.flex-row-reverse-wrap-reverse-3 { display: flex; flex-flow: row-reverse wrap-reverse; flex: 3; }\n.flex-row-reverse-wrap-reverse-4 { display: flex; flex-flow: row-reverse wrap-reverse; flex: 4; }\n.flex-row-reverse-wrap-reverse-5 { display: flex; flex-flow: row-reverse wrap-reverse; flex: 5; }\n.flex-column { display: flex; flex-flow: column; }\n.flex-column-none { display: flex; flex-flow: column; flex: none; }\n.flex-column-1 { display: flex; flex-flow: column; flex: 1; }\n.flex-column-2 { display: flex; flex-flow: column; flex: 2; }\n.flex-column-3 { display: flex; flex-flow: column; flex: 3; }\n.flex-column-4 { display: flex; flex-flow: column; flex: 4; }\n.flex-column-5 { display: flex; flex-flow: column; flex: 5; }\n.flex-column-reverse { display: flex; flex-flow: column-reverse; }\n.flex-column-reverse-none { display: flex; flex-flow: column-reverse; flex: none; }\n.flex-column-reverse-1 { display: flex; flex-flow: column-reverse; flex: 1; }\n.flex-column-reverse-2 { display: flex; flex-flow: column-reverse; flex: 2; }\n.flex-column-reverse-3 { display: flex; flex-flow: column-reverse; flex: 3; }\n.flex-column-reverse-4 { display: flex; flex-flow: column-reverse; flex: 4; }\n.flex-column-reverse-5 { display: flex; flex-flow: column-reverse; flex: 5; }\n.flex-column-wrap { display: flex; flex-flow: column wrap; }\n.flex-column-wrap-none { display: flex; flex-flow: column wrap; flex: none; }\n.flex-column-wrap-1 { display: flex; flex-flow: column wrap; flex: 1; }\n.flex-column-wrap-2 { display: flex; flex-flow: column wrap; flex: 2; }\n.flex-column-wrap-3 { display: flex; flex-flow: column wrap; flex: 3; }\n.flex-column-wrap-4 { display: flex; flex-flow: column wrap; flex: 4; }\n.flex-column-wrap-5 { display: flex; flex-flow: column wrap; flex: 5; }\n.flex-column-reverse-wrap { display: flex; flex-flow: column-reverse wrap; }\n.flex-column-reverse-wrap-none { display: flex; flex-flow: column-reverse wrap; flex: none; }\n.flex-column-reverse-wrap-1 { display: flex; flex-flow: column-reverse wrap; flex: 1; }\n.flex-column-reverse-wrap-2 { display: flex; flex-flow: column-reverse wrap; flex: 2; }\n.flex-column-reverse-wrap-3 { display: flex; flex-flow: column-reverse wrap; flex: 3; }\n.flex-column-reverse-wrap-4 { display: flex; flex-flow: column-reverse wrap; flex: 4; }\n.flex-column-reverse-wrap-5 { display: flex; flex-flow: column-reverse wrap; flex: 5; }\n.flex-column-wrap-reverse { display: flex; flex-flow: column wrap-reverse; }\n.flex-column-wrap-reverse-none { display: flex; flex-flow: column wrap-reverse; flex: none; }\n.flex-column-wrap-reverse-1 { display: flex; flex-flow: column wrap-reverse; flex: 1; }\n.flex-column-wrap-reverse-2 { display: flex; flex-flow: column wrap-reverse; flex: 2; }\n.flex-column-wrap-reverse-3 { display: flex; flex-flow: column wrap-reverse; flex: 3; }\n.flex-column-wrap-reverse-4 { display: flex; flex-flow: column wrap-reverse; flex: 4; }\n.flex-column-wrap-reverse-5 { display: flex; flex-flow: column wrap-reverse; flex: 5; }\n.flex-column-reverse-wrap-reverse { display: flex; flex-flow: column-reverse wrap-reverse; }\n.flex-column-reverse-wrap-reverse-none { display: flex; flex-flow: column-reverse wrap-reverse; flex: none; }\n.flex-column-reverse-wrap-reverse-1 { display: flex; flex-flow: column-reverse wrap-reverse; flex: 1; }\n.flex-column-reverse-wrap-reverse-2 { display: flex; flex-flow: column-reverse wrap-reverse; flex: 2; }\n.flex-column-reverse-wrap-reverse-3 { display: flex; flex-flow: column-reverse wrap-reverse; flex: 3; }\n.flex-column-reverse-wrap-reverse-4 { display: flex; flex-flow: column-reverse wrap-reverse; flex: 4; }\n.flex-column-reverse-wrap-reverse-5 { display: flex; flex-flow: column-reverse wrap-reverse; flex: 5; }\n\n.justify-content-center { justify-content: center; }\n.justify-content-end { justify-content: flex-end; }\n.justify-content-start { justify-content: flex-start; }\n.justify-content-space-around { justify-content: space-around; }\n.justify-content-space-between { justify-content: space-between; }\n\n.align-items-start { align-items: flex-start; }\n.align-items-end { align-items: flex-end; }\n.align-items-center { align-items: center; }\n.align-items-baseline { align-items: baseline; }\n\n.align-content-start { align-content: flex-start; }\n.align-content-end { align-content: flex-end; }\n.align-content-center { align-content: center; }\n.align-content-space-between { align-content: space-between; }\n.align-content-space-around { align-content: space-around; }\n.align-content-stretch { align-content: stretch; }\n\n/* Flex Children Styles */\n.flex-none { flex: none; } /* 0 0 auto */\n.flex-1 { flex: 1; } /* flex-grow (flex-basis changes to 0) */\n.flex-2 { flex: 2; }\n.flex-3 { flex: 3; }\n.flex-4 { flex: 4; }\n.flex-5 { flex: 5; }\n\n.order-0 { order: 0; }\n.order-1 { order: 1; }\n.order-2 { order: 2; }\n.order-3 { order: 3; }\n.order-4 { order: 4; }\n.order-5 { order: 5; }\n.order-6 { order: 6; }\n.order-7 { order: 7; }\n.order-8 { order: 8; }\n.order-9 { order: 9; }\n\n.align-self-auto { align-self: auto; }\n.align-self-start { align-self: flex-start; }\n.align-self-end { align-self: flex-end; }\n.align-self-center { align-self: center; }\n.align-self-baseline { align-self: baseline; }\n.align-self-stretch { align-self: stretch; }\n\n/* Flex Layout Styles */\nform.fixed [class*=\"width\"]:not([class*=\"flex-column\"]):not(.text-align-right) { margin:0 5px; }\nform.fixed [class*=\"width\"].text-align-right:not([class*=\"flex-column\"]) { margin: 0 0 0 10px; }\nform.fixed [class*=\"width\"].margin-left-0:not([class*=\"flex-direction-column\"]) { margin-left:0; }\nform.fixed [class*=\"width\"].margin-right-0:not([class*=\"flex-direction-column\"]) { margin-right:0; }\nform.fixed .flex [class*=\"width\"]:not([class*=\"flex-column\"]) { flex: 0 0 auto; }\nform.fixed .flex-row [class*=\"width\"]:not([class=*=\"flex-column\"]) { margin:0 4px; }\nform.fixed .flex-row:not(.flex-header):not([class*=\"margin-bottom\"]):not(:last-child) { margin-bottom: 10px; }\n\n.flex-header {\n  margin-bottom:5px;\n  border-bottom: 1px solid #ccc;  \n}\n\n/* Flex Transitions */\n.tab-header { \n  cursor: col-resize;\n  border-radius: 5px;\n  background-color: #424242;\n  color: white;\n}\n.tab-title {\n  min-width: 30px;\n  padding: 10px 7px;\n  text-align: center;\n  cursor: pointer;\n}\n\n/*#sidebar-tab, #aside-tab {\n  transition: flex 350ms linear,\n  min-width 350ms linear, \n  max-width 350ms linear, \n  width 350ms linear,\n  min-height 350ms linear,\n  max-height 350ms linear,\n  height 350ms linear;\n  overflow-x: auto;\n}*/\n.close-tab { \n  flex: .00001; \n  padding: 0; \n  overflow: hidden; \n  min-width: 0 !important; \n  max-width: 0 !important; \n  width: 0 !important; \n  margin:0 !important;\n}\n.close-tab+.tab-header {\n  cursor: auto;\n}\n.close-horizontal-tab { \n  flex: .00001;\n  border: none; \n  padding: 0; \n  overflow: hidden; \n  min-height: 39px !important; \n  max-height: 39px !important; \n  height: 39px !important; \n  margin:0 !important;\n  margin-top: 5px !important;\n}\n.close-horizontal-tab+.tab-header {\n  cursor: auto;\n}\n.transition-none { transition: none !important; }\n\n"; });
define('app',['exports', 'aurelia-router', './resources/elements/notifier/notifier', './security/authorize-step'], function (exports, _aureliaRouter, _notifier, _authorizeStep) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var App = exports.App = (_temp = _class = function () {
    function App(notifier) {
      _classCallCheck(this, App);

      this.notifier = notifier;
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      var handleUnknownRoutes = function handleUnknownRoutes(instruction) {
        return { route: 'access-denied', moduleId: 'views/access-denied/access-denied', settings: { roles: [] } };
      };
      config.title = 'QuoteOne';
      config.options.pushState = true;
      config.options.root = '/quoteone-dev/';

      config.addPipelineStep('authorize', _authorizeStep.AuthorizeStep);

      config.map([{ route: ['', 'quotes'], name: 'quotes', moduleId: 'views/quotes/quotes', nav: true, title: 'Quotes', settings: { roles: ['authorized'] } }, { route: 'quote/:recordid', name: 'quote', moduleId: 'views/quotes/quote', nav: false, title: 'Quote', settings: { roles: ['authorized'] } }, { route: 'quote/:recordid/images', name: 'quote-images', moduleId: 'views/quote-images/quote-images', nav: false, title: 'Quote Images', settings: { roles: ['authorized'] } }, { route: 'quote-dashboard', name: 'quote-dashboard', moduleId: 'views/quote-dashboard/quote-dashboard', nav: true, title: 'Automation Dashboard', settings: { roles: ['authorized'] } }, { route: 'callback', name: 'callback', moduleId: 'views/callback/callback', nav: false, settings: { roles: [] } }, { route: 'tickler', name: 'tickler', moduleId: 'views/tickler/tickler', nav: true, title: 'Mobile Tickler', settings: { roles: ['authorized'] } }, { route: 'customers', name: 'customers', moduleId: 'views/customers/customers', nav: true, title: 'Customers', settings: { roles: ['authorized'] } }, { route: 'customers/:recordid', name: 'customer', moduleId: 'views/customers/customer', nav: false, title: 'Customer', settings: { roles: ['authorized'] } }, { route: 'test-bed', name: 'test-bed', moduleId: 'views/test-bed/test-bed', nav: true, title: 'Test View', settings: { roles: ['authorized'] } }]);

      config.mapUnknownRoutes(handleUnknownRoutes);
      this.router = router;
    };

    return App;
  }(), _class.inject = [_notifier.Notifier], _temp);
});
define('app.html!text', ['module'], function(module) { module.exports = "<template><require from=./assets/css/layout.css></require><require from=./assets/css/flex.css></require><require from=./app.css></require><require from=./nav-bar.html></require><div class=flex-column-1><div class=flex-column-none><nav-bar class=flex-row-1 router.bind=router></nav-bar><user-settings class=flex-row-none></user-settings></div><div class=page-host view-spy=\"\"><router-view></router-view></div></div><compose view-model.bind=notifier containerless=\"\"></compose></template>"; });
define('app.css!text', ['module'], function(module) { module.exports = ".splash {\n    text-align: center;\n    margin: 10% 0 0 0;\n}\n\n.splash .message {\n    font-size: 5em;\n    line-height: 1.5em;\n    -webkit-text-shadow: rgba(0, 0, 0, 0.5) 0 0 15px;\n    text-shadow: rgba(0, 0, 0, 0.5) 0 0 15px;\n    text-transform: uppercase;\n}\n\n.splash .fa-spinner {\n    text-align: center;\n    display: inline-block;\n    font-size: 5em;\n    margin-top: 50px;\n}\n\nnav-bar .navbar-fixed-top {\n  padding-right: 0;\n  margin-right: 0;\n  right: 51px;\n}\nuser-settings {\n  position: absolute;\n  top: 0;\n  right: 0;\n  height: 51px;\n}\nuser-settings #userAvatar {\n  background-color: #f8f8f8;\n}\nuser-settings #userAvatar:focus {\n  outline: 0;\n}\n\n.page-host {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 50px;\n  bottom: 0;\n  margin-right: 20px;\n  /* overflow-x: hidden; */\n  /* overflow-y: hidden; */\n}\n\nsection {\n  /* margin: 0 20px; */\n}\n\n.view-section {\n  padding: 20px;\n}\n.view-section .quote-view form input {\n  width: calc(100% - 20px);  \n}\n\na:focus {\n  outline: none;\n}\n\n.navbar {\n  margin-right: 20px;\n}\n.navbar-nav li.loader {\n    margin: 12px 24px 0 6px;\n}\n\nrouter-view {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n}\n\n.flat2 {\n  background-color: transparent;\n  border-color: transparent;  \n}\n\n.btn-black {\n  background-color: #0e0e0e;\n  border-color: #7d7e7d;\n  color: white;\n}\n.btn-black:hover,\n.btn-black:focus,\n.btn-black.focus,\n.btn-black:active:focus,\n.btn-black.active:focus {\n  color:silver;\n  text-decoration: none;\n  outline: none;\n  outline-style: none;\n}\n\nux-dialog .btn-dlg {\n  min-width: 75px;\n}\n\n\n/* Add standard CSS3 styles here... */\n\n:root {\n  --page-bg-color: #fff;\n  --page-color: #676a6c;\n  --page-card-font-family: open sans, Helvetica Neue, Helvetica, Arial, sans-serif;\n  --page-card-border-color: #e7eaec;\n  --page-header-button-color: #a7b1c2;\n  --white-bg-color: #fff;\n}\n\nhtml > body {\n  background: var(--page-bg-color);\n}\n\n.app-title {\n  font-weight: bold;\n}\n\n.record-active {\n  color: green;\n}\n.record-inactive {\n  color: red;\n}\n\n.quote-view form input, \n.quote-view form select {\n  display: block;\n  width: 100%;\n  height: 34px;\n  /* padding: 6px 12px; */\n  padding: 6px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);\n  box-shadow: inset 0 1px 1px rgba(0,0,0,.075);\n  -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;\n  -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;\n  transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;  \n}\n.insured-header {\n  border-radius: 5px 5px 0 0;\n  background-color: #7d7e7d;\n  color: white;\n  padding: 5px 10px;\n  margin-left: -6px;\n}\n\n.vehicles-header {\n  border-radius: 5px 5px 0 0;\n  background-color: #7d7e7d;\n  color: white;\n  padding: 5px 5px;\n}\n\n.drivers-header {\n  border-radius: 5px 5px 0 0;\n  background-color: #7d7e7d;\n  color: white;\n  padding: 5px 5px;\n}\n\n.carrier-quotes {\n  list-style: none;\n  border: 1px solid lightgray;\n  border-radius: 5px;\n  margin: 0;\n  padding: 15px;\n}\n\n.customer-view .form-fields .form-group,\n.quote-view .form-fields .form-group {\n  margin-right: 15px !important;\n}\n.customer-view .table-header,\n.quote-view .table-header {\n  /* background-color: #337ab7; */\n  /* background-color: black; */\n  /* color: #fff; */\n  color: #fff;\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.customer-view table tbody tr:hover,\n.quote-view table tbody tr:hover {\n  background-color: aliceblue;\n}\n.quote-table tbody tr:hover {\n  background-color: aliceblue;\n}\n\n.quote-view select[disabled],\n.quote-view input[disabled] {\n  background-color: lightgray;\n}\n\n.quote-new {\n  color: black;  \n}\n.quote-work-quote {\n  color:  pink;\n}\n.quote-ready-to-quote {\n  color: blue;\n}\n.quote-pending {\n  color: orange;\n}\n.quote-stalled {\n  color: red;\n}\n.quote-kill-quote {\n  color: red;\n}\n.quote-agent-completed {\n  color: green;\n}\n.quote-auto-completed {\n  color: green;\n}\n.quote-auto-failed {\n  color: red;\n}\n\n.customer-lookup-table tr:hover,\n.member-lookup-table tr:hover,\n.vehicle-lookup-table tr:hover {\n  background-color: aliceblue;\n}\n.customer-lookup-table tr.is-selected,\n.member-lookup-table tr.is-selected,\n.vehicle-lookup-table tr.is-selected {\n  background-color: aliceblue;  \n}"; });
//# sourceMappingURL=app-bundle.js.map