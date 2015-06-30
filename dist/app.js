(function() {
 
  return {
	  
	seconds : 0,
	minutes: 0,
	hours: 0,
	interval : false,
	that: this,
	
    events: {
      'app.activated':'fetchAgentData',
	  'click #pause' : 'pause',
	  'click #play' : 'play',
	  'click #restart' : 'restart'
    },
	
	requests : {
		
		//Zen Desk API to get users info
        getUserInfo: function(id) {
            return {
                url: '/api/v2/users/' + id + '.json',
                type: 'GET',
                dataType: 'json'
            };
        },
		
		pauseTimer: function() {
                return {
                    url: 'https://beta.totalsynergy.com/internalkpi/totalsynergy/summary/stopTimer?internal-token=' + this.synergyKey + "&note=" + this.note,
                    type: 'GET',
                    dataType: 'json'
                };
        },
		
		playTimer : function(){
			return {
                    //url: 'https://beta.totalsynergy.com/internalkpi/totalsynergy/summary/startTimer?internal-token=' + this.synergyKey + "&note=" + this.note,
                    url: 'https://beta.totalsynergy.com/internalkpi/totalsynergy/summary/startTimer?internal-token=' + this.synergyKey + '&note=' + this.note,
					type: 'GET',
                    dataType: 'json'
                };
		},
		
		//If timer does not exist it will create one
		getTimer : function(){ 
			return {
                    url: 'https://beta.totalsynergy.com/internalkpi/totalsynergy/summary/getTimer?internal-token=' + this.synergyKey + "&note=" + this.note,
                    type: 'GET',
                    dataType: 'json'
                };
		}
	}, 
	
	//Get the synergy Key - already put in through the synergy zen desk application
	fetchAgentData: function() {
		
		this.interval = false;
		
        this.ajax('getUserInfo', this.currentUser().id()).then(
            function(data) {

                var fields = data.user.user_fields;

                this.synergyKey = fields.synergy_5_user_key;
				
				console.log("Got key: " + this.synergyKey);
				
				this.initiateTimer();									
				
				this.display();

                },
                function(error) {
					console.log("Did Not fetch Agent Data");
                }
            );
        },
	
	//if this is the first time the application is open create new timer, otherwise get timer feed
	initiateTimer: function(){
		
		this.note = "Ticket ID " + this.ticket().id() + " Subject " + this.ticket().subject();
		
		console.log("Try with note: " + this.note);
		
		console.log("\n \n using key: " + this.synergyKey + "\n");
		
		console.log("Get Timer");
		
		var that = this;
		
		this.ajax('getTimer').then(
			function(success)
			{
				console.log("Got a successful timer message: " + JSON.stringify(success));	
				
				//if success worked
				if(success.data){
					
					console.log("We got a message!");
					
					var totalSeconds = success.data.duration;
					
					that.hours = parseInt( totalSeconds / 3600 );
					
					console.log("Total Hours = "  + this.hours);
					
					that.minutes = parseInt( totalSeconds / 60 ) % 60;
					
					console.log("Minutes = "  + this.minutes);
					
					that.seconds = totalSeconds % 60;
					
					//Change the text values
					//that.$('#seconds').text(function(){ return ("0" + that.seconds).slice(-2);});
					that.$('#minutes').text(function(){ return ("0" + that.minutes).slice(-2);});
					that.$('#hours').text(function(){ return ("0" + that.hours).slice(-2);});
					
					this.play();	
					
					//Start the interval to get data every 10 seconds
					this.startInterval();
				}				

			},
			function(error)
			{	
				console.log("Did not get watch man: " + JSON.stringify(error));
				//this.startWatch();
			}
		);	
	}, 
	
	play : function(){
		
		console.log("Play Hit!");
		
		//check if timer is already running
		//if(!this.interval){
			
		console.log("Note is =" + this.note);
			
			this.ajax('playTimer').then(
				function(success)
				{
					console.log("Timer Started!" + JSON.stringify(success));
					
					console.log("Seconds was: " + this.seconds);
					
					//Start the interval to get time every 10 seconds and update it

				},
				function(error)
				{
					console.log("Could Not stop Timer")
				}
			);			

		//}
				
		//Changes the button seen as active (grey) or not
		this.$("#play").addClass("activeButton");
		this.$('#pause').removeClass('activeButton');

	},

	pause : function(){
		
		console.log("Pause Hit!");
		
		if(this.interval){
			
			this.ajax('pauseTimer').then(
				function(success)
				{
					console.log("Successively paused: " + JSON.stringify(success));
					clearInterval(this.interval);
					this.interval = false;
				},
				function(error)
				{
					
				}
			);
			
		}
		
		this.$('#pause').addClass('activeButton');
		this.$("#play").removeClass("activeButton");
	},
	
	startInterval : function(){
		
		var that = this;
		
		//every 10 seconds get the time
		this.interval = setInterval(function(){
			
			that.play();
			
		}, 10000);
	},
	
	//currently redundant
	/*
	restart: function(){ 
		
		this.seconds = 0;
		this.minutes = 0;
		this.hours = 0;
		
		this.$('#seconds').text('00');
	    this.$('#minutes').text('00');
		this.$('#hours').text('00');		

	},
	*/

    display: function() {
				
		this.switchTo('timer');

    },
	
	/*
	increaseSeconds : function(){

		var that = this;
		
		this.interval = setInterval(function(){
			
			//Increase the seconds
			this.$('#seconds').text(function( i, oldNumber){
				
				console.log("Seconds is: " + that.seconds);
				if(that.seconds === 60){
					that.seconds = 0;
					that.increaseMinute();
				}
				else{
					that.seconds++;
				}
				
				//Add a zero the beginning to numbers 1-9
				return ("0" + that.seconds).slice(-2);
			});
		}, 1000);
	},
	
	
	increaseMinute : function(){
		
		var that = this;
		
		this.$('#minutes').text(function( i, oldNumber){
			
			console.log("Minutes is : " + that.minutes);
			if(that.minutes === 60){
				that.increaseHour(that);
				
				that.minutes = 0;
			}		
			else{
				that.minutes++;
			}
			
			//Add a zero the beginning to numbers 1-9
			return ("0" + that.minutes).slice(-2);
		});
	},
	
	increaseHour : function(){
		console.log("Increase Hour");
		
		var that = this;
		
		this.$('#hours').text(function( i, oldNumber){
			
			that.hours++;
			
			//Add a zero the beginning to numbers 1-9
			return ("0" + that.hours).slice(-2);
			
		});
	},
	*/
	
  };

}());
