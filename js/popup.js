//Забирає позначку про новину
setTimeout(function() {
	chrome.browserAction.setBadgeText({
		text: ''
	});
}, 1000);

var preventCache = {};
function withCache(callback) {
	preventCache = {}
	chrome.runtime.sendMessage({
		refresh: 'refresh'
	}, function(response) {
		if (response.text == 'true') {
			preventCache = {
				"_": $.now()
			};
			console.log('true', preventCache, callback);
			callback.call();
		}
	});
}

function newsHandler() { //Перегляд новин
	$('div#news h4').click(function() {
		$('div#news div.new').slideUp('normal');
		$(this).next().slideDown('normal');
	});
	$('div#news>div.new').hide();
	setTimeout(function() {
		$('h4').first().click();
	}, 1000);
}
//Слайдер карусель
function makeRequsts() {
	$.get('http://www.ktc-ua.com/', preventCache, function(data) {
		var carousel = $(data).find('img.image-style-none[width="690"]').parent();
		for (var i = 0; i < carousel.length; i++) {
			$('#carousel').append('<li></li>');
			$('li').last().html(carousel[i]);
		}
	}).done(function() {
		createCarousel(); //Ініціалізувати карусель
		//Запам’ятати який баннер був останній
		var lastPic = $('.ic_tray img:eq(1)').attr('src').match(/\w+-?\w+/g)[7];;
		var obj = {
			lastPic: lastPic
		}
		chrome.storage.local.set(obj);
		$('img.loading').remove();
		$('h1').show(); //Показати заголовок новин
		//Новини
		$.get('http://www.ktc-ua.com/news', preventCache, function(data) {
			var headers = $(data).find('.field-item.even h2');
			var dates = $(data).find('.field-name-post-date div div');
			var text = $(data).find('.field-name-body.view-mode-full div div');
			for (var i = 0; i < text.length; i++) {
				$('#news').append('<h4></h4><div class="new"></div>'); //Блок для новини
				$('h4:last').html(headers[i]); //Заголовок
				$('div.new:last').html(text[i]); //Текст новини
				$('h4:last h2').contents().unwrap(); //Забрати теги із заголовку
				$('h4:last').append('<span></span>'); //Елемент для дати
				$('h4 span:last').html(dates[i]); //Вставка дати
				$('h4 span div:last').contents().unwrap(); //Забрати зайві теги із дати
			}
		}).done(function() {
			//Запам’ятати останню дату
			var lastDate = $('#news h4:first span').text();
			var obj = {
				lastDate: lastDate
			}
			chrome.storage.local.set(obj, function() {
				chrome.storage.local.get(null, function(data) {
					console.log(data); //Все що знаходиться в chrome.storage
				})
			});
			//Event handlers для новин
			newsHandler();
			//Відкривати в новій вкладці
			$('a').attr('target', '_blank');
			chrome.alarms.create('ktc-update', {
				periodInMinutes: 120
			});
		});
	});
}
withCache(makeRequsts());

function createCarousel() {
	$(document).ready(function() {
		//Кнопка пошуку
		$('button.search').click(function() {
			var inputText = $('#edit-keys-1').val();
			if (inputText !== '' && inputText.length > 1) {
				chrome.tabs.create({
					url: 'http://www.ktc-ua.com/search/site/' + inputText,
					selected: true
				});
			} else if (inputText.length == '') {
				$('#edit-keys-1').attr('placeholder', 'СПЕРШУ ВВЕДІТЬ СЛОВО ДЛЯ ПОШУКУ!');
				//Повертати початкове положення
				setTimeout(function() {
					$('#edit-keys-1').attr('placeholder', 'Введіть слово для пошуку...');
				}, 3000);
			} else if (inputText.length < 2) {
				$('#edit-keys-1').val('Введіть як мінімум 2 символи');
			}
		});
		//Карусель
		var itemsLength = $('#carousel li').length;
		var thumbnailsWidth = itemsLength * 100;
		$('#carousel').infiniteCarousel({
			showControls: true,
			autoPilot: true,
			displayProgressRing: false,
			thumbnailType: 'images',
			internalThumbnails: false
		});
		//В залежності від кількості превьюшок встановлювати їх ширину
		$('.ic_thumbnails').css({
			width: thumbnailsWidth + 'px'
		});
		//Переходити на сайт по кліку на зображення з каруселі
		$('.ic_link').click(function(event) {
			event.preventDefault();
			var link = $(this).attr('href');
			chrome.tabs.create({
				url: link,
				selected: true
			});
		})
	});
}