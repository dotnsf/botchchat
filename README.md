# Botch Chat


## Overview

マイクからの音声入力データを Web Speech API で取り出し、OpenAI API を使って独り言チャットを実現するサンプルアプリケーション。


## Setup

- ソースコードを取得する

  - `$ git clone https://github.com/dotnsf/botchchat`
  
  - `$ cd botchchat`

  - `$ npm install` 

- 以下２つの情報を取得する：

  - OpenAI のアカウントを取得し、API Key と Organization ID を取得する：

    - `https://beta.openai.com/`

- 取得した情報をソースコード内の `.env` ファイルに転記

- アプリケーションを起動

  - `$ npm start` 

- アプリケーションにアクセス

  - `http://localhost:8080/`

- 「ぼっちチャット開始」ボタンをクリックしてマイクに話しかける

  - ![サンプル](https://raw.githubusercontent.com/dotnsf/botchchat/main/public/imgs/sample.png)


## Reference

https://monomonotech.jp/kurage/iot/webspeechapi_voice_recognition.html

https://beta.openai.com/docs/api-reference?lang=node.js


## Licensing

This code is licensed under MIT.


## Copyright

2023  [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
