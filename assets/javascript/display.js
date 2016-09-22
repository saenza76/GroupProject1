"use strict";

// Updates to display
const display = {
	// Animation properties
	shakeTime: 150,  // Duration of shake animation
	hiScoreTime: 80,  // Timeout delay for each new shown high score row


	// Methods
	startGame: function() {},
		// Fades out game options and starts game
		// Calls: game.start
		// Sets: none

	gameOver: function() {},
		// Show game over text
		// Calls: none
		// Sets: none

	addWord: function(word){},
		// Places a new falling word on screen, sets a timeout to call removeWord if not completed in game.wordSpeed
		// Calls: none
		// Sets: none

	removeWord: function(word){},
		// Removes falling word from screen, triggers game-body flash animation
		// Calls: none
		// Sets: none

	resetWord: function(word){},
		// Resets word HTML to starting state
		// Calls: none
		// Sets: none

	blowUpWord: function(word){},
		// Play word explosion animation
		// Calls: none
		// Sets: none

	shakeWord: function(word){},
		// Play word shake animation
		// Calls: none
		// Sets: none

	showOptions: function(){},
		// Shows word list selector buttons, modifies #output div css
		// Calls: none
		// Sets: none

	stats: function(){},
		// Shows current game stats below game
		// Calls: none
		// Sets: none

	highScores: function(){}
		// Shows high score table data
		// Calls: none
		// Sets: none
}


