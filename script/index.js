var backendURL = "route.php"

var holder = document.getElementById('holder'),
tests = {
	filereader: typeof FileReader != 'undefined',
	dnd: 'draggable' in document.createElement('span'),
	formdata: !!window.FormData,
	progress: "upload" in new XMLHttpRequest
}, 
support = {
	filereader: document.getElementById('filereader'),
	formdata: document.getElementById('formdata'),
	progress: document.getElementById('progress')
},
acceptedTypes = {
	'text/plain': true
},
fileupload = document.getElementById('upload');
"filereader formdata progress".split(' ').forEach(function (api) {
	if (tests[api] === false) {
		support[api].className = 'fail';
	} else {
		support[api].className = 'hidden';
	}
});

function previewfile(file) {
	if (tests.filereader === true && acceptedTypes[file.type] === true) {
		var reader = new FileReader();
		reader.onload = function (event) {
			holder.innerHTML = '<p id="innerLiner">' + file.name + ' (' + (file.size ? (file.size/1024|0) + 'K' : '') +')</p>';
		};
		reader.readAsDataURL(file);
	}  else {
		holder.innerHTML = '<p id="innerLiner">File unsupported</p>';
		console.log(file);
	}
}

if (tests.dnd) { 
	holder.ondragover = function () { this.className = 'hover'; return false; };
	holder.ondragend = function () { this.className = ''; return false; };
	holder.ondrop = function (e) {
		this.className = '';
		e.preventDefault();
		previewfile(e.dataTransfer.files[0]);
		readfiles(e.dataTransfer.files[0]);
	}
} else {
	fileupload.className = 'hidden';
	fileupload.querySelector('input').onchange = function () {
		previewfile(this.files[0])
		readfiles(this.files[0]);
	};
}

function createThread(input, callback) {
	$.ajax({
		url: backendURL, 
		async: true,
		method: "GET",
		data: {input: input},
		success: function(result) {
			console.log("create: " + result)
			callback(result)
		}
	});
}

function sampleThread(index, callback) {
	$.ajax({
		url: backendURL, 
		async: true,
		method: "GET",
		data: {samplingIndex: index},
		success: function(result) {
			console.log("sample: " + result)
			callback(result)
		}
	});
}

function endThread(index, callback) {
	$.ajax({
		url: backendURL, 
		async: true,
		method: "GET",
		data: {endingIndex: index},
		success: function(result) {
			console.log("end: " + result)
			callback(result)
		}
	});
}

$(document).ready(function() {
	var outdiv = $("#outdiv")
	var indiv = $("#indiv")
	var timer = null
	var index = -1
	console.log("start")

	$('#begin').click(function() {
		var errorBox = $("#errorbox")
		//var sample = $("#sample").val()
		var sample = "sdafjlasjdflaskjdfljasdlfjaslkdjflaskdjfljasdf"
		if (sample.length >= 10) {
			errorBox.css("display", "none")

			$("#compdiv").css("display", "inline")
			$("#outdiv").css("display", "none")
			$("#indiv").css("display", "none")	

			createThread(sample, function(result) {
				index = parseInt(result)

				timer = setInterval(function() {
					sampleThread(index, function(result) {
						if(result !== "") {
							if($("#compdiv").css("display") === "inline") {
								$("#compdiv").css("display", "none")
								$("#outdiv").css("display", "inline")
								$("#indiv").css("display", "none")
							} $("#inneroutbox").text(result)
						}
					})
				}, 5000)
			})

			if ($('#cookiecheck').attr("checked")) {
				Cookies.set('mimicr',index,{ expires: 2 })
			} else gIndex = index;

			outdiv.css("display", "block")
			indiv.css("display", "none")
		} else errorBox.css("display", "block")
	})

	$('#stop').click(function() {
		if(timer != null) clearTimeout(timer)

			endThread(Cookies.get('mimicr'), null)
		Cookies.remove('mimicr')

		outdiv.css("display", "none")
		indiv.css("display", "block")
	})

	window.onbeforeunload = function(e) {
		if (outdiv.css("display") === "block") {
			if (! Cookies.get('mimicr')) {
				endThread(gIndex)
			}
		} 
	}

	if (! Cookies.get('mimicr')) {
		outdiv.css("display", "none")
		indiv.css("display", "block")
	} else {
		outdiv.css("display", "block")
		indiv.css("display", "none")
	}
})