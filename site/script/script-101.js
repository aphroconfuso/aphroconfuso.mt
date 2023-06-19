var
	author,
	body,
	bodyEnd,
	bodyHeight,
	bodyStart,
	currentTime,
	elapsedTime,
	hideScrollTools,
	lastReportedReadingTime,
	lastReportedScrollPosition,
	lastScrollPosition,
	newScrollPosition,
	pageHeight,
	percentageProgress,
	placeText,
	podcastUrl,
	previousTime,
	screenHeight,
	skippedTime,
	timeStarted,
	title,
	wordcount,
	wordsPerPixel,
	wordsPerSecond;

const progressElement = document.getElementById('progress');

var bookmarksList = {};
var storyCompleted = false;

const thresholdWords = 100;
const minWordsperSecond = 1; // was 0.5
const maxWordsPerSecond = 5; // was 4

const getScrollPosition = () => window.pageYOffset || document.documentElement.scrollTop;

const scrolling = () => {
  newScrollPosition = getScrollPosition();
  if (newScrollPosition < 120 || newScrollPosition < lastScrollPosition) {
    document.body.classList.add('show-nav');
  } else {
    document.querySelector('#menu-toggle').checked = false;
    document.body.classList.remove('show-nav');
  }
  if (newScrollPosition !== lastScrollPosition) {
    document.body.classList.add('scrolling');
    clearTimeout(hideScrollTools);
    hideScrollTools = setTimeout(() => {
      document.body.classList.remove('scrolling')
    }, 5000);
		percentageProgress = parseInt(((newScrollPosition - bodyStart) * 100) / bodyHeight);
		if (percentageProgress >= 0) {
			if (percentageProgress > 100) {
				percentageProgress = 100;
			}
			progressElement.innerText = `${ percentageProgress }%`;
		}
		lastScrollPosition = newScrollPosition;
  }
  return;
}

const addBookmarkNow = () => {
	addBookmark(location.pathname, {
		title,
		author,
		placeText: 'xxx',
		wordcount,
		speed: wordsPerSecond && wordsPerSecond.toFixed(2),
		percentage: percentageProgress,
		scrollPosition: newScrollPosition
	});
}

const heartbeat = (wordsPerPixel, screenHeight, bodyStart, bodyEnd, title) => {
	const timeNow = new Date() / 1000;
	const secondsElapsed = timeNow - lastReportedReadingTime;
	const newScrollPosition = getScrollPosition();

	if (newScrollPosition > lastReportedScrollPosition) {
		const pixelProgress = newScrollPosition - lastReportedScrollPosition;
		const wordsRead = wordsPerPixel * pixelProgress;
		const wordsPerSecond = wordsRead / secondsElapsed;

		// Is it a plausible speed?
		if (wordsRead > thresholdWords && wordsPerSecond > minWordsperSecond && wordsPerSecond < maxWordsPerSecond) {
			window._paq.push(['trackEvent', 'Qari', 'kliem', title, parseInt(wordsRead)]);
			window._paq.push(['trackEvent', 'Qari', 'minuti', title, (secondsElapsed / 60).toFixed(2)]);
			window._paq.push(['trackEvent', 'Qari', 'perċentwali', title, parseInt(percentageProgress)]);
			window._paq.push(['trackEvent', 'Qari', 'ħeffa', title, wordsPerSecond.toFixed(2)]);

			// save bookmark
			addBookmarkNow();

			lastReportedScrollPosition = newScrollPosition;
			lastReportedReadingTime = timeNow;
			return;
		}
		// Shall we reset?
		return;
	}
}

// BOOKMARKS *************************************************************************************

const getBookmarksList = () => {
	bookmarksList = JSON.parse(localStorage.getItem("bookmarks") || "{}");
	showFullBookmarks();
}

const saveBookmarksList = () => {localStorage.setItem("bookmarks", JSON.stringify(bookmarksList));}

