# AI Foundry Library

Simplify your AI Foundry prompting!

## Introduction

This library can be used in combination with Data Foundry, and was created to simplify designing with AI. It takes different AI models available in Data Foundry, and makes those accessible using often just one line. Asyncronous coding is applied to easily be able to combine different functions and create more complex design opportunities.

This library was developed by Jort Wiersma, coached by Mathias Funk, at the Department of Industrial Design at Eindhoven University of Technology.

## How to install

First, dowload the library (choose either the regular or the minified version). Then, place the file inside of the folder where you HTML file is hosted. Inside of your HTML file, in the head element, create a script-tag that refers to the library file. E.g. <script src="./AI_Foundry_Library.js"></script>

## How to use

Five functions are available to make AI requests. Before being able to make such requests, an API key must be created inside of Data Foundry. Each function in this library requires this API key. Other inputs are optional to change the AI functionality. All function parameters must be placed in an object. E.g. foundry.textToText({inputKey: 'df-abcde...=', userPrompt: 'Can you tell me about Eindhoven?'}). Below, you will find all available functions and their possible parameters.

### Functions

#### foundry.textToText()

Function to make requests to text-to-text models. Parameters:

- inputKey: Data Foundry API Key
- model: Chosen AI model. Default model applies
- userPrompt: Main prompt
- systemPrompt: System prompt
- temperature: (default = 0.9)
- maxTokens: (default = 250)
- noLogging: (default = false)
- rememberMessages: (default = 0) The amount of messages that will be saved in chat history
- loadingIndicatorId: Id of HTML element that will be given a loading indicator attribute
- resultElementId: ID of HTML element that will be used to place AI response in

The message history can be accessed through the foundry.messageHistory variable. This can be used for more complex cases such as automatic chat summarization.

#### foundry.textToImage()

Function to make requests to text-to-image models. Parameters:

- inputKey: Data Foundry API Key
- userPrompt: Main prompt
- temperature: (default = 0.9)
- noLogging: (default = false)
- loadingIndicatorId: Id of HTML element that will be given a loading indicator attribute
- resultElementId: ID of HTML element that will be used to place AI response in
- steps: (default = 20) Image generation steps
- width: (default = 512) Image width
- height: (default = 512) Image height

#### foundry.textToSound()

Coming soon. In case of dire need: there is a text-to-speech API available in Data Foundry, although the result will sound robotic.

#### foundry.imageToText()

Function to make requests to image-to-text models. Images can be provided in the prompt (using an online image URL or file path) or can be automatically asked to be uploaded by the user by setting popup to true. Parameters:

- inputKey: Data Foundry API Key
- model: Chosen AI model. Default model applies
- userPrompt: Main prompt
- systemPrompt: System prompt
- image: Image file that will be sent to the AI. Image files selected from an HTML input and online image URLs both work. This variable is required as long as popup is not set to true.
- popup: (default = false) Setting this to true will automatically ask the user for an image.
- temperature: (default = 0.9)
- maxTokens: (default = 250)
- noLogging: (default = false)
- loadingIndicatorId: Id of HTML element that will be given a loading indicator attribute
- resultElementId: ID of HTML element that will be used to place AI response in

#### foundry.soundToText()

Function to make requests to sound-to-text models. Three types are available: file, record, and popup. The file type will transcribe the provided audio file. The record type will record audio and transcribe this live. The popup type will automatically ask for the user to upload an audio file that will be transcribed. Parameters:

- inputKey: Data Foundry API Key
- type: (default = file) Choose between three types: 'file', 'record', or 'popup'. 'file' will transcribe the provided audio file. 'record' will record audio and transcribe this live. 'popup' will automatically ask for the user to upload an audio file that will be transcribed
- sliceDuration: (default = 5000) Duration in miliseconds of transcription slices. Only relevant if type is set to 'record'. If so, a new piece of transcription will become available repeatedly at intervals of the set duration. Highter sliceDurations will give better results, but lower speeds.
- file: Audio file that will be transcribed. Only required if type is set to 'file'
- loadingIndicatorId: Id of HTML element that will be given a loading indicator attribute when the AI is working
- resultElementId: ID of HTML element that will be used to place AI response in
- noLogging: (default = false)
- stopRec: (default = false) If audio is being recorded, pass the same function with stopRec set to true to stop the recording.

### Variables

#### foundry.messageHistory

The message history can be accessed through the foundry.messageHistory variable. This can be used for more complex cases such as automatic chat summarization.
