/* polyfills: closest(), classList(), trim() */
(function(e){e.closest = e.closest || function(css){var node = this;while (node) {if(node.matches(css)) return node;else node = node.parentElement;};return null;};})(Element.prototype);
(function(){var regExp=function(name){return new RegExp('(^| )'+name+'( |$)')};var forEach=function(list,fn,scope){for(var i=0;i<list.length;i++){fn.call(scope,list[i])}};function ClassList(element){this.element=element};ClassList.prototype={add:function(){forEach(arguments,function(name){if(!this.contains(name)){this.element.className+=' '+name}},this)},remove:function(){forEach(arguments,function(name){this.element.className=this.element.className.replace(regExp(name),'')},this)},toggle:function(name){return this.contains(name)?(this.remove(name),!1):(this.add(name),!0)},contains:function(name){return regExp(name).test(this.element.className)},replace:function(oldName,newName){this.remove(oldName),this.add(newName)}};if(!('classList' in Element.prototype)){Object.defineProperty(Element.prototype,'classList',{get:function(){return new ClassList(this)}})};if(window.DOMTokenList&&DOMTokenList.prototype.replace==null){DOMTokenList.prototype.replace=ClassList.prototype.replace}})()
if (!String.prototype.trim) {(function() {String.prototype.trim = function() {return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');};})();}
/* polyfills end*/

var timeObject = {
	ampm: false,
	time: '',
	date: '',
	realDate: '',
	syncTimeInterval: '',
	pageTitle: document.head.querySelector('title').textContent
};
document.querySelector('.time-control').addEventListener('click', function(e) {
	if (e.target.parentElement.classList.contains('dropdown-content')) {
		e.preventDefault();
		var dropdown = e.target.closest('.dropdown'),
			dropdownContent = dropdown.querySelector('.dropdown-content'),
			dropbtn = dropdown.querySelector('.dropbtn'),
			selected = dropdownContent.querySelector('.selected');
		if (selected) selected.classList.remove('selected');

		e.target.classList.add('selected');
		dropbtn.textContent = dropdownContent.querySelector('.selected').textContent.trim();
	};
	if (e.target.closest('.time-city .dropdown-content')) {
		e.preventDefault();
		var newTimeZone = e.target.getAttribute('gmt-zone'),
			dropbtn = dropdown.querySelector('.dropbtn')

		timeObject.pageTitle = dropbtn.textContent;

		getTime(newTimeZone, setTime);
		if(timeObject.syncTimeInterval) clearInterval(syncTimeInterval);
		timeObject.syncTimeInterval = syncTimeInterval = setInterval(function(){ 
			getTime(newTimeZone, setTime);
		}, 60000);
	};
	if (e.target.closest('.time-format .dropdown-content')){
		e.preventDefault();
		setTime(timeObject.realDate);
	}
});

function getTime(timezone, callback) {
	var xhr = new XMLHttpRequest(),
		send = function(xhr, timeZone) {
			console.log('запрос')
			xhr.open('GET', 'http://worldtimeapi.org/api/timezone/Etc/GMT' + (-1 * timezone));
			xhr.send();
		},
		errTimer = function(xhr, timezone, callback) {
			setTimeout(function() {
				console.log('Повторное соединение');
				send(xhr, timezone);
			}, 30000);
		};
	send(xhr, timezone);
	xhr.onerror = function() {
		errTimer(xhr, timezone, send);
	};
	xhr.onload = function() {
		if (xhr.status != 200) {
			console.log('Ошибка ' + xhr.status + ' : ' + xhr.statusText);
			errTimer(xhr, timezone, send);
		} else {
			var response = JSON.parse(xhr.response),
				dateString = response.datetime.replace(response.utc_offset, ''),
				date = new Date(Date.parse(dateString));
			callback(date);
		}
	};
};

function formatTime(date, ampm = false) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	if (ampm) {
		var ampm = hours >= 12 ? 'pm' : 'am';
		
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		return hours + ':' + minutes + ' ' + ampm;
	} else {
		hours = hours > 9 ? hours : '0' + hours;
		minutes = minutes > 9 ? minutes : '0' + minutes;
		return hours + ':' + minutes;
	}
};

function formatDate(date) {
	var name = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
		day = date.getDate(),
		month = date.getMonth(),
		year = date.getFullYear();
	return day + ' ' + name[month] + ' ' + year;
};

function setTime(date) {
	var ampm = document.querySelector('.time-format .dropbtn').textContent.trim();
	if (ampm === '24') ampm = false;
	timeObject.ampm = ampm;
	timeObject.time = formatTime(date, ampm);
	timeObject.date = formatDate(date);
	timeObject.realDate = date;
	document.querySelector('.time-counter').textContent = timeObject.time;
	document.querySelector('.time-data').textContent = timeObject.date;
	document.head.querySelector('title').textContent = timeObject.time + ' | ' + timeObject.pageTitle;
};

setInterval(function() {
	if (!timeObject.realDate) return false;
	var date = timeObject.realDate;
	date.setSeconds(+date.getSeconds() + 1);
	setTime(date);
}, 1000);