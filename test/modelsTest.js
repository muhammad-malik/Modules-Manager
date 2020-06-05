const expect = require('chai').expect;

const database = require('../util/database');
const databaseURL = 'mongodb+srv://musama:Usama123@aicspec-9ubkp.mongodb.net/test?retryWrites=true';

const ModuleModel = require('../models/module');
const ProgrammeModel = require('../models/programme');
const ModulesInfoModel = require('../models/modulesInfoList');
const ProgrammesInfoModel = require('../models/programmesInfoList');
const SubmissionModel = require('../models/submissionsList');


describe('Module Model Tests', function () {

    it('should read the 4CCS1CIT module JSON file.', function (done) {
        ModuleModel.readModuleFromFiles('4CCS1CIT', 'base', (data) => {
            expect(data.code).to.be.equal('4CCS1CIT');
            done();
        });
    });

    it('should read the 4CCS1CS1 module JSON file.', function (done) {
        ModuleModel.readModuleFromFiles('4CCS1CS1', 'base', (data) => {
            expect(data.code).to.be.equal('4CCS1CS1');
            done();
        });
    });

    it('should create a test module JSON file.', function (done) {
        ModuleModel.createNewModuleFile('base', 'test', { code: 'test' });
        ModuleModel.readModuleFromFiles('test', 'base', (data) => {
            console.log('test', data);
            expect(data.code).to.be.equal('test');
            ModuleModel.createNewModuleFile('base', 'test', { code: 'test2' });
            done();
        });
    });

    it('should return an differences when comparing two modules.', function (done) {
        ModuleModel.readModuleFromFiles('4CCS1CIT', 'base', (data1) => {
            ModuleModel.readModuleFromFiles('4CCS1CIT', 'base', (data2) => {
                const mod1 = data1;
                const mod2 = data2;
                mod1.semester = '1',
                    ModuleModel.getDifferences(mod1, mod2, diff => {
                        expect(diff.semester).to.be.equal('1');
                        done();
                    });
            });
        });
    });
});


describe('Programme Model Tests', function () {

    it('should read the beng_ee_wm_y2 programme JSON file.', function (done) {
        ProgrammeModel.readProgrammeFromFiles('beng_ee_wm_y2', 'base', (data) => {
            expect(data.code).to.be.equal('beng_ee_wm_y2');
            done();
        });
    });

    it('should read the beng_ee_wm_y1 programme JSON file.', function (done) {
        ProgrammeModel.readProgrammeFromFiles('beng_ee_wm_y1', 'base', (data) => {
            expect(data.code).to.be.equal('beng_ee_wm_y1');
            done();
        });
    });

    it('should create a test programme JSON file.', function (done) {
        ProgrammeModel.createProgrammeFile('base', 'test', { code: 'test' });
        ProgrammeModel.readProgrammeFromFiles('test', 'base', (data) => {
            expect(data.code).to.be.equal('test');
            ProgrammeModel.createProgrammeFile('base', 'test', { code: 'test2' });
            done();
        });
    });
});

describe('ModuleInfo List Model Tests', function () {

    before(function (done) {
        database.mongoConnect(databaseURL, db => {
            done();
        });
    });

    it('should retrieve moduleInfo list from database', function (done) {
        ModulesInfoModel.getModulesInfoList().then(data => {
            expect(data.length).to.be.equal(3);
            done();
        });
    });

    it('should get 4CCS1CIT for the first object in the moduleInfo list', function (done) {
        ModulesInfoModel.getModulesInfoList().then(data => {
            expect(data[0].code).to.be.equal('4CCS1CIT');
            done();
        });
    });

    it('should be able to retrieve 4CCS1CS1 moduleInfo object', function (done) {
        ModulesInfoModel.getModuleInfoByCode('4CCS1CS1').then(data => {
            expect(data.code).to.be.equal('4CCS1CS1');
            done();
        });
    });

    it('should create test moduleInfo object in the database', function (done) {
        const tempModInfo = new ModulesInfoModel('test', 'Test moduleInfo object', 'base', [], null);
        tempModInfo.save().then(() => {
            ModulesInfoModel.getModulesInfoList().then(data => {
                expect(data.length).to.be.equal(4);
                done();
            });
        });
    });

    it('should delete test moduleInfo object from the database', function (done) {
        ModulesInfoModel.getModuleInfoByCode('test').then(data => {
            database.deleteDocumentById(data._id, 'modules').then(() => {
                ModulesInfoModel.getModulesInfoList().then(list => {
                    expect(list.length).to.be.equal(3);
                    done();
                });
            });
        });
    });

    after(function (done) {
        database.mongoDisconnect(() => {
            done();
        });
    });
});


