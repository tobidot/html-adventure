# Documentation for HTML-Adventure Framework

## Introduction

HTML-Adventure is a framework for creating text-based adventure games that run in a web browser. 
It is designed to be simple to use.
This documentation will describe the ideas and rules behind it, to properly use it.

## File Types

There are two types of files that are used in HTML-Adventure.
One is used to define locations and the other is used to define interactables.
Both are described in *.xml files and have a defined schema.
- [interactable.dtd](../../schema/interactable.dtd)
- [location.dtd](../../schema/location.dtd)

## Locations

Locations are the places where the player can be.
They usually describe only a background image and a list of interactables that are to be found in that location.
See the `examples-location.xml` for a simple example.

## Interactables

Interactables are objects that the player can interact with.
They can be items, characters, or just decorative objects that the player can inspect to fill in the world.
Interactables have a unique id an image a clickarea and a list of actions that can be performed on them.
The logic inside these action is defined here as well and can best be learned by looking at the `examples-object.xml`.

## How to start

To start creating a new adventure game, you best first describe the story and world you want to create.
Then you can start creating the key-interactables that the users should find to progress their story.
They should have their proper logic to play out the story.
It is beneficial to map out the variables you are using throughout the actions and describe what you are using them for 
and where/when you are changing them.
Then you can start creating the locations and place the interactables inside them, where they would make sense story wise.
After you have done so, you should refine the locations with some optional interactable that the player can inspect to get more information about the world.

Make sure all files and logic adhere to the schema and play out the way you want it to.
Adjust if necessary and repeat the process until you are satisfied with the result.