// Method definitions
Object.defineProperties(display, {
	"startGame": { value: function() {
		$("#thanks").fadeOut();
		$(".startGame").fadeOut(function() {
			$("#output").removeClass("flex");
			$("#output").empty();
			if (!game.ready) { game.start(); }
		});
	}},

	"gameOver": { value: function() {
		$("#output").addClass("flex").html($("<div>").addClass("text-center").attr("id", "thanks").html("<h1>Thanks for playing!</h1>").fadeIn());
	}},

	"addWord": { value: function(word) {
		// Create and output series of spans for each character in the word
		let html = "<div id='word_" + word.number + "' class='falling-word'><div id='word_" + word.number + "_wrapper'><h2>";
		for (let i = 0; i < word.str.length; i++) {
		  html += "<span id='word_" + word.number + "_letter_" + i + "'>" + word.str[i] + "</span>";
		}
		html += "</h2></div></div>";
		$("#output").append(html);

		// Randomize y position of new word
		const maxXPos = $("#game-body").width() - $("#word_" + word.number).width();
		const rand = Math.floor(Math.random() * maxXPos) + 15;
		$("#word_" + word.number).css("left", rand);

		// Start animation, with callback to destroy word
		$("#word_" + word.number).velocity({ translateY: "540px" },
		  { duration: (word.str.length + 1) * game.wordSpeed, easing: "linear", complete: function() { if (game.activeWords.indexOf(word) != -1) { game.removeWord(word); } } });
	}},

	"removeWord": { value: function(word) {
		// Remove word from HTML
		$("#word_" + word.number).remove();

		// Flash game panel
		$("#game-panel").css("box-shadow", "0px 0px 10px 1px red");
		setTimeout(function(){ $("#game-panel").css("box-shadow", ""); }, 50);
		setTimeout(function(){ $("#game-panel").css("box-shadow", "0px 0px 10px 1px red"); }, 120);
		setTimeout(function(){ $("#game-panel").css("box-shadow", ""); }, 170);
	}},

	"resetWord": { value: function(word) {
		for (let i = 0; i < game.currentLetter; i++) {
			$("#word_" + word.number + "_letter_" + i).css("color", "black");
			if ($("#word_" + word.number + "_letter_" + i).html() == "_") { $("#word_" + word.number + "_letter_" + i).html(" "); }
		}
	}},

	"blowUpWord": { value: function(word) {
		const absPosOffset = $("#word_" + word.number + "_letter_" + 0).width();

		const horizSize = 120 + (8 * word.str.length);  // Horizontal explosion size
		const horizRandMult = 40;  // Horizontal randomness
		function horizOffset(index) { return -(horizSize / 2) + (index * (horizSize / (word.str.length - 1))) }
		
		const vertSize = 60 + (4 * word.str.length);  // Vertical explosion size
		const vertRandMult = 24;  // Vertical randomness
		let flip = Math.random() > 0.5 ? 1 : -1;
		function vertOffset(index) { return Math.sin(index * Math.PI / (word.str.length - 1)) * vertSize * (flip == 1 ? flip = -1 : flip = 1)}
		
		const explodeTime = 250;  // Looks better if you keep the explode time at least 50% longer than the fade time
		const fadeTime = 160;
		
		let horizRand;
		let vertRand;

		// Stop all running animations first
		$("#word_" + word.number).velocity("stop", true);

		for (let i = 0; i < word.str.length; i++) {
			// Remove added dashes
			if ($("#word_" + word.number + "_letter_" + i).html() == "_") { $("#word_" + word.number + "_letter_" + i).html(" "); }
			
			// Set all letters to absolute position and offset left to correct initial position
			$("#word_" + word.number + "_letter_" + i).css("position", "absolute").css("left", (absPosOffset * i) + "px");

			// Set random variation for final letter positions
			horizRand = Math.random() * horizRandMult - (horizRandMult / 2);
			vertRand = Math.random() * vertRandMult - (vertRandMult / 2);

			// Animate explosion
			$("#word_" + word.number + "_letter_" + i).velocity({
				translateX: horizOffset(i) + horizRand,
				translateY: vertOffset(i) + vertRand,
			}, { duration: explodeTime, easing: "easeOutQuad"});
		}

		// Fade out word, then delete
		$("#word_" + word.number).velocity("fadeOut", { duration: fadeTime, easing: "linear",
			completion: function() { $("#word_" + word.number).remove() } });
	}},

	"shakeWord": { value: function(word) {
		$("#word_" + word.number + "_wrapper").addClass("word-shake");
		setTimeout(function(){ $("#word_" + word.number + "_wrapper").removeClass("word-shake"); }, display.shakeTime);
	}},

	"showOptions": { value: function() {
		const buttonTemplate = "<button class='btn btn-default startGame' id='hipster' data-type='hipster'>Hipster Words</button> &nbsp;&nbsp;\
			<button class='btn btn-default startGame' id='latin' data-type='latin'>Latin Words</button> &nbsp;&nbsp;\
			<button class='btn btn-default startGame' id='bacon' data-type='bacon'>Bacon Words</button> &nbsp;&nbsp;\
			<button class='btn btn-default startGame' id='random' data-type='random'>Random Words</button>";

		const radioTemplate = "<label class='btn btn-primary active'><input type='radio' name='options' id='option1' autocomplete='off' checked> Easy </label>\
	  		<label class='btn btn-primary'><input type='radio' name='options' id='option2' autocomplete='off'> Hard </label>\
	  		<label class='btn btn-primary'><input type='radio' name='options' id='option3' autocomplete='off'> Insane </label>";

		if (!game.over) { $("#output").empty(); }
		$("#output").addClass("flex").append($("<div>").html(buttonTemplate).fadeIn());
		$("#output").addClass("flex").append($("<div>").html(radioTemplate).fadeIn());
	}},

	"stats": { value: function() {
		$("#score").html(stats.score);
		$("#score-mult").html("x" + stats.scoreMultiplier);
		$("#score-diff").html($("<span>").html((stats.scoreDelta > 0 ? "+" : "") + (stats.scoreDelta != 0 ? stats.scoreDelta : ""))
			.css("color", stats.scoreDelta > 0 ? "#22f722" : "red").fadeIn().fadeOut());
		$("#wpm").html(stats.wpm.toFixed(1));
		$("#acc").html(stats.hits + " / " + (stats.hits + stats.misses) + " ( " + stats.acc.toFixed(1) + "% )");
		$("#streak").html(stats.currentStreak);
		// $("#streak").html($("<span>").attr("id", "streakNum").html(stats.currentStreak).css("color", stats.currentStreak == 0 ? "red" : "white")
		// 	.fadeIn(stats.currentStreak == 0 ? 400 : 0, function() { $("#streakNum").velocity({ color: "white" }); }));
		$("#longest").html(stats.longestStreak);
	}},

	"highScores": { value: function(newScoreNum) {
		$("#highscore-stats").empty();
		if (newScoreNum !== null) {
			for (let i = 0; i < stats.scoreArr.length; i++) {
				$("#highscore-stats").append($("<tr>").html(stats.scoreArr[i].html).fadeIn( newScoreNum == i ? 400 : 0 ));
			}
		} else {
			for (let i = 0; i < stats.scoreArr.length; i++) {
				setTimeout(function() { $("#highscore-stats").append($("<tr>").html(stats.scoreArr[i].html).fadeIn()) }, i * display.hiScoreTime);
			}
		}
	}}
});