describe('ProgrammeInfo List Model Tests', function () {

    before(function (done) {
        database.mongoConnect(databaseURL, db => {
            done();
        });
    });

    it('should retrieve programmeInfo list from database', function (done) {
        ProgrammesInfoModel.getProgrammesInfoList().then(data => {
            expect(data.length).to.be.equal(3);
            done();
        });
    });

    it('should get beng_ee_wm_y1 for the first object in the moduleInfo list', function (done) {
        ProgrammesInfoModel.getProgrammesInfoList().then(data => {
            expect(data[0].code).to.be.equal('beng_ee_wm_y1');
            done();
        });
    });

    it('should be able to retrieve beng_ee_wm_y2 moduleInfo object', function (done) {
        ProgrammesInfoModel.getProgrammeInfoByCode('beng_ee_wm_y2').then(data => {
            expect(data.code).to.be.equal('beng_ee_wm_y2');
            done();
        });
    });

    it('should create test moduleInfo object in the database', function (done) {
        const tempProgInfo = new ProgrammesInfoModel('test', 'Test programmeInfo object', 'base', [], null);
        tempProgInfo.save().then(() => {
            ProgrammesInfoModel.getProgrammesInfoList().then(data => {
                expect(data.length).to.be.equal(4);
                done();
            });
        });
    });

    it('should delete test moduleInfo object from the database', function (done) {
        ProgrammesInfoModel.getProgrammeInfoByCode('test').then(data => {
            database.deleteDocumentById(data._id, 'programmes').then(() => {
                ProgrammesInfoModel.getProgrammesInfoList().then(list => {
                    expect(list.length).to.be.equal(3);
                    done();
                });
            });
        });
    });

    after(function (done) {
        database.mongoDisconnect(() => {
            done();
        });
    });
});

describe('Submission List Model Tests', function () {

    before(function (done) {
        database.mongoConnect(databaseURL, db => {
            done();
        });
    });

    it('should retrieve empty submissions list from database', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            expect(data.length).to.be.equal(0);
            done();
        });
    });

    it('should create test submission in the database', function (done) {
        let submission = new SubmissionModel('testCode', 'base', '2018-2019', 'module', 'Edit',
            '', '', JSON.stringify({ code: 'test2' }), JSON.stringify({ code: 'test' }), '', null);
        submission.save('submissions').then(() => {
            done();
        });
    });

    it('should retrieve submissions list from database with 1 object in it', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            expect(data.length).to.be.equal(1);
            done();
        });
    });

    it('should update submission status in the database', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            SubmissionModel.approveSubmissionById(data[0]._id, 'submissions').then(() => {
                done();
            })           
        });
    });

    it('should get "Approved" for the submissions status.', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            expect(data[0].status).to.be.equal('Approved');
            done();
        });
    });
    

    it('should delete test submission from the list', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            SubmissionModel.deleteSubmissionById(data[0]._id, 'submissions').then(() => {
                done();
            })           
        });
    });

    it('should retrieve an empty submissions list from database', function (done) {
        SubmissionModel.getSubmissionsList('submissions').then(data => {
            expect(data.length).to.be.equal(0);
            done();
        });
    });


    after(function (done) {
        database.mongoDisconnect(() => {
            done();
        });
    });
});