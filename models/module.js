const fileFunctions = require('../util/files.js');

/**
 * Module Specification used to create a new Module file.
 * Takes an data object which contains the data this
 * module will consist of.
 */
class Module {
    constructor(moduleEditFormData) {

        this.title = moduleEditFormData.title;
        this.code = moduleEditFormData.code;
        this.credits = moduleEditFormData.credits;
        this.semester = moduleEditFormData.semester;
        this.lecturers = [];
        this.teachingpattern = [moduleEditFormData.teachingPattern];
        this.aims = moduleEditFormData.aims;
        this.objectives = [];
        this.syllabus = moduleEditFormData.syllabus;
        this.topics = {};
        this.assessment = {};
        this.prerequisites = {};
        this.deliverynotes = moduleEditFormData.deliveryNotes;
        this.accreditation = [];
        this.study_abroad = moduleEditFormData.studyAbroad;
        this.assessment_details = moduleEditFormData.assessmentDetails;
        this.assessment_timetable = {};
    
        for (let i=0; i<4; i++) {
            const name = moduleEditFormData['lecturer'+i+'Name']; 
            const email = moduleEditFormData['lecturer'+i+'Email']; 
            if (name != "") {
                this.lecturers.push({'name': name, 'email': email})
            }
            
        }
    
        for (let i=0; i<3; i++) {
            let items = {};
            const subheading = moduleEditFormData['objective'+i+'Subheading'];
            const firstItemValue = moduleEditFormData['obj'+i+'itemValue1'];
            if (subheading != "" || firstItemValue != "") {
                for (let j=1; j<10; j++) {
                    const tempItemKey =  moduleEditFormData['obj'+i+'itemKey'+j];
                    const tempItemValue = moduleEditFormData['obj'+i+'itemValue'+j];
                    if (tempItemValue != "") {
                        items[tempItemKey] = tempItemValue;
                    }
                }
                this.objectives.push({'subheading': subheading, 'items': items});
            }
        }
    
        for (let i=1; i<=12; i++) {
            const tempTopicObjectives = moduleEditFormData['t'+i+'objectives'];
            const tempTopicWeek = moduleEditFormData['t'+i+'week'];
            const tempTopicTitle = moduleEditFormData['t'+i+'title'];
            if (tempTopicObjectives != "" || tempTopicWeek != "" || tempTopicTitle != "") {
                this.topics['t'+i] = {'objectives': tempTopicObjectives, 'week': tempTopicWeek, 'title': tempTopicTitle};
            }
        }
    
        for (let i=0; i<6; i++) {
            const tempAssessmentType = moduleEditFormData['assessment'+i+'Type'];
            if (tempAssessmentType != "") {
                const tempAssessmentName = moduleEditFormData['assessment'+i+'Name'];
                const tempAssessmentWeight = moduleEditFormData['assessment'+i+'Weight'];
                const tempAssessmentQualifyingMark = moduleEditFormData['assessment'+i+'QualifyingMark'];
                const tempAssessmentExtra = moduleEditFormData['assessment'+i+'Extra'];
                const tempAssessmentReassessment = moduleEditFormData['assessment'+i+'Reassessment'];
    
                this.assessment[tempAssessmentType] = {
                    "name": tempAssessmentName,
                    "weight": tempAssessmentWeight,
                    "qualifyingmark": tempAssessmentQualifyingMark,
                    "extra": tempAssessmentExtra,
                    "reassessment": tempAssessmentReassessment
                }
            }
        }
    
        for (let i=0; i<3; i++) {
            const tempPrerequisiteKey = moduleEditFormData['p'+i+'Key'];
            const tempPrerequisiteValue = moduleEditFormData['p'+i+'Value'];
            if (tempPrerequisiteKey != "") {
                this.prerequisites[tempPrerequisiteKey] = tempPrerequisiteValue;
            }
        }
    
        for (let i=0; i<25; i++) {
            const tempAssessmentTimetableKey = moduleEditFormData['at'+i+'key'];
            if (tempAssessmentTimetableKey != "") {
                const atWeight = moduleEditFormData['at'+i+'Weight'];
                const atObjectives = moduleEditFormData['at'+i+'Objectives'];
                const atType = moduleEditFormData['at'+i+'Type'];
                const atHWFS = moduleEditFormData['at'+i+'HWFS'];
                const atFWFL = moduleEditFormData['at'+i+'FWFL'];
                const atPSWFL = moduleEditFormData['at'+i+'PSWFL'];
                const atFWFTA = moduleEditFormData['at'+i+'FWFTA'];
                const atPSWFTA = moduleEditFormData['at'+i+'PSWFTA'];
                const atFWFPS = moduleEditFormData['at'+i+'FWFPS'];
                const atPSWFPS = moduleEditFormData['at'+i+'PSWFPS'];
                const atReleased = moduleEditFormData['at'+i+'Released'];
                const atDue = moduleEditFormData['at'+i+'Due'];
                const atFeedback = moduleEditFormData['at'+i+'Feedback'];
    
                this.assessment_timetable[tempAssessmentTimetableKey] = {
                    "weight": atWeight,
                    "objectives": atObjectives,
                    "type": atType,
                    "hours_work_for_student": atHWFS,
                    "fixed_work_for_lecturer": atFWFL,
                    "per_student_work_for_lecturer": atPSWFL,
                    "fixed_work_for_ta": atFWFTA,
                    "per_student_work_for_ta": atPSWFTA,
                    "fixed_work_for_ps": atFWFPS,
                    "per_student_work_for_ps": atPSWFPS,
                    "released": atReleased,
                    "due": atDue,
                    "feedback": atFeedback  
                }
            }
        }
    
        let accreditationOne = {}
        const accreditationOneBody = moduleEditFormData.accreditationOneBody;
        if (accreditationOneBody != "") {
            let criteriaMapping = {};
            for (let i=0; i<15; i++) {
                const tempCMKey = moduleEditFormData['aOneCriteria'+i+'Key'];
                const tempLO = moduleEditFormData['A1C'+i+'lo'];
                const tempJustify = moduleEditFormData['A1C'+i+'justify'];
                if (tempCMKey != "") {
                    criteriaMapping[tempCMKey] = { "lo": tempLO, "justify": tempJustify};
                }
            }
            accreditationOne = {"accreditation_body": accreditationOneBody, "criteria_mapping": criteriaMapping};
            this.accreditation.push(accreditationOne);
        }
    
        let accreditationTwo = {}
        const accreditationTwoBody = moduleEditFormData.accreditationTwoBody;
        if (accreditationTwoBody != "") {
            let criteriaMapping = {};
            for (let i=0; i<24; i++) {
                const tempCMKey = moduleEditFormData['aTwoCriteria'+i+'Key'];
                const tempLO = moduleEditFormData['A2C'+i+'lo'];
                const tempJustify = moduleEditFormData['A2C'+i+'justify'];
                if (tempCMKey != "") {
                    criteriaMapping[tempCMKey] = { "lo": tempLO, "justify": tempJustify};
                }
            }
            accreditationTwo = {"accreditation_body": accreditationTwoBody, "criteria_mapping": criteriaMapping};
            this.accreditation.push(accreditationTwo);
        }
    }