// BETTER TO STORE AS ARRAY OF OBJECTS?
const addBookmark = (url, bookmark) => {
	console.log('Adding ', url, bookmark);
	const thisKey = url.replace(/\//g, '');
	bookmarksList[thisKey] = bookmark;
	saveBookmarksList();
	updateBookmarksMenu();
	saveBookmarksList();
}

const updateBookmarksMenu = () => {
	if (!bookmarksList) {
		return;
	}
	count = Object.keys(bookmarksList).length;
	console.log(count);
	document.getElementById("bookmarksTotal").innerHTML = ` (${ count })`
}

const showFullBookmarks = () => {
		console.log('full...');
	const tbody = document.querySelector("ol");
	const template = document.querySelector("template");
	console.log(template);
	if (!template) {
		console.log('returning...');
		return;
	}
	Object.keys(bookmarksList).forEach = (key) => {
		const bookmark = bookmarksList[key];
		console.log(bookmark);
		const clone = template.content.cloneNode(true);
		let h1 = clone.querySelectorAll("h1");
		let h2 = clone.querySelectorAll("h2");
		let body = clone.querySelectorAll(".body-text")[0];
		h1.textContent = bookmark.title;
		h2.textContent = bookmark.author;
		tbody.appendChild(clone);
	}
}

const deleteBookmark = () => {}

const clearAllBookmarks = () => { localStorage.clear(); }


// INITIALISE ***********************************************************************

const initialiseAfterNewsletter = () => {
	return;
}

const initialiseFontSizeListeners = () => {
	document.getElementById("font-size-1").addEventListener('click', () => addRemoveFontSizeClass(1));
	document.getElementById("font-size-2").addEventListener('click', () => addRemoveFontSizeClass(2));
	document.getElementById("font-size-3").addEventListener('click', () => addRemoveFontSizeClass(3));
	document.getElementById("font-size-4").addEventListener('click', () => addRemoveFontSizeClass(4));
};

const initialiseReadingHeartbeat = () => {
	lastReportedReadingTime = new Date() / 1000;
	timeStarted = lastReportedReadingTime;
	setInterval(heartbeat, 3000, wordsPerPixel, screenHeight, bodyStart, bodyEnd, title);
}

const initialiseAfterNav = () => {
	initialiseFontSizeListeners();
}

let message;
const initialiseMessage = () => {
	if (getCookie('newsletter') === 'pendenti') {
		message = 'Bgħatnielek email biex tikkonferma <l-m>l-abbonament</l-m> tiegħek fin-newsletter.';
	}
	if (!!location.hash && document.referrer.indexOf('//newsletter.aphroconfuso.mt')) {
    // REVIEW escape is deprecated
    const salted = decodeURIComponent(escape(window.atob((location.hash.substring(1)))));
    [salt, message] = salted.split('|');
		if (salt === 'aaaASUDHASUWYQQU55%$ASGDGAS*Jhh23423') {
      if (message.indexOf('biex tikkonferma l-abbonament')) {
				_paq.push(['trackEvent', 'Newsletter', 'Abbonament', 'Pendenti']);
        setCookie('newsletter', 'pendenti');
      }
			if (message.indexOf('abbonament ikkonfermat')) {
				_paq.push(['trackEvent', 'Newsletter', 'Abbonament', 'Komplut']);
        setCookie('newsletter', 'abbonat*');
      }
		}
	}
	if (!!message) {
		document.getElementById('message').setAttribute('data-content-piece', '«' + message + '»');
		document.getElementById('message').innerHTML = '<p>' + message + '</p>';
		document.getElementById('message').classList.add('active');
		setTimeout(() => document.getElementById('message').classList.remove('active'), 10000);
		location.hash = '';
	}
}

const initialiseAfterWindow = () => {
	initialiseAfterNav();
	initialiseMessage();
	if (!!wordcount) {
		screenHeight = window.innerHeight;
		body = document.getElementById('body-text');
		bodyHeight = body.offsetHeight - screenHeight;
		bodyStart = body.offsetTop;
		title = document.querySelector("h1").innerText;
		author = document.querySelector("meta[name=author]").content;
		bodyEnd = bodyStart + bodyHeight;
		wordsPerPixel = wordcount / bodyHeight;
		window.addEventListener('scroll', (event) => {
			scrolling();
		});
		lastScrollPosition = getScrollPosition();
		lastReportedScrollPosition = lastScrollPosition;
		pageHeight = document.body.scrollHeight;
		initialiseReadingHeartbeat(wordcount);

		const slideshows = document.getElementsByClassName('splide');
		if (slideshows.length) {
			Splide.defaults = {
				type: 'fade',
				rewind: true,
				speed: 2000,
				padding: '2rem 0',
			}
			for (var i = 0; i < slideshows.length; i++) {
				const newSplide = new Splide(slideshows[i]).mount();
				newSplide.on('visible', function (slide) {
					window._paq.push(['trackEvent', 'Stampi', 'slideshow', title, slide.index + 1]);
				});
			}
		}
		const lightbox = document.getElementById('lightbox');
		const openLightbox = () => {
			lightbox.classList.add('open');
		}
		const closeLightbox = () => {
			lightbox.classList.remove('open');
		}
		const lightboxOpen = document.getElementById('lightbox-open');
		const lightboxClose = document.getElementById('lightbox-close');
		lightboxOpen && lightboxOpen.addEventListener('click', () => openLightbox());
		lightboxClose && lightboxClose.addEventListener('click', () => closeLightbox());
		if (lightboxClose) {
			document.onkeydown = function(evt) {
				evt = evt || window.event;
				if (evt.keyCode === 27) {
					closeLightbox();
				}
			};
		}

		if (podcastUrl) {
			Amplitude.init({
				songs: [
					{
						url: podcastUrl
					}
				]
			});
			const audio = Amplitude.getAudio();
			const duration = parseInt(audio.duration);
			previousTime = 0;
			audio.addEventListener('play', () => {
				console.log('play');
			});
			audio.addEventListener('pause', () => {
				console.log('pause', 'percentage');
				// Set audio bookmark
			});
			audio.addEventListener('seek', () => {
				console.log('seek');
			});
			audio.addEventListener('ended', () => {
				console.log('ended');
				// Delete bookmark or completed
			});
			audio.addEventListener('waiting', () => {
				console.log('buffer...');
			});

			audio.addEventListener('timeupdate', () => {
				currentTime = parseInt(audio.currentTime);
				if (currentTime === 0 || (currentTime === previousTime)) {
					return;
				}
				elapsedTime = currentTime - previousTime;
				if (elapsedTime > 1) {
					console.log(['trackEvent', 'Smiegħ', 'kliem maqbuż', title, elapsedTime]);
					// window._paq.push(['trackEvent', 'Smiegħ', 'kliem maqbużin', title, parseInt(wordsRead)]);
					// resetTime?
				}
				if (currentTime % 30 === 0) {
					// save bookmark
				}
				if (currentTime % 30 === 0) {
					// Set audio bookmark
					console.log(['trackEvent', 'Smiegħ', 'kliem', title, 'parseInt(wordsHeard)']);
					console.log(['trackEvent', 'Smiegħ', 'minuti', title, 0.5]);
					console.log(['trackEvent', 'Smiegħ', 'perċentwali', title, ((currentTime * 100) / duration).toFixed(2)]);
					console.log(['trackEvent', 'Smiegħ', 'kliem maqbużin', title, 'parseInt(wordsHeard)']);
					// window._paq.push(['trackEvent', 'Smiegħ', 'kliem', title, parseInt(wordsRead)]);
					// window._paq.push(['trackEvent', 'Smiegħ', 'minuti', title, 0.5]);
					// window._paq.push(['trackEvent', 'Smiegħ', 'perċentwali', title, ((currentTime * 100) / duration).toFixed(2)]);
				}
				previousTime = currentTime;
			});
			document.getElementById('range').addEventListener('click', function(e){
					var offset = this.getBoundingClientRect();
					var x = e.pageX - offset.left;
					Amplitude.setSongPlayedPercentage((parseFloat(x) / parseFloat( this.offsetWidth) ) * 100);
			});
			document.getElementById('audio').classList.add('initialised');
		}
	};
}

window.onload = initialiseAfterWindow;
