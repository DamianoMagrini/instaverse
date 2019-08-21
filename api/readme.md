# The API

This is the first step towards creating a custom client for Instagram. Here I'll be reverse-engineering Instagram's API to understand how to interface an app with their servers.


## Project structure:

The files in `bundles/` are the original, compiled and bundled files downloaded from instagram.com, while those in `src/` are the files I decompiled and deobfuscated by hand. `known-modules.txt` is a list of the module IDs I managed to track back to npm modules.

### Other Folders
The `fbts` and `mixin-event-emitter` folders are for modules I found online but had to tweak a little. The `@types` folder is for type definitions of modules that didn't have one.

## Next steps
As of now, I've only decompiled up to module `9568362` "api" and `12779531` "get-follow-data", which contain low-level bindings to Instagram's internal API. However, I'm planning to begin decompiling higher-level modules too, though that will require some effort, and, most importantly, some time. Also, once I think I have decompiled enough modules, I will start naming the files in a normal way and organizing them into folders.

Also, module `9961589` "pagination" was not completely deobfuscated, as there was too little context to do so properly. Help is gladly accepted!