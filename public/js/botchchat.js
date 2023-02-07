var flag_speech = 0;

function vr_function(){
  $('#start_btn').removeClass( 'btn-primary' );
  $('#start_btn').addClass( 'btn-danger' );
  $('#start_btn').val( '■' );
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition(); //webkitSpeechRecognition();
  recognition.lang = 'ja';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onsoundstart = function(){
    $('#status').val( '認識中' );
  };
  recognition.onnomatch = function(){
    $('#status').val( 'もう一度試してください' );
  };
  recognition.onerror = function(){
    $('#status').val( 'エラー' );
    if( flag_speech == 0 ){
      vr_function();
    }
  };
  recognition.onsoundend = function(){
    $('#status').val( '停止中' );
    ///vr_function();
  };

  recognition.onresult = function( event ){
    var results = event.results;
    for( var i = event.resultIndex; i < results.length; i++ ){
      if( results[i].isFinal ){
        var text = results[i][0].transcript;
        $('#result_text').val( '' );
        $('#result_texts').html( '<div class="balloon-l">' + text + '</div>' );
        $('#result_text').css( 'display', 'none' );
        openAiChat( text );
      }else{
        $('#result_text').css( 'display', 'block' );
        $('#result_text').val( "[途中経過] " + results[i][0].transcript );
        flag_speech = 1;
      }
    }
  }
  flag_speech = 0;
  $('#status').val( "start" );
  recognition.start();
}

function openAiChat( prompt ){
  $('#result_text').css( 'display', 'none' );
  var obj = getBusyOverlay( 'viewport', { color:'black', opacity:0.5, text:'thinking..', style:'text-decoration:blink;font-weight:bold;font-size:12px;color:white' } );
  $.ajax({
    type: 'POST',
    url: '/api/complete',
    data: { prompt: prompt },
    success: function( result ){
      obj.remove();
      obj = null;
      //console.log( { result } );
      if( result && result.status ){
        var text = result.result;
        if( text ){
          $('#result_texts').append( '<div class="balloon-r">' + text + '</div>' );
          speechText( text );
        }
      }
    },
    error: function( e0, e1, e2 ){
      $('#result_text').css( 'display', 'block' );
      obj.remove();
      obj = null;
      console.log( e0, e1, e2 );
    }
  })
}

$(function(){
});

var uttr = null;

function speechText( text ){
  //$('#sample_speech').attr( 'src', '/api/t2s?text=' + text );
  //. https://web-creates.com/code/js-web-speech-api/
  if( 'speechSynthesis' in window ){
    var voices = window.speechSynthesis.getVoices();
    //console.log( { voices } );

    uttr = new SpeechSynthesisUtterance();
    uttr.text = text;
    uttr.lang = 'ja-JP';

    window.speechSynthesis.speak( uttr );
    uttr.onend = speechEnd;
  }else{
    alert( 'このブラウザは Web Speech API に未対応です。')
  }
}

function speechEnd( evt ){
  //console.log( {evt} );
  vr_function();
}
