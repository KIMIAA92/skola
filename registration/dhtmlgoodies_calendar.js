/* exported displayCalendar, resizeIframe */

/************************************************************************************************************
JS Calendar
Copyright (C)

Alf Magne Kalleland, 2006
Owner of DHTMLgoodies.com

************************************************************************************************************/

var turnOffYearSpan = true; // true = Only show This Year and Next, false = show - 6 years
var weekStartsOnSunday = false; // true = Start the week on Sunday, false = start the week on Monday
var languageCode = "ka"; // Possible values: 	en,ge,no,nl,es,pt-br,fr
// en = English, ka = Georgian(Use UTF-8 doctype for Georgian)
var pathToImages = "images/"; // Relative to your HTML file
var speedOfSelectBoxSliding = 200; // Milliseconds between changing year and hour when holding mouse over "-" and "+" - lower value = faster
var calendar_offsetTop = 0; // Offset - calendar placement - You probably have to modify this value if you're not using a strict doctype
var calendar_offsetLeft = 0; // Offset - calendar placement - You probably have to modify this value if you're not using a strict doctype
var calendarDiv = false;

var MSIE = false;
var Opera = false;
if (
  navigator.userAgent.indexOf("MSIE") >= 0 &&
  navigator.userAgent.indexOf("Opera") < 0
)
  MSIE = true;
