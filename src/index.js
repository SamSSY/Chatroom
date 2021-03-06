//require('babel-core/polyfill');

const React = require('react');
const { render } = require('react-dom');

// material-ui
const RaisedButton = require('material-ui/lib/raised-button');
const Dialog = require('material-ui/lib/dialog');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const AppBar = require('material-ui/lib/app-bar');
const TextField = require('material-ui/lib/text-field');
const FlatButton = require('material-ui/lib/flat-button');
const Snackbar = require('material-ui/lib/snackbar');
const Avatar = require('material-ui/lib/avatar');

const injectTapEventPlugin = require('react-tap-event-plugin');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const io = require('socket.io-client');
const socket = io.connect();


require('./main.scss');

const initialState = {
    muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
    currentIndex : 0,
    messages : [],
    propValue : null,
    username : null,
    userID: null,
    autoHideDuration: 1000,
    userProfilePicUrl: null
}


class ChatBody extends React.Component {
    
    constructor(props) {
        super(props);
        this.state= initialState;
    }

    getChildContext() {
        return {
          muiTheme: this.state.muiTheme,
        };
    }

    componentWillMount() {

        let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
            accent1Color: Colors.deepOrange500,
        });

        this.setState({muiTheme: newMuiTheme});
    }

    componentDidMount(){

    	socket.on('new message', function (data) {
    		console.log(data);
    		const {messages} = this.state;
    		console.log(this.state);
    		messages.push(data);
    		// message { message, username }
    		this.setState({messages: messages});
    	}.bind(this));


    	  window.fbAsyncInit = function() {
		    FB.init({
		      appId      : 1057383754306127,
		      cookie     : true,  // enable cookies to allow the server to access the session 1057383754306127/ 1521012484886298
		      xfbml      : true,  // parse social plugins on this page
		      version    : 'v2.5' // use version 2.5
		    });

		    // Now that we've initialized the JavaScript SDK, we call
		    // FB.getLoginStatus().  This function gets the state of the
		    // person visiting this page and can return one of three states to
		    // the callback you provide.  They can be:
		    //
		    // 1. Logged into your app ('connected')
		    // 2. Logged into Facebook, but not your app ('not_authorized')
		    // 3. Not logged into Facebook and can't tell if they are logged into
		    //    your app or not.
		    //
		    // These three cases are handled in the callback function.
		    FB.getLoginStatus(function(response) {
		      console.log("first check");
		      this.statusChangeCallback(response);
		    }.bind(this));

		    //listen to login event
		FB.Event.subscribe('auth.login', function(r) {
	        console.log(r.status);
	       		if ( r.status === 'connected' ){
	            	// a user has logged in
	            	console.log("login! ");
	            	this.checkLoginState();
	            	this._getUserProfilePic();
	        	}
	    	}.bind(this)
		);
	}.bind(this);

		  // Load the SDK asynchronously
		  (function(d, s, id) {
		    var js, fjs = d.getElementsByTagName(s)[0];
		    if (d.getElementById(id)) return;
		    js = d.createElement(s); js.id = id;
		    js.src = "//connect.facebook.net/en_US/sdk.js";
		    fjs.parentNode.insertBefore(js, fjs);
		  }(document, 'script', 'facebook-jssdk'));

    }

    testAPI() {
	  	console.log('Welcome!  Fetching your information.... ');
	  	FB.api('/me', function(response) {
	  		console.log(response);
	  		console.log('Successful login for: ' + response.name + " id: " + response.id);
	  		this.setState({username: response.name, userID: response.id});
	  		this._getUserProfilePic();

		}.bind(this));
	}
	// This is called with the results from from FB.getLoginStatus().
	statusChangeCallback(response) {
	  	console.log('statusChangeCallback');
	 	console.log(response);
	  	// The response object is returned with a status field that lets the
	  	// app know the current login status of the person.
	  	// Full docs on the response object can be found in the documentation
	  	// for FB.getLoginStatus().
		if (response.status === 'connected') {
		    // Logged into your app and Facebook.
		    this.testAPI();
	  	  	this.refs.loginDialog.dismiss();
	  	  	this._getUserProfilePic();


		} else if (response.status === 'not_authorized') {
		  	console.log("user not authorized.");
		} else {
		    // The person is not logged into Facebook, so we're not sure if
		    // they are logged into this app or not.
		    console.log("something wrong. ");
		}
	}

	checkLoginState(){
	  console.log("checkLoginState.");
	  FB.getLoginStatus(function(response) {
	    this.statusChangeCallback(response);
	  }.bind(this));
	}

	handleFBLoginButtonClick() {
	  FB.login(this.checkLoginState());
	}

	renderMessages(content, index){

    	var str = `${content.username} : ${content.message}` ;	
    	if( this.state.userProfilePicUrl == null){
    		this._getUserProfilePic();
    	}
    	this._updateScroll();

		return(
    		<div className = "messagesContainer" key={index}>
    			<Avatar className = "userProfilePic"  src={content.userPicUrl} />
    			<div className = "messages">
    				{str}
    			</div>
    		</div>
    	);
    }

	_handleInputChange(){
		console.log("change!");
	}

	_handleEnterKeyDown(){
		const {messages} = this.state;
		console.log(this.state.messages);
		console.log("enter key down!");
		if( this.state.userProfilePicUrl == null){
    		this._getUserProfilePic();
    	}
		if( this._userLoginCheck()){
			let text = this.refs.textInput.getValue();
			console.log('user input: ' + text);
			this.refs.textInput.clearValue();
			// message { message, username }
			messages.push({"message": text, "username": this.state.username, "userPicUrl": this.state.userProfilePicUrl});
			this.setState({ messages: messages});
			socket.emit('new message', {"message": text, "username": this.state.username, "userPicUrl": this.state.userProfilePicUrl});
		}
	}

	_handleLogin(){
		this.refs.loginDialog.show();
	}

	_onDialogSubmit(){
		let username = this.refs.userNameInput.getValue();
		this.setState({username: username});
		//TODO: define callback function
		this.refs.loginDialog.dismiss();
	}

	_handleLoginEnterKeyDown(){
		let username = this.refs.userNameInput.getValue();
		this.setState({username: username});
		console.log(this.state.username);
		//TODO: define callback function
		this.refs.loginDialog.dismiss();
	}

	_handleAction(){

	}

	_userLoginCheck(){
		if( this.state.username == null){
			this.refs.UserLoginAlert.show();
			return false;
		} 
		else return true;
	}

	_getUserProfilePic(){

		console.log("getUserProfilePic");
		let queryStr = `/${this.state.userID}/picture`;
		console.log(queryStr);
		// API call
		FB.api(queryStr, function (response) {
		      if (response && !response.error) {
				    //console.log(response);
		     		this.setState({userProfilePicUrl: response.data.url});
		      }
		    }.bind(this)
		);
	}

	renderUserLoginAlertSnackBar () {
		console.log("renderUserLoginAlertSnackBar");
		if(this.state.messages.length > 0) setTimeout(this._updateScroll, 500); 
		return(
			<Snackbar
			  message="Please login first."
			  ref="UserLoginAlert"
			  autoHideDuration={this.state.autoHideDuration}
			  onActionTouchTap={this._handleAction}/>
		);
	}

	_updateScroll(){
			//$(".messageBody").animate({scrollTop : $(".messageBody")[0].scrollHeight}, 300) ;
			//$(".messageBody").scrollTop($(".messageBody")[0].scrollHeight) ;
			$(".messageBody")[0].scrollTop = $(".messageBody")[0].scrollHeight;
	}

    render() {
    	const {messages} = this.state;
    	//Standard Actions
		const standardActions = [
		  { text: 'Cancel' },
		  { text: 'Submit', onTouchTap: this._onDialogSubmit.bind(this), ref: 'submit' }
		];

        return (
            <div className="mainBody">
            	<div>
                    <AppBar
                      title="Chatroom" 
                       iconElementRight={<FlatButton label="Login" onTouchTap={this._handleLogin.bind(this)} />} /> 
                </div>

                <div className="messageBody">
                	{messages.map(this.renderMessages,this)}
                </div>

				<Dialog
				  title="User Login"
				  actions={standardActions}
				  ref="loginDialog" >
				  <TextField hintText="Your name" ref="userNameInput" onEnterKeyDown = {this._handleLoginEnterKeyDown.bind(this)}/>
				  <p>Or</p>
				  <RaisedButton label="Login with Facebook" style={{'marginTop': '15px'}} secondary={true} onTouchTap={this.handleFBLoginButtonClick.bind(this)} />

				</Dialog>

				{this.renderUserLoginAlertSnackBar()}

                <div className="messageInput">
                	<TextField 
                	  ref = "textInput" 
					  hintText="Say something..." 
					  fullWidth = {true}     
					  rows = {2}    
					  underlineStyle={{borderColor:Colors.green500}}
					  onChange={this._handleInputChange}  
					  onEnterKeyDown = {this._handleEnterKeyDown.bind(this)} />
				</div>	
            </div>
        );
    }
}

ChatBody.childContextTypes = {
    muiTheme: React.PropTypes.object,
}


render(<ChatBody />, document.getElementById('root'));