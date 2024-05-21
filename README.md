# Gemini Profiling Test Code

This is a node.js file that I used to profile Gemini performance.
The goal was to measure the latency between when the request was sent and when the first token arrived in response. 

It depends on the google vertex AI library for Node.js, so run
```
npm i
```
to install the dependencies, then run
```
npm start
```
to run the profiling script. 



To take the measurement, I grab the current time in ms Just before I send the request to Gemini
to produce an inference on a text prompt.
Then, I take a time measurement once the first chunk arrives to determine the latency.


## Adjusting the profiling
Using the loops in the `testGemini()` function you can adjust how many documents are added to the prompt, and how many times to run each number of documents for testing.


# Profiling Spreadsheet
The data for this spreadsheet was collected near the end of April. 
The graphs show the average first-token latency for a number of token values.
All times measured in milliseconds.