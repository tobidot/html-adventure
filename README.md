# html-adventure

## Description

- Describe what the project is about

# The DSL

This game(-engine) is driven by a custom language that is based on XML and should be valid HTML.
See the [docs](./src/docs/v1/index.md) for more details on the language.

## Workflow

Background images are generated using midjourney.
With PhotoLine, i can create vector graphics on top of these background images to create
map-area's that are clickable using vector drawings with a fill.
After exporting them as SVG i need to set the fill to "00000000", 
so they are not visible (or on the map they are actually yellow).  

The interactable objects follow a logical structure. 
Where the HTML defines the conditions and reactions of the objects.
Using the "output" action will print text and play an audio with matching text data from the "audio-list.html" file.
If the debug script is enabled at the first click into the game all missing audio files will be listed in the console.
Copy them separated by newlines into the "read.txt" file and run the "bin/text-to-speach-file.ps1" script to
generate the missing audio files and automatically add them to the "audio-list.html".

## Todo

- Sketch up what to implement next
