ErrorChecking = (function(){


	function hasWhiteSpace(s) {
	  return s.indexOf(' ') >= 0;
	}

	function isLongerThanXChars(s, num){
		return(s.length > num);
	}

	function isNotLongerThanXChars(s, num){
		return(s.length < num);
	}

	function onlyHasCharsAndDigits(s){
		var Regx = /^[A-Za-z0-9]*$/;
     	return(Regx.test(s));
	}

	function onlyHasChars(s){
		var Regx = /^[A-Za-z]*$/;
     	return(Regx.test(s));
	}
	function isEmailFormat(s){
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return(filter.test(s));
	}
	function isOkDateFormat(s){
		var matches = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/.exec(s);
		var matches1 = /^(\d{4})[-\/](\d{2})[-\/](\d{1})$/.exec(s);
		var matches2 = /^(\d{4})[-\/](\d{1})[-\/](\d{2})$/.exec(s);
		var matches3 = /^(\d{4})[-\/](\d{1})[-\/](\d{1})$/.exec(s);

    	return(matches != null || matches1 != null || matches2 != null || matches3 != null);
	}

	return{
		isOkUsername: function (username){
			if(username != undefined){
				return(!hasWhiteSpace(username) 
					&& isLongerThanXChars(username, 3)
					&& onlyHasCharsAndDigits(username)
					&& isNotLongerThanXChars(username,15));
			} else{
				return false;
			}
		},
		isOkName: function (name){
			if(name != undefined){
				return( 
					   isLongerThanXChars(name, 1)
					&& onlyHasChars(name)
					&& isNotLongerThanXChars(name,20));
			} else{
				return false;
			}
		},
		isOkEmail: function (email){
			if(email != undefined){
				return( 
					   isLongerThanXChars(email, 6)
					&& isEmailFormat(email)
					&& isNotLongerThanXChars(email,40));
			} else{
				return false;
			}
		},
		isOkCountry: function (name){
			if(name != undefined){
				return( 
					   isLongerThanXChars(name, 2)
					&& isNotLongerThanXChars(name,30));
			} else{
				return false;
			}
		},
		isOkDate: function (date){
			if(date != undefined){
				return( 
					   isLongerThanXChars(date, 7)
					&& isNotLongerThanXChars(date,11)
					&& isOkDateFormat(date));
			} else{
				return false;
			}
		}

	}
})();