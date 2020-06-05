const expect = require('chai').expect;
const sinon = require('sinon');

const database = require('../util/database');
const databaseURL = 'mongodb+srv://musama:Usama123@aicspec-9ubkp.mongodb.net/test?retryWrites=true';

const UserController = require('../controllers/user');
const StaffController = require('../controllers/staff');


describe('Controllers Test', function () {

    before(function (done) {
        database.mongoConnect(databaseURL, db => {
            done();
        });
    });

    it('should change the user type to admin and send isAdmin is true in the response', function () {
        const req = {
            params: { userType: 'admin' }
        };
        const res = {
            isAdmin: false,
            cookie: sinon.spy(),
            render: function (route, data) {
                this.isAdmin = data.isAdmin;
            }
        }
        UserController.switchUser(req, res, () => { })
        expect(res.cookie.calledOnce).to.be.true;
        expect(res.isAdmin).to.be.equal(true);
    });

    it('should change the user type to staff and send isAdmin is false in the response', function () {
        const req = {
            params: { userType: 'staff' }
        };
        const res = {
            isAdmin: true,
            cookie: sinon.spy(),
            render: function (route, data) {
                this.isAdmin = data.isAdmin;
            }
        }
        UserController.switchUser(req, res, () => { })
        expect(res.cookie.calledOnce).to.be.true;
        expect(res.isAdmin).to.be.equal(false);
    });

    it('should make a new cookie and set the isAdmin to false to staff when visiting the index page first time.', function () {
        const req = {
            get: function (key) { }
        };
        const res = {
            isAdmin: null,
            cookie: sinon.spy(),
            render: function (route, data) {
                this.isAdmin = data.isAdmin;
            }
        }
        StaffController.getIndex(req, res, () => { })
        expect(res.cookie.calledOnce).to.be.true;
        expect(res.isAdmin).to.be.equal(false);
    });

    it('should not change the cookie if it already exist when visiting the index page.', function () {
        const req = {
            get: function (key) {
                return 'userType=staff'
            }
        };
        const res = {
            isAdmin: null,
            cookie: sinon.spy(),
            render: function (route, data) {
                this.isAdmin = data.isAdmin;
            }
        }
        StaffController.getIndex(req, res, () => { })
        expect(res.cookie.calledOnce).to.be.false;
        expect(res.isAdmin).to.be.equal(false);
    });

    it('should get 3 modules from the database.', function (done) {
        const req = {
            get: function (key) {
                return 'userType=staff'
            }
        };
        const res = {
            isAdmin: null,
            dataList: null,
            render: function (route, data) {
                this.isAdmin = data.isAdmin;
                this.dataList = data.dataList;
            }
        }
        StaffController.getModules(req, res, () => { }).then(() => {
            expect(res.isAdmin).to.be.equal(false);
            expect(res.dataList.length).to.be.equal(3);
            expect(res.dataList[0].code).to.be.equal('4CCS1CIT');
            done();
        });
    });

    after(function (done) {
        database.mongoDisconnect(() => {
            done();
        });
    });


});