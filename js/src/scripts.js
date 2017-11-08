/*

ROADMAP:
Add settings to localstorage
Add new modes
Add currency

*/


//app
var app = new Vue({
		el: '#app',
		data: {
			cardstate: 'back', // front, back/flipped
			state: 'on',	// valid, error, on, end
			mode: 'test',	// 'practice' - answer until correct. 
							// 'stack' - only one answer per question (limited question)
							// 'streak' - go until you get a wrong answer - grade is total correct
							// 'timer' - race the clock and answer as many as you can in a set time
			range_answer: 6,
			active_val: '',
			passive_val: '',
			actives: '0-10',
			passives: '0-10',
			active_min: 0,
			active_max: 10,
			passive_min: 0,
			passive_max: 10,
			operation: '+', // '-', '×', '÷'
			operationlabel: {
				'+': 'Addition',
				'-': 'Subtraction',
				'×': 'Multiplication',
				'÷': 'Division'
			},
			errors: 0,
			valids: 0,
			answer_count: 0,
			answer_color: 0,
			total_cards: 100,
			current_card: 0,
			answers: [],
			progressrecord: [],
			allow_negative: false,
			// max_errors_allowed: 5,
			// pause_allowed: false,
			// fractions: false,
			// decimals: false,
			// init_timeout: 10000,
			// timer: false,	// to add a timer option
			starttime: 0,
			duration: 0,
			logs: localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [],
			displaylogs: false,
			infomode: false,
			autopilot: false,
			autopilot_timeout: null,
			autopilot_delay: 400,
			card_timeout: null,
			card_delay: 500,
			vrv: null,
			vrv_options: null,
			svg: null,
			notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
			octaves: [1, 2],
			clefs: ['treble', 'bass'],
			note_length: 4,
			test_clef: 'both', //'treble', 'bass', 'both'
			note: {}, //note object to store current card values
		},

		methods: {

			answerforme(){
				var correct = this.getAnswer();

				//
				for ( var i = 0; i < 4; i++ ) {
					if ( this.answers[i].value === correct ) {
						this.checkAnswer(i);
					}
				}

			},

			badAnswer(){
				if ( this.errors > this.max_errors_allowed ) {
					// this.state = 'end';
				}
			},

			checkAnswer(i){
				// console.log('checkAnswer() called');

				// get correct answer
				var correct = this.getAnswer();
				// console.log(i, this.answers[i].value, this.state, correct);

				this.answer_count++;

				//if practice mode
				if ( this.mode === 'practice' ) {
					// correct - load new card
					if ( this.answers[i].value === correct ) {
						// alert('correct!');
						this.valids++;
						this.state = 'valid';
						this.answers[i].state = 'valid';
						this.card_timeout = setTimeout(this.newCard, this.card_delay);
					}
					else { // incorrect - wait for correct			 
						this.errors++;
						this.state = 'error';
						this.answers[i].state = 'error';
						this.badAnswer();
						// alert('nope! ' + this.errors + ' incorrect.');
					}

					this.current_card++;

					//update progress
					this.progressrecord.push({
						state:	this.state,
						count:	this.answer_count
					});

				} else { // test mode
					// record correct answer
					if ( this.answers[i].value === correct ) {
						this.valids++;
						this.state = 'valid';
						this.answers[i].state = 'valid';
					} else { //record incorrect answer
						this.errors++;
						this.state = 'error';
						this.answers[i].state = 'error';
					}
					// console.table( this.answers );

					this.current_card--;

					//update progress
					this.progressrecord.push({
						state:	this.state,
						count:	this.answer_count
					});
					// console.table( this.progressrecord );
					
					// load new card
					this.card_timeout = setTimeout(this.newCard, this.card_delay);

					//automate answers
					if ( this.current_card > 0 && this.autopilot ) {
						this.autopilot_timeout = setTimeout(this.answerforme, this.card_delay + this.autopilot_delay);
					}
					// console.log('next card timeout called');
				}	 
			},

			clearlog(){
				this.logs = [];
				// localStorage.setItem('logs', []);
			},

			displaylog(show){
				if (typeof show === 'undefined') { show = !this.displaylogs; }
				this.displaylogs = show;
			},

			flipcard(){
				// console.log('flipcard');
				if (this.cardstate === 'front') { 
					this.cardstate = 'back';
				} else {
					this.cardstate = 'front';
					this.displaylogs = false;
				}

				if (this.state === 'off'){
					this.reset();
				}
			},
			
			generate_Plaine_Easie(args) {
				console.log('gPE', args);
				/*
					clef:	(treble)G-2 | (bass)F-4
					octave:	(1)' | (2)'' | (3)''' | (1), | (2),, | (3),,,
					length:	1 | 2 | 4 | 8 | 6
					note:	CDEFGAB
				*/
				//set defaults
				if ( args.clef === undefined ) {
					args.clef = this.clefs[0];
				}
				if ( args.octave === undefined ) {
					args.octave = this.octaves[0];
				}
				if ( args.length === undefined ) {
					args.length = this.note_length;
				}
				if ( args.note === undefined ) {
					args.note = this.notes[0];
				}

				var plaine_easie, pe_clef, pe_oct, pe_len, pe_val;

				//set clef
				if ( args.clef === 'bass' ) {
					pe_clef = 'F-4';
				} else {
					pe_clef = 'G-2';
				}

				if ( args.clef === 'bass' &&
					 args.octave >= 1 ) {
					args.octave *= -1;
				}
				//set octave
				switch ( args.octave ) {
					case 1:
						pe_oct = "'";
						break;
					case 2:
						pe_oct = "''";
						break;
					case 3:
						pe_oct = "'''";
						break;
					case -1:
						pe_oct = ",";
						break;
					case -2:
						pe_oct = ",,";
						break;
					case -3:
						pe_oct = ",,,";
						break;
					default:
						pe_oct = ',';
				}
				//set note length
				pe_len = args.length;
				//set note
				pe_val = args.note;

				plaine_easie = '@clef:' + pe_clef + '\n@data:' + pe_oct + pe_len + pe_val+'/';
				console.log(plaine_easie);
				return plaine_easie;
			},

			getAnswer(){
				return this.note.note;
			},

			getRandomValues(){
				// console.log('getRandomValues() called');
				this.note.clef = this.clefs[0];
				//clef - if set to both, pick one randomly, otherwise, send the setting in
				if ( this.test_clef === 'both' ) {
					this.note.clef = this.clefs[Math.floor(Math.random() * this.clefs.length)]
				} else {
					this.note.clef = this.test_clef;
				}
				//random note
				this.current_note = this.notes[Math.floor(Math.random() * this.notes.length)];
				//random octave
				this.note.octave = this.octaves[Math.floor(Math.random() * this.octaves.length)];
				//constant note length
				console.log(this.note.clef, this.note.note, this.note.octave);
				this.set_svg( this.generate_Plaine_Easie({
						clef: this.note.clef,
						note: this.note.note,
						octave: this.note.octave
					})
				);

				this.randomize_answers();
			},

			getReport(){
				this.endtime = new Date();
				this.duration = moment(this.endtime).diff(moment(this.starttime), 'seconds');

				var terms_active = this.actives;
				var terms_passive = this.passives;
				if ( this.active_max === this.active_min ) {
					terms_active = this.active_max;
				}
				if ( this.passive_max === this.passive_min ) {
					terms_passive = this.passive_max;
				}

				var log = {
					grade: this.grade,
					correct: this.valids,
					total: this.total_cards,
					operationlabel: this.operationlabel[this.operation],
					operation: this.operation,
					terms_active: terms_active,
					terms_passive: terms_passive,
					duration: this.duration,
					time: new Date(),
				};
				// alert(log.operation +'('+ log.total +') '+ log.grade +'% '+ log.duration + 's');
				this.logs.unshift(log);
				// localStorage.setItem('logs', this.logs);

				this.flipcard();
				this.displaylog(true);
			},

			newCard(){
				// console.log('newCard() called');
				// console.log(this.mode, this.state, this.current_card);
				// console.table( this.answers );
				//if practice mode
				if ( this.mode === 'practice' ) {
					//reset the values
					this.getRandomValues();
					this.state = 'on';
				} else { // test mode
				// if cards are out
				if ( this.current_card <= 0 ) {
						this.getReport();
						this.state = 'off';
					} else {
						//reset the values
						this.getRandomValues();
						this.state = 'on';
					}
				}
				this.answer_color = this.randomNumber(8);
			},

			progresswidthcss(total){
				if ( this.mode === 'practice' ) {
					return 'width:' + (100 / this.current_card) + '%;';
				} else {
					return 'width:' + (100 / this.total_cards) + '%;';
				}
			},

			random(answers, distance) {
				// return Math.round(Math.random()*this.range_answer[1]+this.range_answer[0]);

				// correct answer will always be the first index of answers
				// distance meaning be the range +/- that the answer can be from the center (correct answer)
				// get random number of distance
				var num = Math.round( Math.random() * distance * 2 ) - distance;
				// center number is the origin
				// offset for correct
				num += answers[0].value;
				// make sure the answer checks if `allow_negative`
				if ( !this.allow_negative && num < 0 ) {
					// if negative get another
					//return this.random(answers, distance);
					num *= -1; //make it positive
				}
				// make sure the answer is unique
				for (var i = 0; i < answers.length; i++){
					if ( answers[i].value === num ) {
						// if duplicate is found recursively call again
						return this.random(answers, distance);
					}
				}

				return num;
			},

			randomize_answers(){
				// console.log('randomize_answers() called');
				this.answers = [];
				//get the correct answer
				var correct = this.getAnswer();

				this.answers.push( { 
					value: correct,
					state: 'on', //valid, correct 
					iscorrect: true
				} );
				//get three other answers - random differences from the range
				while( this.answers.length < 4 ) {
					this.answers.push( { 
						value: this.notes[Math.floor(Math.random() * this.notes.length)],
						state: 'on',
						iscorrect: false
					} );

				}
				// console.table(answers);
				// make sure answers are unique
				// and randomize the answers
				this.answers.sort(function() { 
					return 0.5 - Math.random() 
				});
			},

			randomNumber(x){
				if (typeof x === 'undefined') { x = 10; }
				return Math.floor(Math.random() * x) + 1;
			},
			
			reset(){
				// console.log('start game:', this.mode);
				this.state = 'on';
				this.flipcard();
				this.errors = 0;
				this.valids = 0;
				this.answer_count = 0;
				this.answer_color = this.randomNumber(8);
				if ( this.mode === 'practice' ) {
					this.current_card = 0;
				} else {
					this.current_card = this.total_cards;
				}
				this.progressrecord = [];
				this.starttime = new Date();

				this.getRandomValues();

			},

			set_svg(data){
				// this.vrv_options = {
	   //              pageHeight: pageHeight,
	   //              pageWidth: pageWidth,
	   //              scale: zoom,
	   //              adjustPageHeight: 1,
	   //              ignoreLayout: 1
	   //          };
				this.svg = this.vrv.renderData(data);
			    // this.vrv.setOptions(this.vrv_options);
			},

			setDefaultRanges(){

				//set ranges based on operation
				switch(this.operation){
					case '+':
						this.actives = '0-10';
						this.passives = '0-10';
						break;
					case '-':
						this.actives = '10-20';
						this.passives = '0-10';
						break;
					case '×':
						this.actives = '0-12';
						this.passives = '0-12';
						break;
					case '÷':
						this.actives = '0-12';
						this.passives = '0-12';
						break;
					default:
						//just leave alone
						break;
				}
				this.setRanges();
			},

			setRanges(){
				//set ranges based on values of the select lists for active and passive numbers
				//active split
				let vals = this.actives.split('-');
				this.active_min = parseInt( vals[0] );
				this.active_max = parseInt( vals[1] );

				vals = this.passives.split('-');
				this.passive_min = parseInt( vals[0] );
				this.passive_max = parseInt( vals[1] );
			},

			toggleinfomode(){
				this.infomode = !this.infomode;
			},
			
		},

		watch: {
			
			logs: function(){
				localStorage.setItem('logs', JSON.stringify(this.logs));
			},

			state: function(){
				// console.log('state changed to', this.state);
			},
			
			card_timeout: function(){
				// console.log('card_timeout changed to', this.card_timeout);
			},

		},

		filters: {

			relativetime: function(time){
				return moment(time).fromNow();
			}

		},

		computed: {
			
			grade(){
				var average = Math.round(this.valids / this.answer_count * 100);
				if ( isNaN(average) ) average = '0';
				return average;
			},

		},

		mounted(){
			//create the vervio toolkit
			this.vrv = new verovio.toolkit();

			this.reset();

		}

	});