if (navigator.userAgent.indexOf("Opera") >= 0) Opera = true;
var monthArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var dayArray = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
switch (languageCode) {
  case "en" /* English */:
    break;
  case "ka" /* Georgian */:
    monthArray = [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი"
    ];
    dayArray = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"];
    break;
}
if (weekStartsOnSunday) {
  var tempDayName = dayArray[6];
  for (var theIx = 6; theIx > 0; theIx--) {
    dayArray[theIx] = dayArray[theIx - 1];
  }
  dayArray[0] = tempDayName;
}
var daysInMonthArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var currentMonth;
var currentYear;
var calendarContentDiv;
var returnDateTo;
var returnFormat;
var activeSelectBoxMonth = false;
var activeSelectBoxYear;
var iframeObj = false;
//// fix for EI frame problem on time dropdowns 09/30/2006
var iframeObj2 = false;
function EIS_FIX_EI1(where2fixit) {
  if (!iframeObj2) return;
  iframeObj2.style.display = "block";
  iframeObj2.style.height =
    document.getElementById(where2fixit).offsetHeight + 1;
  iframeObj2.style.width = document.getElementById(where2fixit).offsetWidth;
  iframeObj2.style.left =
    getleftPos(document.getElementById(where2fixit)) + 1 - calendar_offsetLeft;
  iframeObj2.style.top =
    getTopPos(document.getElementById(where2fixit)) -
    document.getElementById(where2fixit).offsetHeight -
    calendar_offsetTop;
}
function EIS_Hide_Frame() {
  if (iframeObj2) iframeObj2.style.display = "none";
}
//// fix for EI frame problem on time dropdowns 09/30/2006
var returnDateToYear;
var returnDateToMonth;
var returnDateToDay;
var inputYear;
var inputMonth;
var inputDay;
var selectBoxHighlightColor = "#D60808"; // Highlight color of select boxes
var selectBoxMovementInProgress = false;
var activeSelectBox = false;
function cancelCalendarEvent() {
  return false;
}
function isLeapYear(inputYear) {
  if (inputYear % 400 == 0 || (inputYear % 4 == 0 && inputYear % 100 != 0))
    return true;
  return false;
}
function highlightMonthYear() {
  if (activeSelectBoxMonth) activeSelectBoxMonth.className = "";
  activeSelectBox = this;

  if (this.className == "monthYearActive") {
    this.className = "";
  } else {
    this.className = "monthYearActive";
    activeSelectBoxMonth = this;
  }

  if (this.innerHTML.indexOf("-") >= 0 || this.innerHTML.indexOf("+") >= 0) {
    if (this.className == "monthYearActive") selectBoxMovementInProgress = true;
    else selectBoxMovementInProgress = false;
  } else selectBoxMovementInProgress = false;
}
function showMonthDropDown() {
  if (document.getElementById("monthDropDown").style.display == "block") {
    document.getElementById("monthDropDown").style.display = "none";
    //// fix for EI frame problem on time dropdowns 09/30/2006
    EIS_Hide_Frame();
  } else {
    document.getElementById("monthDropDown").style.display = "block";
    document.getElementById("yearDropDown").style.display = "none";
    if (MSIE) {
      EIS_FIX_EI1("monthDropDown");
    }
    //// fix for EI frame problem on time dropdowns 09/30/2006
  }
}
function showYearDropDown() {
  if (document.getElementById("yearDropDown").style.display == "block") {
    document.getElementById("yearDropDown").style.display = "none";
    //// fix for EI frame problem on time dropdowns 09/30/2006
    EIS_Hide_Frame();
  } else {
    document.getElementById("yearDropDown").style.display = "block";
    document.getElementById("monthDropDown").style.display = "none";
    if (MSIE) {
      EIS_FIX_EI1("yearDropDown");
    }
    //// fix for EI frame problem on time dropdowns 09/30/2006
  }
}
function selectMonth() {
  document.getElementById("calendar_month_txt").innerHTML = this.innerHTML;
  currentMonth = this.id.replace(/[^\d]/g, "");

  document.getElementById("monthDropDown").style.display = "none";
  //// fix for EI frame problem on time dropdowns 09/30/2006
  EIS_Hide_Frame();
  for (var no = 0; no < monthArray.length; no++) {
    document.getElementById("monthDiv_" + no).style.color = "";
  }
  this.style.color = selectBoxHighlightColor;
  activeSelectBoxMonth = this;
  writeCalendarContent();
}
function selectYear() {
  document.getElementById("calendar_year_txt").innerHTML = this.innerHTML;
  currentYear = this.innerHTML.replace(/[^\d]/g, "");
  document.getElementById("yearDropDown").style.display = "none";
  //// fix for EI frame problem on time dropdowns 09/30/2006
  EIS_Hide_Frame();
  if (activeSelectBoxYear) {
    activeSelectBoxYear.style.color = "";
  }
  activeSelectBoxYear = this;
  this.style.color = selectBoxHighlightColor;
  writeCalendarContent();
}
function switchMonth() {
  if (this.src.indexOf("left") >= 0) {
    currentMonth = currentMonth - 1;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear = currentYear - 1;
    }
  } else {
    currentMonth = currentMonth + 1;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear = currentYear / 1 + 1;
    }
  }
  writeCalendarContent();
}

