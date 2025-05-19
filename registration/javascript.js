var common = {
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    },
    trimPhoneNumber: function (str) {
        return str.replace(/[^0-9a-z]/gi, '');
    },
    stringToTimestamp: function(dateString){
        var parts = dateString.split("/");
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[2], 10);
        return new Date(year, month-1, day).getTime();
    },
    isValidDate: function (dateString) {
        if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
            return false;
        var parts = dateString.split("/");
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[2], 10);
        if(year < 1000 || year > 3000 || month == 0 || month > 12)
            return false;
        var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
            monthLength[1] = 29;
        return day > 0 && day <= monthLength[month - 1];
    },
    isValidEmail: function(email) {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return filter.test(email);
    },
    isNumber: function(num) {
        return /^\d+$/.test(num);
    },
    addEvent: function(el, eve, handler) {
        if (el && el.addEventListener) {
           el.addEventListener(eve, handler, false);
        } else if (el && el.attachEvent)  {
            el.attachEvent('on'+eve, handler);
        }
    },
    getCookie: function (c_name) {
        var name, value;
        var cookies = document.cookie.split(";");
        for (var i=0; i<cookies.length; i++){
            name = cookies[i].substr( 0, cookies[i].indexOf("=") );
            value = cookies[i].substr( cookies[i].indexOf("=")+1 );
            name = name.replace(/^\s+|\s+$/g,"");
            if (name == escape(c_name)) {
                return unescape(value);
            }
        }
        return false;
    },
    setCookie: function (name, value, expires){
        if (typeof name == 'undefined' || typeof value == 'undefined') {
            return false;
        }
        var cook = escape(name)+'='+escape(value)+';';
        if (typeof expires != 'undefined') {
            cook += ' expires='+expires.toGMTString()+';';
        }
        document.cookie = cook;
    }
};
var ajax = {
    get: function (url, callback) {
        var objXmlHttp;
        if (window.XMLHttpRequest) {
            objXmlHttp = new XMLHttpRequest();
        } else {
            objXmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        objXmlHttp.onreadystatechange = function () {
            if (objXmlHttp.readyState == 4) {
                var json;
                var text = objXmlHttp.responseText;
                var status = objXmlHttp.status;
                try {
                    json = JSON.parse(text);
                } catch (e) {}
                callback(status, json, text);
            }
        };
        if (url.indexOf('?') == -1) {
            url += '?token=' + Math.random();
        } else {
            url += '&token=' + Math.random();
        }
        objXmlHttp.open("GET", url, true);
        if (common.getCookie('session')) {
            objXmlHttp.setRequestHeader("X-Auth-Token",common.getCookie('session'));
        }
        objXmlHttp.send();
    },
    post: function (url, data, callback) {
        if (typeof data == "object") {
            var str = '';
            for (var i in data){
                str += i+'='+data[i]+'&';
            }
            data = str.slice(0, -1); /*encodeURI*/
        }
        var objXmlHttp;
        if (window.XMLHttpRequest) {
            objXmlHttp = new XMLHttpRequest();
        } else {
            objXmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        objXmlHttp.onreadystatechange = function () {
            if (objXmlHttp.readyState == 4) {
                var json;
                var text = objXmlHttp.responseText;
                var status = objXmlHttp.status;
                try {
                    json = JSON.parse(text);
                } catch (e) {}
                callback(status, json, text);
            }
        };
        objXmlHttp.open("POST", url, true);
        objXmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        if (common.getCookie('session')) {
            objXmlHttp.setRequestHeader("X-Auth-Token",common.getCookie('session'));
        }
        objXmlHttp.send(data);
    },
    json: function (url, data, callback) {
        var objXmlHttp;
        if (window.XMLHttpRequest) {
            objXmlHttp = new XMLHttpRequest();
        } else {
            objXmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        objXmlHttp.onreadystatechange = function () {
            if (objXmlHttp.readyState == 4) {
                var json;
                var text = objXmlHttp.responseText;
                var status = objXmlHttp.status;
                try {
                    json = JSON.parse(text);
                } catch (e) {}
                callback(status, json, text);
            }
        };
        objXmlHttp.open("POST", url, true);
        objXmlHttp.setRequestHeader("Content-type","application/json;charset=UTF-8");
        if (common.getCookie('session')) {
            objXmlHttp.setRequestHeader("X-Auth-Token",common.getCookie('session'));
        }
        objXmlHttp.send(JSON.stringify(data));
    }
};

var errorsMap = {
    localEmptyFieldError: 'ფიფქით მონიშნული ველების შევსება სავალდებულოა',
    localPhoneNumberError: 'ტელეფონის ნომრის ველში სიმბოლოების რაოდენობა უნდა შეადგენდეს 9 ციფრს',
    localPhoneIndexError: 'ტელეფონის ნომრის ველში მობილური სატელეფონო ინდექსი უნდა იწყებოდეს 5-ით',
    localEmailError: 'ელ.ფოსტის მისამართი მიუთითეთ კორექტულად (name@domain.zone)',
    localDateFormatError: 'დაბადების თარიღი მიუთითეთ კორექტულად - dd/mm/yyyy',
    AgeNotInRangeError: 'მითითებული ასაკი არ შეესაბამება პირველ კლასში ჩასარიცხი მოსწავლის ასაკს',
    InvalidPersonalNoError: 'ბავშვი ვერ მოიძებნა სამოქალაქო რეესტრში! გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე',
    InvalidFirstnameError: 'ბავშვი ვერ მოიძებნა სამოქალაქო რეესტრში! გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე',
    InvalidLastnameError: 'ბავშვი ვერ მოიძებნა სამოქალაქო რეესტრში! გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე',
    AlreadyRegisteredError: 'მითითებული პირადი ნომრით მოსწავლე უკვე დარეგისტრირებულია',
    PersonNotFoundError: 'ბავშვი ვერ მოიძებნა სამოქალაქო რეესტრში! გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე',
    ServiceUnavailableError: '',
    AlreadyActivePupilError: 'მითითებული პირადი ნომრით მოსწავლე უკვე დარეგისტრირებულია სისტემაში',
    MissingParameterError: 'გამოტოვებლია რომელიმე პარამეტრი',
    UnregisterNotAllowed: 'მითითებული პიროვნების რეგისტრაციის გაუქმება შეზღუდულია, გთხოვთ მიმართოთ ზოგადსაგანმანათლებლო დაწესებულებას',
    StatusActive: 'თქვენ წარმატებით გაიარეთ რეგისტრაცია',
    StatusPassive: 'მონაცემები შენახულია. რეგისტრაცია გააქტიურდება მოსწავლის დის ან ძმის დარეგისტრირების შემთხვევაში.'
};

function Registration(regStage, initData) {

    var onStepGoing;
    var onAuthGoing;
    var step = 0;
    var localInfo = true;
    var relation = 0;
    var relationInfo = 0;
    var hasLimit = false;
    var that = this;
    var citizenshipsLoaded;
    var regionsLoaded;
    var schoolsList = [];
    var authCalls = [];
    var registratorScools;
    var xSessionKey = initData.id;
    var schoolWithMessage_1 = [
        '15', '262', '182', '34', '954', '1035', '746', '1914'
    ];

    var schoolWithMessage_1_text = 'ახორციელებს განვითარების შეფერხების, სენსორული, ქცევისა და ემოციური დარღვევების მქონე ბავშვთა სპეციალურ საგანმანათლებლო პროგრამებს';
    function getSpecialEducationNeed(){return document.getElementById('st1Stage0Rb').checked;}
    function getPersonalNumber(){return common.trim(document.getElementById('st1PersonalNumber').value);}
    function getFirstName(){return common.trim(document.getElementById('st1FirstName').value);}
    function getLastName(){return common.trim(document.getElementById('st1LastName').value);}
    function getBirthdate(){return common.trim(document.getElementById('st1Birthdate').value);}
    function getGender(){return common.trim(document.getElementById('st1Gender').value);}
    function getCountry(){return common.trim(document.getElementById('st1Country').value);}
    function getParentType(){return common.trim(document.getElementById('st2ListParentType').value);}
    function getParentPersonalNumber(){return common.trim(document.getElementById('st2ParentPersonalNumber').value);}
    function getParentFirstName(){return common.trim(document.getElementById('st2ParentFirstName').value);}
    function getParentLastName(){return common.trim(document.getElementById('st2ParentLastName').value);}
    function getPhoneNumber(){return common.trimPhoneNumber(document.getElementById('st2PhoneNumber').value);}
    function getEmail(){return common.trim(document.getElementById('st2Email').value);}
    function getRegion(){return common.trim(document.getElementById('st3ListRegion').value);}
    function getDistrict(){return common.trim(document.getElementById('st3ListDistrict').value);}
    function getSchool(){return common.trim(document.getElementById('st3ListSchool').value);}
    function getSector(){return common.trim(document.getElementById('st3ListSector').value);}
    function getShift(){return common.trim(document.getElementById('st3ListShift').value);}

    function getCaptcha(){return common.trim(document.getElementById('recaptcha_response_field').value);}
    function getCaptchaChallenge(){return common.trim(document.getElementById('recaptcha_challenge_field').value);}

    function getAll() {
        var data = {
            isForeigner: !localInfo,
            isSpecialEducationNeed: getSpecialEducationNeed(),
            personalNumber: localInfo && getPersonalNumber(),
            firstName: getFirstName(),
            lastName: getLastName(),
            birthdate: common.stringToTimestamp(getBirthdate()),
            genderId: getGender(),
            countryId: localInfo ? 93 : getCountry(),
            parentType: getParentType(),
            parentPersonalNumber: getParentPersonalNumber(),
            parentFirstName: getParentFirstName(),
            parentLastName: getParentLastName(),
            phoneNumber: getPhoneNumber(),
            email: getEmail(),
            regionId: getRegion(),
            district: getDistrict(),
            schoolId: getSchool(),
            sectorId: getSector(),
            shiftNumber: getShift()
        };
        if (regStage == 1) {
            data['relation'] = relation;
        }
        if (initData.hasOwnProperty('captcha') && initData.captcha && grecaptcha && grecaptcha.getResponse()) {
            data['g-recaptcha-response'] = grecaptcha.getResponse()

        }
        return data;
    }

    function loading() {
        var form = document.getElementById('mainForm');
        var bb = document.getElementById('blockBody');
        bb.className = "bbEnabled";
        bb.style.height = form.offsetHeight + 'px';
        form.className = 'mainForm hideElement';
    }
    function loaded() {
        var form = document.getElementById('mainForm');
        form.className = 'mainForm showElement';
        var bb = document.getElementById('blockBody');
        bb.className = "bbDisabled";
        bb.style.height = '100%';
    }

    function activateStep1() {
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;
        var a = document.getElementById('aStep1');
        a.className = 'selected';
        var a = document.getElementById('aStep2');
        a.className = 'disabled';

        var st1 = document.getElementById('formContainerStep1');
        var st2 = document.getElementById('formContainerStep2');
        st1.style.display = '';
        st2.style.display = 'none';
    }
    function activateStep2() {
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action";
        btn.disabled = false;
        /*back*/
        var btn = document.getElementById('btnNext');
        btn.innerHTML = 'შემდეგი';
        /*end-back*/

        var a = document.getElementById('aStep1');
        a.className = 'done';
        var a = document.getElementById('aStep2');
        a.className = 'selected';
        /*back*/
        var a = document.getElementById('aStep3');
        a.className = 'disabled';
        /*end-back*/

        var st1 = document.getElementById('formContainerStep1');
        var st2 = document.getElementById('formContainerStep2');
        /*back*/
        var st3 = document.getElementById('formContainerStep3');
        st3.style.display = 'none';
        /*end-back*/
        st1.style.display = 'none';
        st2.style.display = '';

        var errorUl = document.getElementById('errorUlMsgStep2');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
    }
    function activateStep3() {
        var btn = document.getElementById('btnNext');
        btn.innerHTML = 'დასრულება';
        var a = document.getElementById('aStep2');
        a.className = 'done';
        var a = document.getElementById('aStep3');
        a.className = 'selected';
        var st2 = document.getElementById('formContainerStep2');
        var st3 = document.getElementById('formContainerStep3');
        st2.style.display = 'none';
        st3.style.display = '';

        var errorUl = document.getElementById('errorUlMsgStep3');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
    }
    function activateStep4() {
        var btn = document.getElementById('btnNext');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;
        var btn = document.getElementById('btnFinish');
        btn.className = "btn-action";
        btn.disabled = false;

        var a = document.getElementById('aStep3');
        a.className = 'done';
        var a = document.getElementById('aStep4');
        a.className = 'selected';
        var st2 = document.getElementById('formContainerStep3');
        var st3 = document.getElementById('formContainerStep4');
        st2.style.display = 'none';
        st3.style.display = '';
    }

    var stepNextFunctions = [
        function () {
            //STEP 1 index=0
            function next(data) {
                loading();
                onStepGoing = true;

                var ul = document.createElement('ul');
                ul.id = 'errorUlMsgStep1';
                ul.className = 'stepsErrorMsg';
                var li = document.createElement('li');
                ul.appendChild(li);

                ajax.json('/api/pupil/validate', data, function(status, dataJson, text) {
                    if (status == 200) {

                        activateStep2();
                        loaded();

                        step++;
                        onStepGoing = false;
                    } else if (dataJson) {
                        if (dataJson.code) {
                            if (dataJson.code == "NotAuthorized" && (regStage == 1 || regStage == 3)) {
                                needAuth();
                            } else {
                                var text = document.createTextNode('');
                                switch (dataJson.code) {
                                    case "AgeNotInRangeError":
                                        text = document.createTextNode(errorsMap.AgeNotInRangeError);
                                        break;
                                    case "InvalidPersonalNoError":
                                        text = document.createTextNode(errorsMap.InvalidPersonalNoError);
                                        break;
                                    case "InvalidFirstnameError":
                                        text = document.createTextNode(errorsMap.InvalidFirstnameError);
                                        break;
                                    case "InvalidLastnameError":
                                        text = document.createTextNode(errorsMap.InvalidLastnameError);
                                        break;
                                    case "AlreadyRegisteredError":
                                        text = document.createTextNode(errorsMap.AlreadyRegisteredError);
                                        break;
                                    case "PersonNotFoundError":
                                        text = document.createTextNode(errorsMap.PersonNotFoundError);
                                        break;
                                    case "ServiceUnavailableError":
                                        text = document.createTextNode(errorsMap.ServiceUnavailableError);
                                        break;
                                    case "AlreadyActivePupilError":
                                        text = document.createTextNode(errorsMap.AlreadyActivePupilError);
                                        break;
                                    default:
                                        try {
                                            text = document.createTextNode(dataJson.code.toString());
                                        }catch(e){}
                                        break;
                                }
                                li.appendChild(text);
                                errorDiv.appendChild(ul);
                            }
                            onStepGoing = false;
                            loaded();
                        } else if (dataJson.message){
                            var text = '';
                            if (dataJson.message == "Invalid personal number") {
                                text = document.createTextNode(errorsMap.InvalidPersonalNoError);
                            } else {
                                text = document.createTextNode('');
                            }
                            li.appendChild(text);
                            errorDiv.appendChild(ul);
                            onStepGoing = false;
                            loaded();
                        } else {
                            var text = document.createTextNode('');
                            li.appendChild(text);
                            errorDiv.appendChild(ul);
                            onStepGoing = false;
                            loaded();
                        }
                    } else {
                        var text = document.createTextNode('');
                        li.appendChild(text);
                        errorDiv.appendChild(ul);
                        onStepGoing = false;
                        loaded();
                    }
                });
            }

            var errorDiv = document.getElementById('errorDivMsgStep1');
            var errorUl = document.getElementById('errorUlMsgStep1');
            if (errorUl) {
                errorUl.parentNode.removeChild(errorUl);
            }

            var radio = document.getElementById('st1Citizenship_0');
            if (radio.checked) {
                var personalNumber = getPersonalNumber();
                var firstName = getFirstName();
                var lastName = getLastName();

                if (personalNumber && firstName && lastName &&
                            (regStage != 1 || (regStage == 1 && relation != 0))
                        ) {
                    next({
                        personalNo: personalNumber,
                        firstname: firstName,
                        lastname: lastName
                    });
                } else {
                    var ul = document.createElement('ul');
                    ul.id = 'errorUlMsgStep1';
                    ul.className = 'stepsErrorMsg';
                    var li = document.createElement('li');
                    if (!personalNumber || !firstName || !lastName || (regStage == 1 && relation == 0)) {
                        li.innerHTML = errorsMap.localEmptyFieldError;
                    } else {
                        li.innerHTML = errorsMap.localEmptyFieldError;
                    }
                    ul.appendChild(li);
                    errorDiv.appendChild(ul);
                }
            } else {
                var firstName = getFirstName();
                var lastName = getLastName();
                var birthdate = getBirthdate();
                var gender = getGender();
                var country = getCountry();

                if (firstName && lastName && common.isValidDate(birthdate) && gender != -1 && country != -1 &&
                            (regStage != 1 || (regStage == 1 && relation != 0))
                        ) {
                    loading();
                    onStepGoing = true;
                    activateStep2();
                    loaded();
                    step++;
                    onStepGoing = false;
                } else {
                    var ul = document.createElement('ul');
                    ul.id = 'errorUlMsgStep1';
                    ul.className = 'stepsErrorMsg';
                    if (!firstName || !lastName || gender == -1 || country == -1) {
                        var li = document.createElement('li');
                        li.innerHTML = errorsMap.localEmptyFieldError;
                        ul.appendChild(li);
                    }
                    if (birthdate && !common.isValidDate(birthdate)) {
                        var li = document.createElement('li');
                        li.innerHTML = errorsMap.localDateFormatError;
                        ul.appendChild(li);
                    }
                    ul.appendChild(li);
                    errorDiv.appendChild(ul);
                }
            }
        },
        function () {
            //STEP 2 index=1
            var errorDiv = document.getElementById('errorDivMsgStep2');
            var errorUl = document.getElementById('errorUlMsgStep2');
            if (errorUl) {
                errorUl.parentNode.removeChild(errorUl);
            }

            var parentType = getParentType();
            var personalNumber = getParentPersonalNumber();
            var firstName = getParentFirstName();
            var lastName = getParentLastName();
            var phoneNumber = getPhoneNumber();
            var email = getEmail();

            if (parentType != -1 && personalNumber &&
                    firstName && lastName &&
                    phoneNumber && common.isNumber(phoneNumber) && phoneNumber.length == 9 && phoneNumber[0] == 5 &&
                    (!email || (email && common.isValidEmail(email)))
                    ) {
                loading();
                onStepGoing = true;

                activateStep3();

                loaded();
                step++;
                onStepGoing = false;
            } else {
                var plis = [];
                var allLi;

                if (parentType == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (!personalNumber) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (!firstName) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (!lastName) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (!phoneNumber) {
                    var li = document.createElement('li');
                    var text = document.createTextNode(errorsMap.localPhoneNumberError);
                    li.appendChild(text);
                    plis.push(li);
                } else if (!common.isNumber(phoneNumber)) {
                    var li = document.createElement('li');
                    var text = document.createTextNode(errorsMap.localPhoneNumberError);
                    li.appendChild(text);
                    plis.push(li);
                } else if (phoneNumber.length != 9) {
                    var li = document.createElement('li');
                    var text = document.createTextNode(errorsMap.localPhoneNumberError);
                    li.appendChild(text);
                    plis.push(li);
                } else if (phoneNumber[0] != 5) {
                    var li = document.createElement('li');
                    var text = document.createTextNode(errorsMap.localPhoneIndexError);
                    li.appendChild(text);
                    plis.push(li);
                }
                if (email && !common.isValidEmail(email)) {
                    var li = document.createElement('li');
                    var text = document.createTextNode(errorsMap.localEmailError);
                    li.appendChild(text);
                    plis.push(li);
                }

                var ul = document.createElement('ul');
                ul.id = 'errorUlMsgStep2';
                ul.className = 'stepsErrorMsg';

                if (phoneNumber
                        || ((!common.isNumber(phoneNumber) || phoneNumber.length != 9 || phoneNumber[0] != 5))
                        || (email && !common.isValidEmail(email))) {
                    for (var l = 0; l < plis.length; l++) {
                        ul.appendChild(plis[l]);
                    }
                }
                if (allLi) {
                    ul.appendChild(allLi);
                }
                errorDiv.appendChild(ul);
            }
        },
        function () {
            //STEP 3 index=2
            var errorDiv = document.getElementById('errorDivMsgStep3');
            var errorUl = document.getElementById('errorUlMsgStep3');
            if (errorUl) {
                errorUl.parentNode.removeChild(errorUl);
            }
            var region = getRegion();
            var district = getDistrict();
            var school = getSchool();
            var sector = getSector();
            var shift = getShift();
            var shiftIsVisible = document.getElementById('st3ShiftRow').style.display !== 'none';

            if (region != -1 && district != -1 && school != -1 && sector != -1 && hasLimit && (!shiftIsVisible || shiftIsVisible && shift != -1)) {
                loading();
                onStepGoing = true;

                var sendData = getAll();

                ajax.json('/api/register?key='+xSessionKey, sendData, function(status, dataJson, text) {
                    if (status == 200 && dataJson && dataJson.registrationCode) {
                        var school = document.getElementById('st4School');
                        var personalNumber = document.getElementById('st4PersonalNumber');
                        var firstName = document.getElementById('st4FirstName');
                        var lastName = document.getElementById('st4LastName');
                        var registrator = document.getElementById('st4Registrator');
                        var parentName = document.getElementById('st4ParentName');
                        var parentSurname = document.getElementById('st4ParentSurname');
                        var parentPhone = document.getElementById('st4ParentPhone');
                        var registrationCode = document.getElementById('st4RegistrationCode');
                        var activeStatus = document.getElementById('st4RegistrationStatus');

                        var schoolId = getSchool();
                        for (var i=0; i<schoolsList.length; i++){
                            if (schoolsList[i].schoolId == schoolId) {
                                school.innerHTML = schoolsList[i].schoolName;
                                break;
                            }
                        }
                        personalNumber.innerHTML = dataJson.personalNo ? '<b>'+dataJson.personalNo+'</b>' : getPersonalNumber();
                        firstName.innerHTML = dataJson.firstName ? dataJson.firstName : getFirstName();
                        lastName.innerHTML = getLastName();
                        activeStatus.innerHTML = dataJson.passive && dataJson.passive == 1 ? errorsMap.StatusPassive : errorsMap.StatusActive;
                        switch(getParentType()) {
                            case '0':
                                registrator.innerHTML = 'დედა';
                                break;
                            case '1':
                                registrator.innerHTML = 'მამა';
                                break;
                            case '2':
                                registrator.innerHTML = 'მეურვე';
                                break;
                        }
                        parentName.innerHTML = getParentFirstName();
                        parentSurname.innerHTML = getParentLastName();
                        parentPhone.innerHTML = getPhoneNumber();
                        registrationCode.innerHTML = dataJson.registrationCode;


                        activateStep4();

                        loaded();
                        step++;
                        onStepGoing = false;
                    } else if (dataJson) {
                        if (dataJson.code) {
                            if (dataJson.code == "NotAuthorized") {
                                needAuth();
                            } else {
                                var text = document.createTextNode('');
                                switch (dataJson.code) {
                                    case "AgeNotInRangeError":
                                        text = document.createTextNode(errorsMap.AgeNotInRangeError);
                                        break;
                                    case "InternalServerError":
                                        text = document.createTextNode('');
                                        break;
                                    case "InvalidPersonalNoError":
                                        text = document.createTextNode(errorsMap.InvalidPersonalNoError);
                                        break;
                                    case "PersonNotFoundError":
                                        text = document.createTextNode(errorsMap.PersonNotFoundError);
                                        break;
                                    case "InvalidGenderError":
                                        text = document.createTextNode('სქესი არასწორადაა მითითებული');
                                        break;
                                    case "InvalidEmailError":
                                        text = document.createTextNode(errorsMap.localEmailError);
                                        break;
                                    case "InvalidParentTypeError":
                                        text = document.createTextNode('მშობელი არასწორადაა მითითებული');
                                        break;
                                    case "InvalidPhoneNumberError":
                                        text = document.createTextNode(errorsMap.localPhoneNumberError);
                                        break;
                                    case "InvalidRelationTypeError":
                                        text = document.createTextNode('ნათესაური კავშირი არ არის მითითებული');
                                        break;
                                    case "NoSiblingFoundInSchoolError":
                                        text = document.createTextNode('და ან ძმა არ მოიძებნა ამ სკოლაში');
                                        break;
                                    case "NoParentPersonelFoundInSchoolError":
                                        text = document.createTextNode('მშობელი არ მოიძებნა ამ სკოლაში');
                                        break;
                                    case 'LimitIsFullError':
                                    case "UnableToRegisterError":
                                        text = document.createTextNode('ლიმიტი ამოწურულია');
                                        var span = document.getElementById('st3LabelRemaining');
                                        span.innerHTML = 'თავისუფალი ადგილების რაოდენობა: 0';
                                        span.style.color = 'black';
                                        break;
                                    case "AlreadyRegisteredError":
                                        text = document.createTextNode(errorsMap.AlreadyRegisteredError);
                                        break;
                                    case "AlreadyActivePupilError":
                                        text = document.createTextNode(errorsMap.AlreadyActivePupilError);
                                        break;
                                    case "ServiceUnavailableError":
                                        text = document.createTextNode(errorsMap.ServiceUnavailableError);
                                        break;
                                    case "MissingParameterError":
                                        text = document.createTextNode(errorsMap.MissingParameterError);
                                        break;
                                    case "InvalidCaptchaError":
                                        text = document.createTextNode('გთხოვთ გაიაროთ ვერიფიკაცია');
                                        if (initData.hasOwnProperty('captcha') && initData.captcha && grecaptcha) {
                                            grecaptcha.reset()
                                        }
                                        break;
                                    default:
                                        try {
                                            text = document.createTextNode(dataJson.code.toString());
                                        }catch(e){}
                                        break;
                                }
                                var ul = document.createElement('ul');
                                ul.id = 'errorUlMsgStep3';
                                ul.className = 'stepsErrorMsg';
                                var li = document.createElement('li');
                                li.appendChild(text);
                                ul.appendChild(li);
                                errorDiv.appendChild(ul);
                            }
                            onStepGoing = false;
                            loaded();
                        } else {
                            var ul = document.createElement('ul');
                            ul.id = 'errorUlMsgStep3';
                            ul.className = 'stepsErrorMsg';
                            var li = document.createElement('li');
                            var text = document.createTextNode('');
                            li.appendChild(text);
                            ul.appendChild(li);
                            errorDiv.appendChild(ul);
                            onStepGoing = false;
                            loaded();
                        }
                    } else {
                        var ul = document.createElement('ul');
                        ul.id = 'errorUlMsgStep3';
                        ul.className = 'stepsErrorMsg';
                        var li = document.createElement('li');
                        var text = document.createTextNode('');
                        li.appendChild(text);
                        ul.appendChild(li);
                        errorDiv.appendChild(ul);
                        onStepGoing = false;
                        loaded();
                    }
                });

            } else {
                var allLi;
                if (region == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (district == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (school == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (sector == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (shiftIsVisible && shift == -1) {
                    allLi = document.createElement('li');
                    allLi.innerHTML = errorsMap.localEmptyFieldError;
                }
                if (!hasLimit) {
                    var limitDiv = document.getElementById('st3LabelRemaining');
                    if (limitDiv) {
                        limitDiv.style.color = 'red';
                    }
                }

                if (allLi) {
                    var ul = document.createElement('ul');
                    ul.id = 'errorUlMsgStep3';
                    ul.className = 'stepsErrorMsg';
                    ul.appendChild(allLi);
                    errorDiv.appendChild(ul);
                }
            }
        }
    ];
    var stepBackFunctions = [
        function () {
            if (onStepGoing) return;
            onStepGoing = true;
            activateStep1();
            onStepGoing = false;
        },
        function () {
            if (onStepGoing) return;
            onStepGoing = true;
            activateStep2();
            onStepGoing = false;
        }
    ];

    this.nextStep = function () {
        if (onStepGoing) return;
        stepNextFunctions[step]();
    };
    this.previewStep = function () {
        if (onStepGoing) return;
        step--;
        stepBackFunctions[step]();
    };
    this.finish = function () {
        if (onStepGoing) return;
        window.location.href = '/';
    };
    this.localUser = function () {
        var errorDiv = document.getElementById('errorDivMsgStep1');
        var errorUl = document.getElementById('errorUlMsgStep1');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
        document.getElementById('st1trPersonalNumber').style.display = '';
        document.getElementById('st1trBirthDate').style.display = 'none';
        document.getElementById('st1trGender').style.display = 'none';
        document.getElementById('st1trCountry').style.display = 'none';
        var xli = document.getElementById('step1headerlisttext');
        if (xli) {
            xli.innerHTML = 'შესაბამის ველებში მიუთითეთ მოქალაქეობა, ბავშვის პირადი ნომერი, სახელი და გვარი;';
        }
        localInfo = true;
    };
    this.foreigner = function () {
        var errorDiv = document.getElementById('errorDivMsgStep1');
        var errorUl = document.getElementById('errorUlMsgStep1');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
        document.getElementById('st1trPersonalNumber').style.display = 'none';
        document.getElementById('st1trBirthDate').style.display = '';
        document.getElementById('st1trGender').style.display = '';
        document.getElementById('st1trCountry').style.display = '';
        var xli = document.getElementById('step1headerlisttext');
        if (xli) {
            xli.innerHTML = 'შესაბამის ველებში მიუთითეთ მოქალაქეობა, ბავშვის სახელი, გვარი, დაბადების თარიღი, სქესი, ქვეყანა;';
        }
        localInfo = false;
    };

    function loadDataError() {
        var span = document.createElement('span');
        span.className = 'criticalError';
        var text = document.createTextNode('გთხოვთ ');
        span.appendChild(text);
        var a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.color = 'blue';
        var text = document.createTextNode('განაახლოთ გვერდი');
        a.appendChild(text);
        a.onclick = function () {
            window.location.reload();
        };
        span.appendChild(a);

        var errorDiv = document.getElementById('errorDivMsgStep1');
        var errorUl = document.getElementById('errorUlMsgStep1');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
        var ul = document.createElement('ul');
        ul.id = 'errorUlMsgStep1';
        ul.className = 'stepsErrorMsg';
        var li = document.createElement('li');
        li.appendChild(span);
        ul.appendChild(li);
        errorDiv.appendChild(ul);

        onStepGoing = true;
    }

    function getCitizenships() {
        ajax.get('/api/citizenships', function(status, data, t) {
            var select = document.getElementById('st1Country');
            select.options.length = 0;
            var text = document.createTextNode('----აირჩიეთ----');
            var option = document.createElement('option');
            option.value = -1;
            option.selected = true;
            option.appendChild(text);
            select.appendChild(option);
            if (status == 200 && data) {
                for (var i=0; i<data.length; i++) {
                    var text = document.createTextNode(data[i].citizenshipName);
                    var option = document.createElement('option');
                    option.value = data[i].citizenshipId;
                    option.appendChild(text);
                    select.appendChild(option);
                }
                citizenshipsLoaded = true;
            } else {
                if (data.code == "NotAuthorized") {
                    needAuth();
                } else {
                    loadDataError();
                }
            }
        });
    }

    function getRegions() {
        ajax.get('/api/limits', function(status, data, t) {
            var select = document.getElementById('st3ListRegion');
            select.options.length = 0;
            var text = document.createTextNode('----აირჩიეთ----');
            var option = document.createElement('option');
            option.value = -1;
            option.selected = true;
            option.appendChild(text);
            select.appendChild(option);
            if (status == 200 && data) {
                for (var i=0; i<data.length; i++) {
                    if (registratorScools && registratorScools.regions.indexOf(data[i].regionId) == -1) {
                        continue;
                    }
                    var text = document.createTextNode(data[i].regionName);
                    var option = document.createElement('option');
                    option.value = data[i].regionId;
                    option.appendChild(text);
                    select.appendChild(option);
                }
                regionsLoaded = true;
            } else {
                if (data.code == "NotAuthorized") {
                    registerAuthCall(getRegions);
                    needAuth();
                } else {
                    loadDataError();
                }
            }
        });
    }

    this.getListData = function() {
        if (!citizenshipsLoaded) {
            getCitizenships();
        }
        if (!regionsLoaded) {
            getRegions();
        }
    };

    function schoolErrorMsg(el, callback){
        var span = document.getElementById('st3LabelRemaining');
        span.innerHTML = '';
    }
    function clearSchoolMessages(dontClear) {
        if (initData.hasOwnProperty('limits') && initData.limits === false) {
            hasLimit = true;
        } else {
            hasLimit = false;
        }
        var errorUl = document.getElementById('errorUlMsgStep3');
        if (errorUl) {
            errorUl.parentNode.removeChild(errorUl);
        }
        var limitDiv = document.getElementById('st3LabelRemaining');
        if (limitDiv) {
            limitDiv.innerHTML = '';
        }

        if (dontClear != 3) {
            var messageDiv = document.getElementById('schoolWithMessageDiv');
            messageDiv.style.display = 'none';
            var messageLi = document.getElementById('schoolWithMessageText');
            messageLi.innerHTML = '';
        }

    }

    function resetRaion() {
        var select = document.getElementById('st3ListDistrict');
        select.options.length = 0;
        var text = document.createTextNode('----აირჩიეთ----');
        var option = document.createElement('option');
        option.value = -1;
        option.selected = true;
        option.appendChild(text);
        select.appendChild(option);
    };

    function resetSchool() {
        var select = document.getElementById('st3ListSchool');
        select.options.length = 0;
        var text = document.createTextNode('----აირჩიეთ----');
        var option = document.createElement('option');
        option.value = -1;
        option.selected = true;
        option.appendChild(text);
        select.appendChild(option);
    };

    function resetSection() {
        var select = document.getElementById('st3ListSector');
        select.options.length = 0;
        var text = document.createTextNode('----აირჩიეთ----');
        var option = document.createElement('option');
        option.value = -1;
        option.selected = true;
        option.appendChild(text);
        select.appendChild(option);
    };

    function resetShift() {
        var select = document.getElementById('st3ListShift');
        select.options.length = 0;
        var text = document.createTextNode('----აირჩიეთ----');
        var option = document.createElement('option');
        option.value = -1;
        option.selected = true;
        option.appendChild(text);
        select.appendChild(option);
    };

    this.regionSelected = function (el) {
        clearSchoolMessages();
        var id = el.value;
        resetRaion();
        resetSchool();
        resetSection();
        resetShift();
        if (id != -1) {
            document.getElementById('loadingFree').style.display = 'block';
            ajax.get('/api/limits/'+id, function(status, data, t) {
                document.getElementById('loadingFree').style.display = 'none';
                var select = document.getElementById('st3ListDistrict');
                if (status == 200 && data) {
                    for (var i=0; i<data.length; i++) {
                        if (registratorScools && registratorScools.districts.indexOf(data[i].districtId) == -1) {
                            continue;
                        }
                        var text = document.createTextNode(data[i].districtName);
                        var option = document.createElement('option');
                        option.value = data[i].districtId;
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    registerAuthCall(function(){
                        that.regionSelected(el);
                    });
                    needAuth();
                } else {
                    schoolErrorMsg(el, that.regionSelected);
                }
            });
        }
    };

    this.raionSelected = function(el) {
        clearSchoolMessages();
        var id = el.value;
        resetSchool();
        resetSection();
        resetShift();
        if (id != -1) {
            var regId = document.getElementById('st3ListRegion').value;
            document.getElementById('loadingFree').style.display = 'block';
            ajax.get('/api/limits/'+regId+'/'+id, function(status, data, t) {
                document.getElementById('loadingFree').style.display = 'none';
                var select = document.getElementById('st3ListSchool');
                if (status == 200 && data) {
                    schoolsList = data;
                    for (var i=0; i<data.length; i++) {
                        if (registratorScools && registratorScools.school.indexOf(data[i].schoolId) == -1) {
                            continue;
                        }
                        var text = document.createTextNode(data[i].schoolName);
                        var option = document.createElement('option');
                        option.value = data[i].schoolId;
                        option.title = data[i].schoolName;
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    registerAuthCall(function(){
                        that.raionSelected(el);
                    });
                    needAuth();
                } else {
                    schoolErrorMsg(el, that.raionSelected);
                }
            });
        }
    };

    this.schoolSelected = function(el) {
        clearSchoolMessages();
        var id = el.value;
        resetSection();
        resetShift();
        if (id != -1) {
            var messageDiv = document.getElementById('schoolWithMessageDiv');
            var messageLi = document.getElementById('schoolWithMessageText');
            if (schoolWithMessage_1.indexOf(id) != -1) {
                messageDiv.style.display = 'block';
                messageLi.innerHTML = schoolWithMessage_1_text;
            }
            var regId = document.getElementById('st3ListRegion').value;
            var raId = document.getElementById('st3ListDistrict').value;
            document.getElementById('loadingFree').style.display = 'block';
            ajax.get('/api/limits/'+regId+'/'+raId+'/'+id, function(status, data, t) {
                document.getElementById('loadingFree').style.display = 'none';
                if (status == 200 && data) {
                    var select = document.getElementById('st3ListSector');
                    for (var i=0; i<data.length; i++) {
                        var text = document.createTextNode(data[i].sectorName);
                        var option = document.createElement('option');
                        option.value = data[i].sectorId;
                        option.title = data[i].sectorName;
                        if (data.length == 1) {
                            option.selected = true;
                            setTimeout(function(){
                                that.sectorSelected(select);
                            },0);
                        }
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    registerAuthCall(function(){
                        that.schoolSelected(el);
                    });
                    needAuth();
                } else {
                    schoolErrorMsg(el, that.schoolSelected);
                }
            });
        }
    };

    this.sectorSelected = function(el) {
        clearSchoolMessages(3); //3 don't clear message ID
        resetShift();
        var id = el.value;
        if (id != -1) {
            var regId = document.getElementById('st3ListRegion').value;
            var raId = document.getElementById('st3ListDistrict').value;
            var schId = document.getElementById('st3ListSchool').value;
            var shiftIsVisible = document.getElementById('st3ShiftRow').style.display !== 'none';

            document.getElementById('loadingFree').style.display = 'block';
            ajax.get('/api/limits/'+regId+'/'+raId+'/'+schId+'/'+id, function(status, data, t) {
                document.getElementById('loadingFree').style.display = 'none';
                var select = document.getElementById('st3ListShift');
                if (status == 200 && data) {
                    var select = document.getElementById('st3ListShift');
                    for (var i = 0; i<data.length; i++) {
                        var text = document.createTextNode(data[i].shiftNumber);
                        var option = document.createElement('option');
                        option.value = data[i].shiftNumber;
                        option.title = data[i].shiftNumber;
                        if (data.length == 1) {
                            option.selected = true;
                            setTimeout(function(){
                                that.shiftSelected(select);
                            },0);
                        } else if (data.length == 0) {
                          setTimeout(function(){
                              that.shiftSelected(select);
                          },0);
                        }
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    registerAuthCall(function(){
                        that.sectorSelected(el);
                    });
                    needAuth();
                } else {
                    schoolErrorMsg(el, that.sectorSelected);
                }
            });
        }
    };

    this.shiftSelected = function(el) {
        clearSchoolMessages(3); //3 don't clear message ID
        var id = el.value;
        if (regStage != 3 && id != -1 || regStage == 3) {
            var regId = document.getElementById('st3ListRegion').value;
            var raId = document.getElementById('st3ListDistrict').value;
            var schId = document.getElementById('st3ListSchool').value;
            var secId = document.getElementById('st3ListSector').value;

            document.getElementById('loadingFree').style.display = 'block';
            ajax.get('/api/limits/'+regId+'/'+raId+'/'+schId+'/'+secId+'/'+id, function(status, data, t) {
              document.getElementById('loadingFree').style.display = 'none';
              if (status == 200 && data) {
                if (data && data.code && data.code == "LimitNotFoundError") {
                    var span = document.getElementById('st3LabelRemaining');
                    span.innerHTML = 'თავისუფალი ადგილების რაოდენობა: 0';
                    span.style.color = 'black';
                } else if (data && data.code && data.code == "ServiceUnavailableError") {
                    schoolErrorMsg(el, that.shiftSelected);
                } else if (data && data.code && data.code == "NotAuthorized") {
                    registerAuthCall(function(){
                        that.shiftSelected(el);
                    });
                    needAuth();
                } else if (regStage != 0 && data.hasOwnProperty('free')) {
                    if (data.free > 0) {
                        hasLimit = true;
                    }
                    var span = document.getElementById('st3LabelRemaining');
                    span.innerHTML = 'თავისუფალი ადგილების რაოდენობა: '+ data.free;
                    span.style.color = 'black';
                } else if (regStage == 0 && data.hasOwnProperty('senFree')) {
                  if (data.senFree > 0) {
                      hasLimit = true;
                  }
                  var span = document.getElementById('st3LabelRemaining');
                  span.innerHTML = 'თავისუფალი ადგილების რაოდენობა: '+ data.senFree;
                  span.style.color = 'black';
                } else {
                    schoolErrorMsg(el, that.shiftSelected);
                }
              }
            });
        }
    };

    function loadTeacherSchools(data){
        var employeeName = common.getCookie('employeeName');
        if (employeeName) {
            var userName = document.getElementById('userName');
            userName.innerHTML = employeeName;
        }

        if (!data) return;
        registratorScools = {
            regions: [],
            districts: [],
            school: []
        };

        for (var i=0; i<data.length; i++) {
            registratorScools.regions.push(data[i].regionId);
            registratorScools.districts.push(data[i].districtId);
            registratorScools.school.push(data[i].schoolId);
            // registratorScools.sectors.push(data[i].sectorId);
        }

        clearSchoolMessages();
        resetRaion();
        resetSchool();
        resetSection();
        resetShift();

        var st3ListRegion = document.getElementById('st3ListRegion');
        common.addEvent(st3ListRegion, 'change', function(){
            tRegionSelected(st3ListRegion);
        });
        var st3ListDistrict = document.getElementById('st3ListDistrict');
        common.addEvent(st3ListDistrict, 'change', function(){
            tRaionSelected(st3ListDistrict);
        });
        var st3ListSchool = document.getElementById('st3ListSchool');
        common.addEvent(st3ListSchool, 'change', function(){
            tSchoolSelected(st3ListSchool);
        });

        function tRegionSelected (el) {
            clearSchoolMessages();
            resetRaion();
            resetSchool();
            resetSection();
            resetShift();
            var regionId = el.value
            ajax.get('/api/limits/'+regionId, function(status, data, t) {
                var select = document.getElementById('st3ListDistrict');
                //select.options.length = 0;
                if (status == 200 && data) {
                    for (var i=0; i<data.length; i++) {
                        if (registratorScools && registratorScools.districts.indexOf(data[i].districtId) == -1) {
                            continue;
                        }
                        var text = document.createTextNode(data[i].districtName);
                        var option = document.createElement('option');
                        option.value = data[i].districtId;
                        //option.selected = true;
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    needAuth();
                } else {
                    var st3ListRegion = document.getElementById('st3ListRegion');
                    schoolErrorMsg(st3ListRegion, tRegionSelected);
                }
            });
        }

        function tRaionSelected(el) {
            clearSchoolMessages();
            resetSchool();
            resetSection();
            resetShift();
            var regionId = document.getElementById('st3ListRegion').value;
            var districtId = el.value;
            ajax.get('/api/limits/'+regionId+'/'+districtId, function(status, data, t) {
                var select = document.getElementById('st3ListSchool');
                //select.options.length = 0;
                if (status == 200 && data) {
                    schoolsList = data;
                    for (var i=0; i<data.length; i++) {
                        if (registratorScools && registratorScools.school.indexOf(data[i].schoolId) == -1) {
                            continue;
                        }
                        var text = document.createTextNode('ggg');
                        var option = document.createElement('option');
                        option.value = data[i].schoolId;
                        option.label = data[i].schoolName;
                        //option.selected = true;
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    needAuth();
                } else {
                    var st3ListDistrict = document.getElementById('st3ListDistrict');
                    schoolErrorMsg(st3ListDistrict, tRaionSelected);
                }
            });
        }

        function tSchoolSelected (el) {
            clearSchoolMessages();
            resetSection();
            resetShift();
            var regionId = document.getElementById('st3ListRegion').value;
            var districtId = document.getElementById('st3ListDistrict').value;
            var schoolId = el.value;
            ajax.get('/api/limits/'+regionId+'/'+districtId+'/'+schoolId, function(status, data, t) {
                var select = document.getElementById('st3ListSector');
                //select.options.length = 0;
                if (status == 200 && data) {
                    for (var i=0; i<data.length; i++) {
                        var text = document.createTextNode(data[i].sectorName);
                        var option = document.createElement('option');
                        option.value = data[i].sectorId;
                        if (data.length == 1) {
                            option.selected = true;
                            setTimeout(function(){
                                that.sectorSelected(select);
                            },0);
                        }
                        option.appendChild(text);
                        select.appendChild(option);
                    }
                } else if (data && data.code && data.code == "NotAuthorized") {
                    needAuth();
                } else {
                    var st3ListSchool = document.getElementById('st3ListSchool');
                    schoolErrorMsg(st3ListSchool, tSchoolSelected);
                }
            });
        }
    }

    var check = document.getElementById('st1Citizenship_0');
    common.addEvent(check, 'click', that.localUser);
    var check = document.getElementById('st1Citizenship_1');
    common.addEvent(check, 'click', that.foreigner);
    var btnFinish = document.getElementById('btnFinish');
    common.addEvent(btnFinish, 'click', that.finish);
    var btnNext = document.getElementById('btnNext');
    common.addEvent(btnNext, 'click', that.nextStep);
    var btnPrevious = document.getElementById('btnPrevious');
    common.addEvent(btnPrevious, 'click', that.previewStep);

    if (regStage == 2) {
        var st3ListRegion = document.getElementById('st3ListRegion');
        common.addEvent(st3ListRegion, 'change', function(){
            that.regionSelected(st3ListRegion);
        });
        var st3ListDistrict = document.getElementById('st3ListDistrict');
        common.addEvent(st3ListDistrict, 'change', function(){
            that.raionSelected(st3ListDistrict);
        });
        var st3ListSchool = document.getElementById('st3ListSchool');
        common.addEvent(st3ListSchool, 'change', function(){
            that.schoolSelected(st3ListSchool);
        });
    }
    if (initData.hasOwnProperty('limits') && initData.limits === false) {
        hasLimit = true;
    } else {
        var st3ListSector = document.getElementById('st3ListSector');
        common.addEvent(st3ListSector, 'change', function(){
            that.sectorSelected(st3ListSector);
        });
        var st3ListShift = document.getElementById('st3ListShift');
        common.addEvent(st3ListShift, 'change', function(){
            that.shiftSelected(st3ListShift);
        });
    }

    var relDiv = document.getElementById('divReg1RelFieldset')||false;
    var userDiv = document.getElementById('userContorlPanel')||false;
    var wizard = document.getElementById('wizard');
    var regCaptcha = document.getElementById('regCaptcha');
    var shiftRow = document.getElementById('st3ShiftRow');
    var messageInfoField = document.getElementById('messageInfoField');
    if (initData.hasOwnProperty('captcha') && !initData.captcha) {
        regCaptcha.parentNode.removeChild(regCaptcha);
    }

    if (regStage == 3) {
      shiftRow.style.display = 'none';
      messageInfoField.innerHTML = 'ჩამოსაშლელი ველების საშუალებით ამოირჩიეთ რეგიონი, რაიონი, სასურველი სკოლა და სექტორი';
    } else {
      shiftRow.style.display = '';
    }
    if (regStage == 1) {
        var xli = document.getElementById('step1headerlisttext');
        if (xli) {
            xli.innerHTML = 'შესაბამის ველებში მიუთითეთ მოქალაქეობა, ნათესაური კავშირი, ბავშვის პირადი ნომერი, სახელი და გვარი;';
        }
    }
    if (regStage == 0 || regStage == 1 || regStage == 3 || regStage == 4) {
        if (regStage == 1) {
           

            var check = document.getElementById('st1Reationship_0');
            common.addEvent(check, 'click', function(){
                relation = 0;
            });

            var check = document.getElementById('st1Reationship_1');
            common.addEvent(check, 'click', function(){
                relation = 1;
            });
            var check = document.getElementById('st1Reationship_2');
            common.addEvent(check, 'click', function(){
                relation = 2;
            });
            var check = document.getElementById('st1Reationship_3');
            common.addEvent(check, 'click', function(){
                relation = 3;
            });
        } 

        var loginButton = document.getElementById('login_submit');
        common.addEvent(loginButton, 'click', function() {
            if (onAuthGoing) return;
            auth();
        });

        var logoutButton = document.getElementById('logout_button');
        common.addEvent(logoutButton, 'click', function() {
            common.setCookie('session', '', new Date());
            common.setCookie('registrator', '[]', new Date());
            common.setCookie('employeeName', '', new Date());
            window.location.href = '/';
        });

        if (!common.getCookie('session') || !common.getCookie('registrator')){
            var loginDiv = document.getElementById('loginDiv');
            
        } else {
            wizard.style.display = 'block';
            loadTeacherSchools(JSON.parse(common.getCookie('registrator')));
            this.getListData();
        }
    } else {
        wizard.style.display = 'block';
        relDiv.parentNode.removeChild(relDiv);
        if(userDiv)userDiv.parentNode.removeChild(userDiv);
        this.getListData();
    }

    function registerAuthCall(callback){
        authCalls.push(callback);
    }

    function needAuth() {
        window.location.reload();
        common.setCookie('session', '0', new Date(new Date().getTime() - (60 * 60 * 24 * 1000)));
        common.setCookie('registrator', '[]', new Date(new Date().getTime() - (60 * 60 * 24 * 1000)));
        var loginDiv = document.getElementById('loginDiv');
        
        var wizard = document.getElementById('wizard');
        wizard.style.display = 'none';
    }

    function auth(){
        var user = document.getElementById('user').value;
        var pass = document.getElementById('pass').value;

        var data = {
            username: user,
            password: pass
        };

        onAuthGoing = true;

        var errDiv = document.getElementById('logginErrorInfo');
        errDiv.innerHTML = '';

        if (user && pass) {
            document.getElementById('loadingAuthorization').style.display = 'block';
            ajax.json('/api/auth', data, function(status, dataJson, text) {
                document.getElementById('loadingAuthorization').style.display = 'none';
                if (status == 200 && dataJson && dataJson.token && dataJson.schools) {
                    common.setCookie('session', dataJson.token);
                    common.setCookie('registrator', JSON.stringify(dataJson.schools));
                    var employeeName = '';
                    if (dataJson.employeeFullName) {
                        employeeName = dataJson.employeeFullName;
                    } else {
                        employeeName = user;
                    }
                    common.setCookie('employeeName', employeeName);

                    var loginDiv = document.getElementById('loginDiv');
                    loginDiv.style.display = 'none';
                    var wizard = document.getElementById('wizard');
                    wizard.style.display = 'block';

                    for (var i=0; i<authCalls.length; i++) {
                        authCalls[i]();
                    }
                    loadTeacherSchools(dataJson.schools);
                    that.getListData();
                } else if (dataJson) {
                    if (dataJson.code == "NotAuthorized") {
                        errDiv.innerHTML = 'მომხმარებლის სახელი ან პაროლი არასწორია';
                    } else if (dataJson.code == "EflowUserBlockedError") {
                        errDiv.innerHTML = 'ავტორიზაცია დაბლოკილია';
                    } else if (dataJson.code == "NoSchoolsFoundError") {
                        errDiv.innerHTML = 'თქვენ არ გაქვთ რეგისტრაციის უფლება';
                    } else if (dataJson.code == "NoRightFoundError") {
                        errDiv.innerHTML = 'თქვენ არ გაქვთ რეგისტრაციის უფლება';
                    } else {
                        errDiv.innerHTML = 'ავტორიზაცია შეუძლებელია';
                    }
                } else {
                    errDiv.innerHTML = 'ავტორიზაცია შეუძლებელია';
                }
                onAuthGoing = false;
                authCalls = [];
            });
        } else {
            onAuthGoing = false;
            authCalls = [];
            errDiv.innerHTML = 'მიუთითეთ მომხმარებლის სახელი და პაროლი';
        }
    };
}

function RegistrationRestore(initData) {
  var that = this;
  var onStepGoing;

  function getPersonalNumber(){return common.trim(document.getElementById('st1PersonalNumber').value);}
  function getPhoneNumber(){return common.trimPhoneNumber(document.getElementById('st2PhoneNumber').value);}
  function getCaptcha(){return common.trim(document.getElementById('recaptcha_response_field').value);}
  function getCaptchaChallenge(){return common.trim(document.getElementById('recaptcha_challenge_field').value);}

  function loading() {
      var form = document.getElementById('mainForm');
      var bb = document.getElementById('blockBody');
      bb.className = "bbEnabled";
      bb.style.height = form.offsetHeight + 'px';
      form.className = 'mainForm hideElement';
  }
  function loaded() {
      var form = document.getElementById('mainForm');
      form.className = 'mainForm showElement';
      var bb = document.getElementById('blockBody');
      bb.className = "bbDisabled";
      bb.style.height = '100%';
  }

  function activateStep1() {
      var btn = document.getElementById('btnNext');
      var st3 = document.getElementById('formContainerStep3');
      btn.className = "btn-action btn-disabled";
      btn.disabled = true;
      document.getElementById('st3InfoDiv').innerHTML = 'რეგისტრაციის კოდი წარმატებით გაიგზავნა';
      st3.style.display = '';
  }

  var stepNextFunctions = [
      function () {

          var errorDiv = document.getElementById('errorDivMsgStep1');
          var errorUl = document.getElementById('errorUlMsgStep1');
          if (errorUl) {
              errorUl.parentNode.removeChild(errorUl);
          }

          var personalNumber = getPersonalNumber();
          var phoneNumber = getPhoneNumber();

          if (personalNumber && phoneNumber && common.isNumber(phoneNumber) && phoneNumber.length == 9 && phoneNumber[0] == 5) {
              loading();
              onStepGoing = true;

              var ul = document.createElement('ul');
              ul.id = 'errorUlMsgStep1';
              ul.className = 'stepsErrorMsg';
              var li = document.createElement('li');
              ul.appendChild(li);
              errorDiv.appendChild(ul);

              var data = {
                  personalNumber: personalNumber,
                  parentPhone: phoneNumber
              };

              ajax.json('/api/reminder/code', data, function(status, dataJson, text) {
                  if (status == 200) {
                    activateStep1();
                  } else if (dataJson) {
                      var captchaError = false;
                      text = document.createTextNode('');
                      switch (dataJson.code) {
                          case "InvalidArgumentError":
                              text = document.createTextNode(errorsMap.InvalidPersonalNoError);
                              break;
                          case "InvalidPhoneNumberError":
                              text = document.createTextNode(errorsMap.localPhoneNumberError);
                              break;
                          case "MissingParameterError":
                              text = document.createTextNode(errorsMap.localEmptyFieldError);
                              break;
                          case "NoSuchRegistrationError":
                              text = document.createTextNode('მითითებული ინფორმაციით რეგისტრაციის კოდი ვერ მოიძებნა, გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე');
                              break;
                          case "InvalidCaptchaError":
                              captchaError = true;
                              text = document.createTextNode('გთხოვთ გაიაროთ ვერიფიკაცია');
                              if (grecaptcha) {
                                  grecaptcha.reset()
                              }
                              break;
                          default:
                              try {
                                  text = document.createTextNode(dataJson.code.toString());
                              }catch(e){}
                              break;
                      }
                      onStepGoing = false;
                      if (initData.hasOwnProperty('captcha') && initData.captcha && grecaptcha) {
                          grecaptcha.reset()
                      }
                      if (!captchaError) {
                          li.appendChild(text);
                      } else {
                          var errorDiv2 = document.getElementById('errorDivMsgStep2');
                          var errorUl2 = document.getElementById('errorUlMsgStep2');
                          if (errorUl2) {
                              errorUl2.parentNode.removeChild(errorUl2);
                          }
                          var ul2 = document.createElement('ul');
                          ul2.id = 'errorUlMsgStep2';
                          ul2.className = 'stepsErrorMsg';
                          var li2 = document.createElement('li');
                          ul2.appendChild(li2);
                          errorDiv2.appendChild(ul2);
                          li2.appendChild(text);
                      }
                  }
                  loaded();
                  onStepGoing = false;
              });
          } else {
              var lis = [];
              if (!personalNumber) {
                  var li = document.createElement('li');
                  var text = document.createTextNode('პირადი ნომრის მითითება სავალდებულოა');
                  li.appendChild(text);
                  lis.push(li);
              }
              if (!phoneNumber || phoneNumber && !common.isNumber(phoneNumber) || phoneNumber && phoneNumber.length != 9) {
                  var li = document.createElement('li');
                  var text = document.createTextNode(errorsMap.localPhoneNumberError);
                  li.appendChild(text);
                  lis.push(li);
              } else if (phoneNumber && phoneNumber[0] != 5) {
                var li = document.createElement('li');
                var text = document.createTextNode(errorsMap.localPhoneIndexError);
                li.appendChild(text);
                lis.push(li);
              }
              var ul = document.createElement('ul');
              ul.id = 'errorUlMsgStep1';
              ul.className = 'stepsErrorMsg';
              for (var l = 0; l < lis.length; l++) {
                  ul.appendChild(lis[l]);
              }
              errorDiv.appendChild(ul);
          }
      }
  ];

  this.nextStep = function () {
      if (onStepGoing) return;
      stepNextFunctions[0]();
  };
  this.finish = function () {
      if (onStepGoing) return;
      window.location.href = '/';
  };

  var btnFinish = document.getElementById('btnFinish');
  common.addEvent(btnFinish, 'click', that.finish);
  var btnNext = document.getElementById('btnNext');
  common.addEvent(btnNext, 'click', that.nextStep);

}

function UnRegistration (initData) {
    var onStepGoing;
    var step = 0;
    var that = this;

    var unRegCaptcha = document.getElementById('unRegCaptcha');
    if (initData.hasOwnProperty('captcha') && !initData.captcha) {
        unRegCaptcha.parentNode.removeChild(unRegCaptcha);
    }

    function getPersonalNumber(){return common.trim(document.getElementById('st1PersonalNumber').value);}
    function getRegistrationCode(){return common.trim(document.getElementById('st1RegCode').value);}
    function getCaptcha(){return common.trim(document.getElementById('recaptcha_response_field').value);}
    function getCaptchaChallenge(){return common.trim(document.getElementById('recaptcha_challenge_field').value);}

    function loading() {
        var form = document.getElementById('mainForm');
        var bb = document.getElementById('blockBody');
        bb.className = "bbEnabled";
        bb.style.height = form.offsetHeight + 'px';
        form.className = 'mainForm hideElement';
    }
    function loaded() {
        var form = document.getElementById('mainForm');
        form.className = 'mainForm showElement';
        var bb = document.getElementById('blockBody');
        bb.className = "bbDisabled";
        bb.style.height = '100%';
    }

    function activateStep1() {
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;

        var btn = document.getElementById('btnNext');
        btn.innerHTML = 'შემდეგი';

        var a = document.getElementById('aStep1');
        a.className = 'selected';
        var a = document.getElementById('aStep2');
        a.className = 'disabled';

        var st1 = document.getElementById('formContainerStep1');
        var st2 = document.getElementById('formContainerStep2');
        st1.style.display = '';
        st2.style.display = 'none';

        document.getElementById('st2PersonalNumber').innerHTML = '';
        document.getElementById('st2RegistrationCode').innerHTML = '';

    }
    function activateStep2() {
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action";
        btn.disabled = false;

        var btn = document.getElementById('btnNext');
        btn.innerHTML = 'დასრულება';
        btn.disabled = false;

        var a = document.getElementById('aStep1');
        a.className = 'done';
        var a = document.getElementById('aStep2');
        a.className = 'selected';

        var st1 = document.getElementById('formContainerStep1');
        var st2 = document.getElementById('formContainerStep2');
        st1.style.display = 'none';
        st2.style.display = '';
    }
    function activateStep3() {
        var btn = document.getElementById('btnPrevious');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;

        var btn = document.getElementById('btnNext');
        btn.className = "btn-action btn-disabled";
        btn.disabled = true;

        var a = document.getElementById('aStep2');
        a.className = 'done';
        var a = document.getElementById('aStep3');
        a.className = 'selected';

        var st2 = document.getElementById('formContainerStep2');
        var st3 = document.getElementById('formContainerStep3');
        st2.style.display = 'none';
        st3.style.display = '';

        document.getElementById('st3InfoDiv').innerHTML = 'რეგისტრაცია გაუქმებულია';
    }

    var stepNextFunctions = [
        function () {
            //index 0 STEP 2
            var errorDiv = document.getElementById('errorDivMsgStep1');
            var errorUl = document.getElementById('errorUlMsgStep1');
            if (errorUl) {
                errorUl.parentNode.removeChild(errorUl);
            }

            var personalNumber = getPersonalNumber();
            var registrationCode = getRegistrationCode();

            if (personalNumber && registrationCode) {
                document.getElementById('st2PersonalNumber').innerHTML = personalNumber;
                document.getElementById('st2RegistrationCode').innerHTML = registrationCode;

                activateStep2();
                step++;
            } else {
                var lis = [];
                if (!personalNumber) {
                    var li = document.createElement('li');
                    var text = document.createTextNode('პირადი ნომრის მითითება სავალდებულოა');
                    li.appendChild(text);
                    lis.push(li);
                }
                if (!registrationCode) {
                    var li = document.createElement('li');
                    var text = document.createTextNode('რეგისტრაციის კოდის მითითება სავალდებულოა');
                    li.appendChild(text);
                    lis.push(li);
                }

                var ul = document.createElement('ul');
                ul.id = 'errorUlMsgStep1';
                ul.className = 'stepsErrorMsg';
                for (var l = 0; l < lis.length; l++) {
                    ul.appendChild(lis[l]);
                }
                errorDiv.appendChild(ul);
            }
        },
        function () {
            //index 1 STEP 3
            var errorDiv = document.getElementById('errorDivMsgStep1');
            var errorUl = document.getElementById('errorUlMsgStep1');
            if (errorUl) {
                errorUl.parentNode.removeChild(errorUl);
            }

            var personalNumber = getPersonalNumber();
            var registrationCode = getRegistrationCode();

            if (personalNumber && registrationCode) {
                loading();
                onStepGoing = true;

                var ul = document.createElement('ul');
                ul.id = 'errorUlMsgStep1';
                ul.className = 'stepsErrorMsg';
                var li = document.createElement('li');
                ul.appendChild(li);
                errorDiv.appendChild(ul);

                var data = {
                    personalNumber: personalNumber,
                    registrationCode: registrationCode
                };

                if (initData.hasOwnProperty('captcha') && initData.captcha && grecaptcha && grecaptcha.getResponse()) {
                    data['g-recaptcha-response'] = grecaptcha.getResponse()
                }

                ajax.json('/api/unregister', data, function(status, dataJson, text) {
                    if (status == 200) {
                        activateStep3();
                        step++;
                    } else if (dataJson) {
                        var captchaError = false;
                        text = document.createTextNode('');
                        switch (dataJson.code) {
                            case "NoSuchRegistrationError":
                                text = document.createTextNode('მითითებული პირადი ნომრითა და რეგისტრაციის კოდით ჩანაწერი ვერ მოიძებნა, გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე');
                                break;
                            case "InvalidArgument":
                                text = document.createTextNode('მითითებული პირადი ნომრითა და რეგისტრაციის კოდით ჩანაწერი ვერ მოიძებნა, გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე');
                                break;
                            case "InvalidArgumentError":
                                text = document.createTextNode('მითითებული პირადი ნომრითა და რეგისტრაციის კოდით ჩანაწერი ვერ მოიძებნა, გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე');
                                break;
                            case "UnableToUnregister":
                                text = document.createTextNode('მითითებული პირადი ნომრითა და რეგისტრაციის კოდით ჩანაწერი ვერ მოიძებნა, გთხოვთ გადაამოწმოთ თქვენს მიერ შეტანილი ინფორმაციის სისწორე');
                                break;
                            case "UnregisterNotAllowed":
                                text = document.createTextNode(errorsMap.UnregisterNotAllowed);
                                break;
                            case "InvalidCaptchaError":
                                captchaError = true;
                                text = document.createTextNode('გთხოვთ გაიაროთ ვერიფიკაცია');
                                if (grecaptcha) {
                                    grecaptcha.reset()
                                }
                                break;
                            default:
                                try {
                                    text = document.createTextNode(dataJson.code.toString());
                                }catch(e){}
                                break;
                        }
                        onStepGoing = false;
                        if (initData.hasOwnProperty('captcha') && initData.captcha && grecaptcha) {
                            grecaptcha.reset()
                        }
                        if (!captchaError) {
                            li.appendChild(text);
                            that.previewStep();
                        } else {
                            var errorDiv2 = document.getElementById('errorDivMsgStep2');
                            var errorUl2 = document.getElementById('errorUlMsgStep2');
                            if (errorUl2) {
                                errorUl2.parentNode.removeChild(errorUl2);
                            }
                            var ul2 = document.createElement('ul');
                            ul2.id = 'errorUlMsgStep2';
                            ul2.className = 'stepsErrorMsg';
                            var li2 = document.createElement('li');
                            ul2.appendChild(li2);
                            errorDiv2.appendChild(ul2);
                            li2.appendChild(text);
                        }
                    } else {
                        var text = document.createTextNode('');
                        li.appendChild(text);
                        onStepGoing = false;
                        that.previewStep();
                    }

                    loaded();
                    onStepGoing = false;
                });
            } else {
                var lis = [];
                if (!personalNumber) {
                    var li = document.createElement('li');
                    var text = document.createTextNode('პირადი ნომრის მითითება სავალდებულოა');
                    li.appendChild(text);
                    lis.push(li);
                }
                if (!registrationCode) {
                    var li = document.createElement('li');
                    var text = document.createTextNode('რეგისტრაციის კოდის მითითება სავალდებულოა');
                    li.appendChild(text);
                    lis.push(li);
                }

                var ul = document.createElement('ul');
                ul.id = 'errorUlMsgStep1';
                ul.className = 'stepsErrorMsg';
                for (var l = 0; l < lis.length; l++) {
                    ul.appendChild(lis[l]);
                }
                errorDiv.appendChild(ul);
            }
        }
    ];

    var stepBackFunctions = [
        function () {
            if (onStepGoing) return;
            onStepGoing = true;
            activateStep1();
            onStepGoing = false;
        }
    ];

    this.nextStep = function () {
        if (onStepGoing) return;
        stepNextFunctions[step]();
    };
    this.previewStep = function () {
        if (onStepGoing) return;
        step--;
        stepBackFunctions[step]();
    };
    this.finish = function () {
        if (onStepGoing) return;
        window.location.href = '/';
    };

    var btnFinish = document.getElementById('btnFinish');
    common.addEvent(btnFinish, 'click', that.finish);
    var btnNext = document.getElementById('btnNext');
    common.addEvent(btnNext, 'click', that.nextStep);
    var btnPrevious = document.getElementById('btnPrevious');
    common.addEvent(btnPrevious, 'click', that.previewStep);
}
