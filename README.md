Garden Experiences in XR
=======

This is a prototype for a multi-user XR system that serves as a testbed for remotely experiencing a garden. We use [networked-AFRAME](https://github.com/networked-aframe/networked-aframe) so that users can access the experience from any device that supports webXR without restricting them to headsets and address some health concerns around sharing headsets with other groups in the current COVID pandemic. The app allows users to basically view a model of their garden that is created externally using a photogrammetery software (e.g. [Agisoft Metashape](https://www.agisoft.com/)) on a browser as a group, demonstrate two instructional scenarios, and record some session metadata to a mongodb server.

For the demonstration scenarios, we refer to two examples in the expert-novice dyads that appeared during a virtual garden planning activity from [CSCW '22 publication](https://maddalihanumateja.github.io/assets/pdfs/CSCW22_website.pdf). We selected these examples as they involved embodied interactions that participants discussed using when instructing or connecting in a physical garden:
 - Example Scenario 1: Gauging the slope to visualize the flow of water. In this example, gardeners can simulate rain, and discuss how the flow of water across a 3D mode of the plot might affect certain tasks.
 - Example Scenario 2: Visualizing the distribution of shade. This is a temporal process. The gardeners can observe how “moving” the sun across the sky on a virtual model of the garden can affect the distribution of sunlight and discuss how that might affect certain tasks. 

![Example Scenario 1: Rain simulated on the garden model](https://drive.google.com/uc?id=1GfcGL352TUSt7rROPXuPh3TJ3L5Ww_4c) ![Example Scenario 2: Virtual sun moving across the garden model](https://drive.google.com/uc?id=14vN8kC79zEHVTW7Eb_dn5omzD7evdjA7)


Getting Started
-------

- After downloading the project, navigate to the project folder in a terminal or cmd window
- Run `npm install` to install all dependencies
- Run `npm start` to run the app locally
- Open a browser window and go to the address indicated by the messages on the terminal window (e.g. https://localhost:8080). You should find an index page with 4 options (Design Probe 1, Desgin Probe 2, ...)
- If you are using a headset or mobile phone to access the website, find the ip address of the computer running the app as the server and use that address instead of localhost (e.g. https://168.129.x.x:8080)
- Click on any option in the index page to see one of the example scenarios. Example Scenario 2 gives the user additional sliders to change the position of the sun.
- The 3d models are stored in the `examples/assets` folders.
- There are pages with the "observer" suffix in their name that can be used by spectators to see users interacting with the garden model while remaining invisible. The `observer-4` page allows spectators access to first person views of any active user. This is useful when recording FPV simultaneously.