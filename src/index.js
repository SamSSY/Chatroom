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
    username : null
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
    		console.log("!!!!!!");
    		console.log(data);
    		const {messages} = this.state;
    		console.log(this.state);
    		messages.push(data.message);
    		//messages.push(data);
    		this.setState({messages: messages});
    	}.bind(this));
    }


	renderMessages(content, index){
    	return(
    		<div className = "messages" key={index}>
    			{content}
    		</div>
    	);

    	/*
		
		return(
    		<div className = "messages" key={index}>
    			{{content.username} + ":" + {content.message}}
    		</div>
    	);

    	*/
    }

	_handleInputChange(){
		console.log("change");
	}

	_handleEnterKeyDown(){
		const {messages} = this.state;
		console.log(this.state.messages);
		console.log("enter key down!");
		let text = this.refs.textInput.getValue();
		console.log('user input: ' + text);
		this.refs.textInput.clearValue();
		messages.push(text);
		this.setState({ messages: messages});
		socket.emit('new message', text);
		//socket.emit('new message', {"message": text, "username": username});

	}

	_handleLogin(){
		this.refs.loginDialog.show();
	}

	_onDialogSubmit(){
		let username = this.refs.userNameInput.getValue();
		this.setState({username: username});
		console.log(this.state.username);
	}

	_handleLoginEnterKeyDown(){
		let username = this.refs.userNameInput.getValue();
		this.setState({username: username});
		console.log(this.state.username);
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
				</Dialog>

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