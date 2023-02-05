//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    ejs = require( 'ejs' ),
    { Configuration, OpenAIApi } = require( 'openai' ),
    app = express();

var T2S = require( 'ibm-watson/text-to-speech/v1' );
var { IamAuthenticator } = require( 'ibm-watson/auth' );

require( 'dotenv' ).config();

//. env values
var settings_apikey = 'API_KEY' in process.env ? process.env.API_KEY : ''; 
var settings_organization = 'ORGANIZATION' in process.env ? process.env.ORGANIZATION : ''; 
var settings_port = 'PORT' in process.env ? process.env.PORT : 8080; 
var settings_cors = 'CORS' in process.env ? process.env.CORS : ''; 
var settings_t2s_apikey = 'T2S_API_KEY' in process.env ? process.env.T2S_API_KEY : ''; 
var settings_t2s_url = 'T2S_URL' in process.env ? process.env.T2S_URL : ''; 
var settings_t2s_lang = 'T2S_LANG' in process.env ? process.env.T2S_LANG : 'ja-JP_EmiVoice'; 

app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.all( '/*', function( req, res, next ){
  if( settings_cors ){
    var origin = req.headers.origin;
    if( origin ){
      var cors = settings_cors.split( " " ).join( "" ).split( "," );

      //. cors = [ "*" ] への対応が必要
      if( cors.indexOf( '*' ) > -1 ){
        res.setHeader( 'Access-Control-Allow-Origin', '*' );
        res.setHeader( 'Vary', 'Origin' );
      }else{
        if( cors.indexOf( origin ) > -1 ){
          res.setHeader( 'Access-Control-Allow-Origin', origin );
          res.setHeader( 'Vary', 'Origin' );
        }
      }
    }
  }
  next();
});

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

var configuration = new Configuration({ apiKey: settings_apikey, organization: settings_organization });
var openai = new OpenAIApi( configuration );
/*
app.post( '/api/image', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var n = ( req.body.n ? parseInt( req.body.n ) : 1 );
  var size = ( req.body.size ? req.body.size : '256x256' );
  var format = ( req.body.format ? req.body.format : 'url' );  //. response_format
  var prompt = req.body.prompt;

  var option = {
    prompt: prompt,
    n: n,
    size: size,
    response_format: format
  };

  var result = await openai.createImage( option );
  //console.log( result.data );
  //result.data.data[i].b64_json = "iVBORw0...";
  //. "data:image/png;base64," を付けると <img src="xx" に使える

  res.write( JSON.stringify( { status: true, result: result['data']['data'] }, null, 2 ) );
  res.end();
});
*/

//. 結果の最初のフレーズがこの長さ以下だったら無視する
var settings_ignore_phrase = 'IGNORE_PHRASE' in process.env ? parseInt( process.env.IGNORE_PHRASE ) : 10; 

app.post( '/api/complete', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var model = ( req.body.model ? req.body.model : 'text-davinci-003' );
  var max_tokens = ( req.body.max_tokens ? parseInt( req.body.max_tokens ) : 4000 );
  var prompt = req.body.prompt;

  var option = {
    model: model,
    prompt: prompt,
    max_tokens: max_tokens
  };
  if( req.body.temperature ){
    option.temperature = parseFloat( req.body.temperature );
  }
  if( req.body.top_p ){
    option.top_p = parseFloat( req.body.top_p );
  }
  if( req.body.n ){
    option.n = parseInt( req.body.n );
  }

  var result = await openai.createCompletion( option );
  var answer = result.data.choices[0].text;

  //. 最初の "\n\n" 以降が正しい回答？
  var tmp = answer.split( "\n\n" );
  if( tmp.length > 1 && tmp[0].length < settings_ignore_phrase ){
    tmp.shift();
    answer = tmp.join( "\n\n" );
  }

  res.write( JSON.stringify( { status: true, result: answer }, null, 2 ) );
  res.end();
});

//. Text to Speech
var t2s = new T2S({
  authenticator: new IamAuthenticator({ apikey: settings_t2s_apikey }),
  version: '2018-05-01',
  serviceUrl: settings_t2s_url
});
app.get( '/api/t2s', function( req, res ){
  //. https://www.ibm.com/watson/developercloud/text-to-speech/api/v1/?node#synthesize_audio
  var text = req.query.text;
  var voice = 'ja-JP_EmiVoice';

  var params = {
    text: text,
    accept: 'audio/wav',
    voice: voice
  };

  if( t2s ){
    t2s.synthesize( params )
    .then( response => {
      return t2s.repairWavHeaderStream( response.result );
    }).then( buffer => {
      res.writeHead( 200, { 'Content-Type': 'audio/wav' } );
      res.write( buffer );
      res.end();
    });
  }
});

app.listen( settings_port );
console.log( "server starting on " + settings_port + " ..." );