function createMonthDiv() {
  var div = document.createElement("DIV");
  div.className = "monthYearPicker";
  div.id = "monthPicker";
  for (var no = 0; no < monthArray.length; no++) {
    var subDiv = document.createElement("DIV");
    subDiv.innerHTML = monthArray[no];
    subDiv.onmouseover = highlightMonthYear;
    subDiv.onmouseout = highlightMonthYear;
    subDiv.onclick = selectMonth;
    subDiv.id = "monthDiv_" + no;
    subDiv.style.width = "56px";
    subDiv.onselectstart = cancelCalendarEvent;
    div.appendChild(subDiv);
    if (currentMonth && currentMonth == no) {
      subDiv.style.color = selectBoxHighlightColor;
      activeSelectBoxMonth = subDiv;
    }
  }
  return div;
}
function changeSelectBoxYear(e, inputObj) {
  var startYear;
  if (!inputObj) inputObj = this;
  var yearItems = inputObj.parentNode.getElementsByTagName("DIV");
  if (inputObj.innerHTML.indexOf("-") >= 0) {
    startYear = yearItems[1].innerHTML / 1 - 1;
    if (activeSelectBoxYear) {
      activeSelectBoxYear.style.color = "";
    }
  } else {
    startYear = yearItems[1].innerHTML / 1 + 1;
    if (activeSelectBoxYear) {
      activeSelectBoxYear.style.color = "";
    }
  }
  for (var no = 1; no < yearItems.length - 1; no++) {
    yearItems[no].innerHTML = startYear + no - 1;
    yearItems[no].id = "yearDiv" + (startYear / 1 + no / 1 - 1);
  }
  if (activeSelectBoxYear) {
    activeSelectBoxYear.style.color = "";
    if (document.getElementById("yearDiv" + currentYear)) {
      activeSelectBoxYear = document.getElementById("yearDiv" + currentYear);
      activeSelectBoxYear.style.color = selectBoxHighlightColor;
    }
  }
}
function updateYearDiv() {
  var yearSpan = 5;
  var modifier = 1;
  var endYear = currentYear;
  if (turnOffYearSpan) {
    var d = new Date();
    yearSpan = 6;
    modifier = 0;
    endYear = d.getFullYear() / 1 - 5;
  }
  var div = document.getElementById("yearDropDown");
  var yearItems = div.getElementsByTagName("DIV");
  for (var no = modifier; no < yearItems.length - modifier; no++) {
    yearItems[no].innerHTML = endYear / 1 - yearSpan + no;
    if (currentYear == endYear / 1 - yearSpan + no) {
      yearItems[no].style.color = selectBoxHighlightColor;
      activeSelectBoxYear = yearItems[no];
    } else {
      yearItems[no].style.color = "";
    }
  }
}
function updateMonthDiv() {
  for (var no = 0; no < 12; no++) {
    document.getElementById("monthDiv_" + no).style.color = "";
  }
  document.getElementById(
    "monthDiv_" + currentMonth
  ).style.color = selectBoxHighlightColor;
  activeSelectBoxMonth = document.getElementById("monthDiv_" + currentMonth);
}
function createYearDiv() {
  var div, no, subDiv;
  if (!document.getElementById("yearDropDown")) {
    div = document.createElement("DIV");
    div.className = "monthYearPicker";
  } else {
    div = document.getElementById("yearDropDown");
    var subDivs = div.getElementsByTagName("DIV");
    for (no = 0; no < subDivs.length; no++) {
      subDivs[no].parentNode.removeChild(subDivs[no]);
    }
  }
  var d = new Date();
  if (currentYear) {
    d.setFullYear(currentYear);
  }
  var startYear = d.getFullYear() / 1 - 5;
  var yearSpan = 10;
  if (!turnOffYearSpan) {
    subDiv = document.createElement("DIV");
    subDiv.innerHTML = "&nbsp;&nbsp;- ";
    subDiv.onclick = changeSelectBoxYear;
    subDiv.onmouseover = highlightMonthYear;
    subDiv.onmouseout = function() {
      selectBoxMovementInProgress = false;
    };
    subDiv.onselectstart = cancelCalendarEvent;
    div.appendChild(subDiv);
  } else {
    d = new Date();
    startYear = d.getFullYear() / 1 - 11;
    yearSpan = 6;
  }
  for (no = startYear; no < startYear + yearSpan; no++) {
    subDiv = document.createElement("DIV");
    subDiv.innerHTML = no;
    subDiv.onmouseover = highlightMonthYear;
    subDiv.onmouseout = highlightMonthYear;
    subDiv.onclick = selectYear;
    subDiv.id = "yearDiv" + no;
    subDiv.onselectstart = cancelCalendarEvent;
    div.appendChild(subDiv);
    if (currentYear && currentYear == no) {
      subDiv.style.color = selectBoxHighlightColor;
      activeSelectBoxYear = subDiv;
    }
  }
  if (!turnOffYearSpan) {
    subDiv = document.createElement("DIV");
    subDiv.innerHTML = "&nbsp;&nbsp;+ ";
    subDiv.onclick = changeSelectBoxYear;
    subDiv.onmouseover = highlightMonthYear;
    subDiv.onmouseout = function() {
      selectBoxMovementInProgress = false;
    };
    subDiv.onselectstart = cancelCalendarEvent;
    div.appendChild(subDiv);
  }
  return div;
}
/* This function creates the hour div at the bottom bar */
function slideCalendarSelectBox() {
  if (selectBoxMovementInProgress) {
    if (activeSelectBox.parentNode.id == "yearDropDown") {
      changeSelectBoxYear(false, activeSelectBox);
    }
  }
  setTimeout("slideCalendarSelectBox()", speedOfSelectBoxSliding);
}
function highlightSelect() {
  if (this.className == "selectBox") {
    this.className = "selectBoxOver";
    this.getElementsByTagName("IMG")[0].src = pathToImages + "down_over.gif";
  } else if (this.className == "selectBoxOver") {
    this.className = "selectBox";
    this.getElementsByTagName("IMG")[0].src = pathToImages + "down.gif";
  }
}
function highlightArrow() {
  if (this.src.indexOf("over") >= 0) {
    if (this.src.indexOf("left") >= 0) this.src = pathToImages + "left.gif";
    if (this.src.indexOf("right") >= 0) this.src = pathToImages + "right.gif";
  } else {
    if (this.src.indexOf("left") >= 0)
      this.src = pathToImages + "left_over.gif";
    if (this.src.indexOf("right") >= 0)
      this.src = pathToImages + "right_over.gif";
  }
}
function highlightClose() {
  if (this.src.indexOf("over") >= 0) {
    this.src = pathToImages + "close.gif";
  } else {
    this.src = pathToImages + "close_over.gif";
  }
}
function closeCalendar() {
  document.getElementById("yearDropDown").style.display = "none";
  document.getElementById("monthDropDown").style.display = "none";
  calendarDiv.style.display = "none";
  if (iframeObj) {
    iframeObj.style.display = "none";
    //// //// fix for EI frame problem on time dropdowns 09/30/2006
    EIS_Hide_Frame();
  }
  if (activeSelectBoxMonth) activeSelectBoxMonth.className = "";
  if (activeSelectBoxYear) activeSelectBoxYear.className = "";
}
function writeTopBar() {
  var img, span;
  var topBar = document.createElement("DIV");
  topBar.className = "topBar";
  topBar.id = "topBar";
  calendarDiv.appendChild(topBar);
  // Left arrow
  var leftDiv = document.createElement("DIV");
  leftDiv.style.marginRight = "1px";
  img = document.createElement("IMG");
  img.src = pathToImages + "left.gif";
  img.onmouseover = highlightArrow;
  img.onclick = switchMonth;
  img.onmouseout = highlightArrow;
  leftDiv.appendChild(img);
  topBar.appendChild(leftDiv);
  if (Opera) leftDiv.style.width = "16px";
  // Right arrow
  var rightDiv = document.createElement("DIV");
  rightDiv.style.marginRight = "1px";
  img = document.createElement("IMG");
  img.src = pathToImages + "right.gif";
  img.onclick = switchMonth;
  img.onmouseover = highlightArrow;
  img.onmouseout = highlightArrow;
  rightDiv.appendChild(img);
  if (Opera) rightDiv.style.width = "16px";
  topBar.appendChild(rightDiv);
  // Month selector
  var monthDiv = document.createElement("DIV");
  monthDiv.id = "monthSelect";
  monthDiv.onmouseover = highlightSelect;
  monthDiv.onmouseout = highlightSelect;
  monthDiv.onclick = showMonthDropDown;
  span = document.createElement("SPAN");
  span.innerHTML = monthArray[currentMonth];
  span.id = "calendar_month_txt";
  monthDiv.appendChild(span);
  img = document.createElement("IMG");
  img.src = pathToImages + "down.gif";
  img.style.position = "absolute";
  img.style.right = "0px";
  monthDiv.appendChild(img);
  monthDiv.className = "selectBox";
  if (Opera) {
    img.style.cssText = "float:right;position:relative";
    img.style.position = "relative";
    img.style.styleFloat = "right";
  }
  topBar.appendChild(monthDiv);
  var monthPicker = createMonthDiv();
  monthPicker.style.left = "37px";
  monthPicker.style.top = monthDiv.offsetTop + monthDiv.offsetHeight + 1 + "px";
  monthPicker.style.width = "60px";
  monthPicker.id = "monthDropDown";
  calendarDiv.appendChild(monthPicker);
  // Year selector
  var yearDiv = document.createElement("DIV");
  yearDiv.onmouseover = highlightSelect;
  yearDiv.onmouseout = highlightSelect;
  yearDiv.onclick = showYearDropDown;
  span = document.createElement("SPAN");
  span.innerHTML = currentYear;
  span.id = "calendar_year_txt";
  yearDiv.appendChild(span);
  topBar.appendChild(yearDiv);
  img = document.createElement("IMG");
  img.src = pathToImages + "down.gif";
  yearDiv.appendChild(img);
  yearDiv.className = "selectBox";
  if (Opera) {
    yearDiv.style.width = "50px";
    img.style.cssText = "float:right";
    img.style.position = "relative";
    img.style.styleFloat = "right";
  }
  var yearPicker = createYearDiv();
  yearPicker.style.left = "113px";
  yearPicker.style.top = monthDiv.offsetTop + monthDiv.offsetHeight + 1 + "px";
  yearPicker.style.width = "35px";
  yearPicker.id = "yearDropDown";
  calendarDiv.appendChild(yearPicker);
  img = document.createElement("IMG");
  img.src = pathToImages + "close.gif";
  img.style.styleFloat = "right";
  img.onmouseover = highlightClose;
  img.onmouseout = highlightClose;
  img.onclick = closeCalendar;
  topBar.appendChild(img);
  if (!document.all) {
    img.style.position = "absolute";
    img.style.right = "2px";
  }
}
function writeCalendarContent() {
  var cell, row, no;
  var calendarContentDivExists = true;
  if (!calendarContentDiv) {
    calendarContentDiv = document.createElement("DIV");
    calendarDiv.appendChild(calendarContentDiv);
    calendarContentDivExists = false;
  }
  currentMonth = currentMonth / 1;
  var d = new Date();
  d.setFullYear(currentYear);
  d.setDate(1);
  d.setMonth(currentMonth);
  var dayStartOfMonth = d.getDay();
  if (!weekStartsOnSunday) {
    if (dayStartOfMonth == 0) dayStartOfMonth = 7;
    dayStartOfMonth--;
  }
  document.getElementById("calendar_year_txt").innerHTML = currentYear;
  document.getElementById("calendar_month_txt").innerHTML =
    monthArray[currentMonth];
  var existingTable = calendarContentDiv.getElementsByTagName("TABLE");
  if (existingTable.length > 0) {
    calendarContentDiv.removeChild(existingTable[0]);
  }
  var calTable = document.createElement("TABLE");
  calTable.width = "100%";
  calTable.cellSpacing = "0";
  calendarContentDiv.appendChild(calTable);
  var calTBody = document.createElement("TBODY");
  calTable.appendChild(calTBody);
  row = calTBody.insertRow(-1);
  row.className = "calendar_week_row";
  for (no = 0; no < dayArray.length; no++) {
    cell = row.insertCell(-1);
    cell.innerHTML = dayArray[no];
  }
  row = calTBody.insertRow(-1);
  for (no = 0; no < dayStartOfMonth; no++) {
    cell = row.insertCell(-1);
    cell.innerHTML = "&nbsp;";
  }
  var colCounter = dayStartOfMonth;
  var daysInMonth = daysInMonthArray[currentMonth];
  if (daysInMonth == 28) {
    if (isLeapYear(currentYear)) daysInMonth = 29;
  }
  for (no = 1; no <= daysInMonth; no++) {
    d.setDate(no - 1);
    if (colCounter > 0 && colCounter % 7 == 0) {
      row = calTBody.insertRow(-1);
    }
    cell = row.insertCell(-1);
    if (
      currentYear == inputYear &&
      currentMonth == inputMonth &&
      no == inputDay
    ) {
      cell.className = "activeDay";
    }
    cell.innerHTML = no;
    cell.onclick = pickDate;
    colCounter++;
  }
  if (!document.all) {
    if (calendarContentDiv.offsetHeight)
      document.getElementById("topBar").style.top =
        calendarContentDiv.offsetHeight +
        document.getElementById("topBar").offsetHeight -
        1 +
        "px";
    else {
      document.getElementById("topBar").style.top = "";
      document.getElementById("topBar").style.bottom = "0px";
    }
  }
  if (iframeObj) {
    if (!calendarContentDivExists) setTimeout("resizeIframe()", 350);
    else setTimeout("resizeIframe()", 10);
  }
}
/* eslint-disable no-unused-vars */
function resizeIframe() {
  iframeObj.style.width = calendarDiv.offsetWidth + "px";
  iframeObj.style.height = calendarDiv.offsetHeight + "px";
}
/* eslint-enable no-unused-vars */
function pickDate(e, inputDay) {
  var month = currentMonth / 1 + 1;
  var no;
  if (month < 10) month = "0" + month;
  var day;
  if (!inputDay && this) day = this.innerHTML;
  else day = inputDay;
  if (day / 1 < 10) day = "0" + day;
  if (returnFormat) {
    returnFormat = returnFormat.replace("dd", day);
    returnFormat = returnFormat.replace("mm", month);
    returnFormat = returnFormat.replace("yyyy", currentYear);
    returnFormat = returnFormat.replace("d", day / 1);
    returnFormat = returnFormat.replace("m", month / 1);
    returnDateTo.value = returnFormat;
    try {
      returnDateTo.onchange();
    } catch (e) {
      // empty statement
    }
  } else {
    for (no = 0; no < returnDateToYear.options.length; no++) {
      if (returnDateToYear.options[no].value == currentYear) {
        returnDateToYear.selectedIndex = no;
        break;
      }
    }
    for (no = 0; no < returnDateToMonth.options.length; no++) {
      if (returnDateToMonth.options[no].value == parseFloat(month)) {
        returnDateToMonth.selectedIndex = no;
        break;
      }
    }
    for (no = 0; no < returnDateToDay.options.length; no++) {
      if (returnDateToDay.options[no].value == parseFloat(day)) {
        returnDateToDay.selectedIndex = no;
        break;
      }
    }
  }
  closeCalendar();
}
function getTopPos(inputObj) {
  var returnValue = inputObj.offsetTop + inputObj.offsetHeight;
  while ((inputObj = inputObj.offsetParent) != null)
    returnValue += inputObj.offsetTop;
  return returnValue + calendar_offsetTop;
}
function getleftPos(inputObj) {
  var returnValue = inputObj.offsetLeft;
  while ((inputObj = inputObj.offsetParent) != null)
    returnValue += inputObj.offsetLeft;
  return returnValue + calendar_offsetLeft;
}
function positionCalendar(inputObj) {
  calendarDiv.style.left = getleftPos(inputObj) + "px";
  calendarDiv.style.top = getTopPos(inputObj) + "px";
  if (iframeObj) {
    iframeObj.style.left = calendarDiv.style.left;
    iframeObj.style.top = calendarDiv.style.top;
    //// fix for EI frame problem on time dropdowns 09/30/2006
    iframeObj2.style.left = calendarDiv.style.left;
    iframeObj2.style.top = calendarDiv.style.top;
  }
}
function initCalendar() {
  if (MSIE) {
    iframeObj = document.createElement("IFRAME");
    iframeObj.style.filter = "alpha(opacity=0)";
    iframeObj.style.position = "absolute";
    iframeObj.border = "0px";
    iframeObj.style.border = "0px";
    iframeObj.style.backgroundColor = "#FF0000";
    //// fix for EI frame problem on time dropdowns 09/30/2006
    iframeObj2 = document.createElement("IFRAME");
    iframeObj2.style.position = "absolute";
    iframeObj2.border = "0px";
    iframeObj2.style.border = "0px";
    iframeObj2.style.height = "1px";
    iframeObj2.style.width = "1px";
    //// fix for EI frame problem on time dropdowns 09/30/2006
    // Added fixed for HTTPS
    iframeObj2.src = "blank.html";
    iframeObj.src = "blank.html";
    document.body.appendChild(iframeObj2); // gfb move this down AFTER the .src is set
    document.body.appendChild(iframeObj);
  }
  calendarDiv = document.createElement("DIV");
  calendarDiv.id = "calendarDiv";
  calendarDiv.style.zIndex = 1000;
  slideCalendarSelectBox();
  document.body.appendChild(calendarDiv);
  writeTopBar();
  if (!currentYear) {
    var d = new Date();
    currentMonth = d.getMonth();
    currentYear = d.getFullYear();
  }
  writeCalendarContent();
}
/* eslint-disable no-unused-vars */
function displayCalendar(inputField, format, buttonObj) {
  if (inputField.value.length > 6) {
    //dates must have at least 6 digits...
    if (!inputField.value.match(/^[0-9]*?$/gi)) {
      var positionArray = new Object();
      positionArray.m = format.indexOf("mm");
      if (positionArray.m == -1) positionArray.m = format.indexOf("m");
      positionArray.d = format.indexOf("dd");
      if (positionArray.d == -1) positionArray.d = format.indexOf("d");
      positionArray.y = format.indexOf("yyyy");
      positionArray.h = format.indexOf("hh");
      positionArray.i = format.indexOf("ii");

      var elements = ["y", "m", "d", "h", "i"];
      var properties = ["currentYear", "currentMonth", "inputDay"];
      var propertyLength = [4, 2, 2, 2, 2];
      for (var i = 0; i < elements.length; i++) {
        if (positionArray[elements[i]] >= 0) {
          window[properties[i]] =
            inputField.value.substr(
              positionArray[elements[i]],
              propertyLength[i]
            ) / 1;
        }
      }
      currentMonth--;
    } else {
      var monthPos = format.indexOf("mm");
      currentMonth = inputField.value.substr(monthPos, 2) / 1 - 1;
      var yearPos = format.indexOf("yyyy");
      currentYear = inputField.value.substr(yearPos, 4);
    }
  } else {
    var d = new Date();
    currentMonth = d.getMonth();
    currentYear = d.getFullYear() - 6;
    inputDay = d.getDate() / 1;
  }
  inputYear = currentYear;
  inputMonth = currentMonth;
  if (!calendarDiv) {
    initCalendar();
  } else {
    if (calendarDiv.style.display == "block") {
      closeCalendar();
      return false;
    }
    writeCalendarContent();
  }
  returnFormat = format;
  returnDateTo = inputField;
  positionCalendar(buttonObj);
  calendarDiv.style.visibility = "visible";
  calendarDiv.style.display = "block";
  if (iframeObj) {
    iframeObj.style.display = "";
    iframeObj.style.height = "140px";
    iframeObj.style.width = "195px";
    iframeObj2.style.display = "";
    iframeObj2.style.height = "140px";
    iframeObj2.style.width = "195px";
  }
  updateYearDiv();
  updateMonthDiv();
}
/* eslint-enable no-unused-vars */