    /**
     * Creates the modules JSON file for the provided year.
     * @param {String} year 
     * @param {String} code 
     * @param {Object} data 
     */
    static createNewModuleFile(year, code, data) {
        return fileFunctions.writeJSONFile('modules', year, code, data);
    }

    /**
     * Reads the module file from the storage and return it in a callback.
     * @param {String} moduleCode 
     * @param {String} version 
     * @param {Callback} cb 
     */
    static readModuleFromFiles(moduleCode, version, cb) {
        fileFunctions.readJSONFile(cb, 'modules', version, moduleCode);
    }

    /**
     * Takes a module and compare it to this module. Then returns an
     * object in the callback which consist of the all the properties which 
     * were different in this module compare to the other module.
     * @param {Module Object} otherModule 
     * @param {Callback} cb 
     */
    static getDifferences(firstModule, otherModule, cb) {
        let differences = {};

        if (firstModule.title != otherModule.title) differences['title'] = firstModule.title;
        if (firstModule.code != otherModule.code) differences['code'] = firstModule.code;
        if (firstModule.credits != otherModule.credits) differences['credits'] = firstModule.credits;
        if (firstModule.semester != otherModule.semester) differences['semester'] = firstModule.semester;
        if (JSON.stringify(firstModule.lecturers) != JSON.stringify(otherModule.lecturers)) differences['lecturers'] = firstModule.lecturers;
        if (firstModule.teachingpattern[0] != otherModule.teachingpattern[0]) differences['teachingpattern'] = [firstModule.teachingpattern[0]];
        if (firstModule.aims != otherModule.aims) differences['aims'] = firstModule.aims;
        if (JSON.stringify(firstModule.objectives) != JSON.stringify(otherModule.objectives)) differences['objectives'] = firstModule.objectives;
        if (firstModule.syllabus != otherModule.syllabus) differences['syllabus'] = firstModule.syllabus;
        if (JSON.stringify(firstModule.topics) != JSON.stringify(otherModule.topics)) differences['topics'] = firstModule.topics;
        if (JSON.stringify(firstModule.assessment) != JSON.stringify(otherModule.assessment)) differences['assessment'] = firstModule.assessment;
        if (JSON.stringify(firstModule.prerequisites) != JSON.stringify(otherModule.prerequisites)) differences['prerequisites'] = firstModule.prerequisites;
        if (firstModule.deliverynotes != otherModule.deliverynotes) differences['deliverynotes'] = firstModule.deliverynotes;
        if (JSON.stringify(firstModule.accreditation) != JSON.stringify(otherModule.accreditation)) differences['accreditation'] = firstModule.accreditation;
        if (firstModule.study_abroad != otherModule.study_abroad) differences['study_abroad'] = firstModule.study_abroad;
        if (firstModule.assessment_details != otherModule.assessment_details) differences['assessment_details'] = firstModule.assessment_details;
        if (JSON.stringify(firstModule.assessment_timetable) != JSON.stringify(otherModule.assessment_timetable)) differences['assessment_timetable'] = firstModule.assessment_timetable;  
        
        cb(differences);
    }
}

module.exports = Module