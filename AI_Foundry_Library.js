const foundry = {
  textToText: async function ({
    inputKey,
    model = "hermes-2-pro-llama-3-8b",
    userPrompt,
    systemPrompt,
    temperature = 0.9,
    maxTokens = 250,
    noLogging = false,
    rememberMessages = 0,
    loadingIndicatorId,
    resultElementId,
  }) {
    if (!inputKey) {
      //Do not run the function when no API key is given
      console.error("No API key provided.");
      return;
    }

    if (!noLogging) {
      console.log("Running text-to-text function");
    }

    //Create message for request
    if (rememberMessages) {
      if (!noLogging) {
        console.log("Chat history is active.");
      }

      //Include the message history in the prompt
      let message = `React to the message based on this message history: ${JSON.stringify(
        foundry.messageHistory
      )}. Latest message: ${userPrompt}`;

      //Create a message for LocalAI
      messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ];
    } else {
      //When past messages are not remembered (rememberMessages = 0), the userPrompt will directly be passed in the message
      messages = [
        //Create a message for LocalAI
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ];
    }

    try {
      //Start the loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "true");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }
      //Send messages to LocalAI
      const response = await fetch(
        "https://data.id.tue.nl/v1/chat/completions",
        {
          method: "POST",
          cache: "no-cache",
          redirect: "manual",

          headers: {
            "Content-Type": "application/json",
            "User-Agent": "curl/8.7.1",
            Authorization: `Bearer ${inputKey}`,
          },
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            key: "value",
            api_token: inputKey,
            task: "chat",
            messages: messages,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
          }),
        }
      );

      //Wait for LocalAI response
      const json = await response.json();

      // json.content contains the generated chat response
      let chatResponse = json.choices[0].message.content;
      if (!noLogging) {
        console.log("Result:", chatResponse);
      }

      //Place result on the page
      if (resultElementId) {
        document.getElementById(resultElementId).innerHTML = chatResponse;
      }

      //Stop loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "false");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }

      if (rememberMessages) {
        //If specified that messages should be remembered
        foundry.messageHistory.push(
          { role: "user", content: userPrompt },
          { role: "assistant", content: chatResponse }
        );

        //remove older messages when the maximum amount of remembered messages is exceeded
        if (foundry.messageHistory.length > rememberMessages) {
          foundry.messageHistory.splice(0, 2);
        }
      }

      //Return the AI response
      return chatResponse;
    } catch (error) {
      console.error("Error:", error);
    }
  },
  textToImage: async function ({
    inputKey,
    userPrompt,
    temperature = 0.9,
    noLogging,
    loadingIndicatorId,
    resultElementId,
    steps = 20,
    width = 512,
    height = 512,
  }) {
    if (!noLogging) {
      console.log("Running text-to-image function");
    }
    //Do not run the function when no API key is given
    if (!inputKey) {
      console.error("No API key provided.");
      return;
    }

    try {
      //add loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "true");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }

      //Make AI request
      const response = await fetch(
        "https://data.id.tue.nl/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${inputKey}`,
          },
          body: JSON.stringify({
            prompt: userPrompt,
            steps: steps,
            width: width,
            height: height,
            temperature: temperature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!noLogging) {
        console.log("Generated image:", data["image_url"]);
      }

      //If a result element has been provided (which should be an <img> element, place the result)
      if (resultElementId) {
        document.getElementById(resultElementId).src = data["image_url"];
      }

      //Stop loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "false");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }

      //return the result
      return data["image_url"];
    } catch (error) {
      console.error(
        "There was a problem with the fetch operation:",
        error.message
      );
    }
  },
  textToSound: function () {
    console.log("Text to sound is currently not supported.");
  },
  imageToText: async function ({
    inputKey,
    model = "llava-llama-3-8b-v1_1",
    userPrompt,
    systemPrompt,
    image,
    popup = false,
    temperature = 0.9,
    maxTokens = 250,
    noLogging = false,
    loadingIndicatorId,
    resultElementId,
  }) {
    if (!inputKey) {
      //Do not run the function when no API key has been provided
      console.error("No API key provided.");
      return;
    }

    if (!noLogging) {
      console.log("Running image-to-text function");
    }

    //if image prompt type is set to popup, ask for an image upload by the user
    if (popup) {
      //Create a hidden input element, required for file uploads
      if (!document.getElementById("df_fileInput")) {
        document.body.innerHTML += `<input type="file" id="df_fileInput" accept="image/*" style="display: none;" onchange=""></input>`;
      }
      //Activate the file input. The user will be asked to upload an image
      document.getElementById("df_fileInput").click();

      //Wait for the processed image
      try {
        //Wait for the file selection and image processing result
        image = await df_waitForFileSelection(noLogging);
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else image = await df_processImage(image);

    messages = [
      //Create a message for LocalAI
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: image },
          },
        ],
      },
    ];

    try {
      //Start the loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "true");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }
      //Send messages to LocalAI
      const response = await fetch(
        "https://data.id.tue.nl/v1/chat/completions",
        {
          method: "POST",
          cache: "no-cache",
          redirect: "manual",

          headers: {
            "Content-Type": "application/json",
            "User-Agent": "curl/8.7.1",
            Authorization: `Bearer ${inputKey}`,
          },
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            key: "value",
            api_token: inputKey,
            task: "chat",
            messages: messages,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
          }),
        }
      );

      //Wait for LocalAI response
      const json = await response.json();

      // json.content contains the generated chat response
      let chatResponse = json.choices[0].message.content;

      if (!noLogging) {
        console.log("Result:", chatResponse);
      }

      //Place result on the page
      if (resultElementId) {
        document.getElementById(resultElementId).innerHTML = chatResponse;
      }

      //Stop loading indicator
      if (loadingIndicatorId) {
        if (document.getElementById(loadingIndicatorId)) {
          document
            .getElementById(loadingIndicatorId)
            .setAttribute("aria-busy", "false");
        } else {
          console.error("Element selected for loading indicator not found");
        }
      }

      //Return the AI response
      return chatResponse;
    } catch (error) {
      console.error("Error:", error);
    }

    function df_waitForFileSelection() {
      return new Promise((resolve, reject) => {
        const fileInput = document.getElementById("df_fileInput");

        //Check if file input exists
        if (!fileInput) {
          reject(new Error("File input element not found"));
          return;
        }

        //Event listener for file selection
        fileInput.onchange = async function (event) {
          const files = event.target.files;

          if (files && files.length > 0) {
            const selectedFile = files[0];
            if (!noLogging) {
              console.log("File selected:", selectedFile);
            }

            //Call df_processImage() when the file has been selected
            try {
              image = await df_processImage(selectedFile, noLogging);
              resolve(image); //Resolve the Promise with the processed image
            } catch (error) {
              reject(new Error("Error during image processing"));
            }
          } else {
            reject(new Error("No file selected"));
          }
        };
      });
    }
    function df_processImage(source) {
      return new Promise((resolve, reject) => {
        //if the source is a File (Blob), use FileReader
        if (source instanceof File) {
          const reader = new FileReader();

          reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
              df_processImageLogic(img, noLogging).then(resolve);
            };

            img.onerror = function () {
              reject(new Error("Error loading image from file"));
            };
          };

          reader.onerror = function () {
            reject(new Error("Error reading the image file"));
          };

          //Start reading the file as a Data URL
          reader.readAsDataURL(source);
        }
        //if the source is a URL, directly process the image
        else if (typeof source === "string") {
          const img = new Image();
          img.crossOrigin = "Anonymous"; //Handle CORS if necessary
          img.src = source;

          img.onload = function () {
            df_processImageLogic(img, noLogging).then(resolve);
          };

          img.onerror = function () {
            reject(new Error("Error loading image from URL"));
          };
        } else {
          reject(new Error("Invalid image source"));
        }
      });
    }
    function df_processImageLogic(img) {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        //Reduce the image size
        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        //Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height); //Draw the image onto the canvas

        // Get the data URL
        const processedImage = canvas.toDataURL("image/jpeg", 0.5); //0.5 reduces image quality to decrease the prompt length
        if (!noLogging) {
          console.log("Image processed.");
        }
        resolve(processedImage);
      });
    }
  },
  soundToText: async function ({
    inputKey,
    type = "file", //'file' or 'record' or 'popup'
    sliceDuration = 5000, //miliseconds
    file, //The audio file that needs to be transcribed
    resultElementId, //Element that will be used to place the result on the page
    loadingIndicatorId, //Element that will be given a loading indicator attribute when the AI is working
    noLogging, //Set to true to remove console logging
    stopRec = false, //In order to stop the recording, pass isRecording = true
  }) {
    if (!inputKey) {
      //Do not run the function when no API key has been provided
      console.error("No API key provided.");
      return;
    }

    //If the function is instructed to stop recording, do so and return a transcription of the complete recording
    if (stopRec) {
      let res = await stopRecording();
      return res;
    }

    //Variable that will get larger each time a new part of the recording is created. How often this happens depends on the sliceDuration
    let transcription = "";

    //In record mode, start the recording
    if (type === "record") {
      startRecording();
    }

    //In popup mode, create a popup that will ask for an audio file upload
    if (type === "popup") {
      //Create a hidden input element, required for file uploads
      if (!document.getElementById("df_audioFileInput")) {
        document.body.innerHTML += `<input type="file" id="df_audioFileInput" accept="audio/*" style="display: none;" onchange=""></input>`;
      }
      //Activate the file input. The user will be asked to upload an image
      document.getElementById("df_audioFileInput").click();

      //Wait for the audio file upload
      try {
        //wait for the file selection and image processing result
        let file = await df_waitForAudioFileSelection();
        return await df_transcribe({
          inputKey: inputKey,
          file: file,
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    }

    //In file mode, transcribe the provided file without a popup. Can be used if file selection needs to be handled differently.
    if (type === "file") {
      return await df_transcribe({
        inputKey: inputKey,
        file: file,
      });
    }

    //Helper functions

    function startRecording() {
      //Use RecordRTC library to handle microphone recordings
      //First, check if RecordRTC is present, otherwise add this library to the page using a CDN link HTML element
      loadRecordRTC(function () {
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then(function (stream) {
            recordAudio = RecordRTC(stream, {
              type: "audio",
              mimeType: "audio/webm",
              sampleRate: 44100,
              recorderType: StereoAudioRecorder,
              numberOfAudioChannels: 1,
              desiredSampRate: 16000,
              timeSlice: sliceDuration, //Duration of time slices (miliseconds) of transcriptions
              disableLogs: noLogging, //Disable logging is noLogging is set to true

              ondataavailable: async function (blob) {
                //Add the result to transcription variable
                transcription += await df_transcribe({
                  inputKey: inputKey,
                  file: blob,
                });

                if (!noLogging) {
                  console.log("Transcription:", transcription); //Log the transcription
                }

                //Place resulting transcription on the page
                if (resultElementId) {
                  document.getElementById(resultElementId).innerHTML =
                    transcription;
                }
              },
            });
            recordAudio.startRecording();
          })
          .catch((err) => {
            // always check for errors at the end.
            console.error(`${err.name}: ${err.message}`);
          });
      });
    }

    //Function to stop recording and create a new transcription of the complete recording instead of using slices
    async function stopRecording() {
      return new Promise((resolve) => {
        recordAudio.stopRecording(async function () {
          var blob = recordAudio.getBlob();

          let completeTranscription = await df_transcribe({
            inputKey: inputKey,
            file: blob,
            type: "file",
          });
          //Place result on screen
          if (resultElementId) {
            document.getElementById(resultElementId).innerHTML =
              completeTranscription;
          }
          resolve(completeTranscription);
        });
      });
    }
    //This function is used to transcribe audio. It will return text.
    async function df_transcribe({ model = "whisper-base", file }) {
      //Create FormData object and append the file and other parameters
      const formData = new FormData();
      formData.append("model", model); //Add model
      formData.append("file", file); //Add uploaded or provided file

      try {
        //Add loading indicator
        if (loadingIndicatorId) {
          if (document.getElementById(loadingIndicatorId)) {
            document
              .getElementById(loadingIndicatorId)
              .setAttribute("aria-busy", "true");
          } else {
            console.error("Element selected for loading indicator not found");
          }
        }
        //Make request
        const response = await fetch(
          "https://data.id.tue.nl/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${inputKey}`,
            },
            body: formData,
          }
        );
        const result = await response.json(); //It may occur that the reponsonse is not perfect json, leading to errors
        if (!noLogging) {
          //log result
          console.log("Result:", result.text);
        }

        //Remove loading indicator
        if (loadingIndicatorId) {
          if (document.getElementById(loadingIndicatorId)) {
            document
              .getElementById(loadingIndicatorId)
              .setAttribute("aria-busy", "false");
          } else {
            console.error("Element selected for loading indicator not found");
          }
        }

        //return result
        return result.text;
      } catch (error) {
        console.error(error.message);
      }
    }

    //In order to make use of the RecordRTC library, check if this library is available, and add it if that is not the case. Then, use RecordRTC functionality
    function loadRecordRTC(callback) {
      // Check if RecordRTC is already available
      if (typeof RecordRTC !== "undefined") {
        if (!noLogging) {
          console.log("RecordRTC is already loaded.");
        }
        callback(); //If loaded, run the callback
      } else {
        if (!noLogging) {
          console.log("RecordRTC is not loaded, adding script to the page.");
        }
        //Create a script element to load RecordRTC from CDN
        var script = document.createElement("script");
        script.src = "https://cdn.webrtc-experiment.com/RecordRTC.js";
        script.async = true;

        //Set up callback when the script is loaded
        script.onload = function () {
          if (!noLogging) {
            console.log("RecordRTC has been loaded.");
          }
          callback();
        };

        //Append script to the head of the document
        document.head.appendChild(script);
      }
    }

    //Helper function that waits for the selection of an audio file when popup mode is selected
    function df_waitForAudioFileSelection() {
      return new Promise((resolve, reject) => {
        const fileInput = document.getElementById("df_audioFileInput");

        //Check if file input exists
        if (!fileInput) {
          reject(new Error("File input element not found"));
          return;
        }

        //Event listener for file selection
        fileInput.onchange = async function (event) {
          const files = event.target.files;

          if (files && files.length > 0) {
            const selectedFile = files[0];
            if (!noLogging) {
              console.log("File selected:", selectedFile);
            }
            //Continue transcription when file becomes available
            try {
              resolve(selectedFile);
            } catch (error) {
              reject(new Error("Error during image processing"));
            }
          } else {
            reject(new Error("No file selected"));
          }
        };
      });
    }
  },
  messageHistory: [],
};
