This is an expo app created using React Native JS. The link to the original snack is attached.
My Weather App contains three screens, each with their own uses and functions. The app opens on the Location List screen. On this screen, users can access locations they have added to their list. I am using a Flatlist to display all of the saved locations. The user can add additional locations to their list by pressing the Plus button in the top right, or remove a location from their list by pressing the red button next to each location. I am importing JSON Async Storage, so that the user's lists save even when they completely exit out of the app. There is also a "Reset List" that allows the user to compelely empty their list. (NOTE: If the user's list is completely empty when they exit the app, the next time they open the app, it will have the "Morris" location by default. This is completely intentional.) When the user wishes to add a new location, they can press the Plus button and enter the latitude and longitude of their desired location via TextInputs. The user is not allowed to enter numbers past the given range, and cannot enter a geolocation where the API cannot find a location name. Once the user has created their list, they can click on each individual location to retrieve more specific weather data. On this screen, you can see the rounded integer value of the current temperature, a short description of the weather, as well as the daily high and low temperatures. There is also a five day forecast that displays the weather and temperature for each of the next five days, a "Feel Like" temperature that is recieved directly from the current weather API, a humidity percentage, pressure in hPa, and the percent chance of precipitation. The Wind box portrays a short description of how windy the current environment is, giving wind speed, direction, and gusts (if the retrieved gust value is not undefined).  In this display, there is also a responsive compass whose needle points in the direction that of the wind vector. 

//LIMITATION #1: I have compared the iOS weather information with that of the API, and it is simply not accurate for most cases. Usually, the wind speed is a few mph off and the degrees are off as well. I do not know why this is, but considering I am retrieving the information directly from the API, I don't think this is my fault. Additionally, some remote locations do not display accurate High and Low temperatures (the high, low, and current temperatures are all the exact same).

//LIMITATION #2: The wind compass doesn't show  up on the web version for some reason.  

//LIMITATION #3: The Async Storage, while it does display the full list of locations, may not display them in the exact order that the user entered them in as - often times it willl exist in a different order. I do not know why this is, but I figure it is not a huge issue.

//LIMITATION #4: Loading Images for the main background and the preview screen take a REALLY long time on older devices (sometimes, rarely, they won't show up at all).

//LIMITATION #5: On Mobile Devices - specifically iOS - there is some strange artifacting with text shadows.

When you're ready to see everything that Expo provides (or if you want to use your own editor) you can **Download** your project and use it with [expo-cli](https://docs.expo.io/get-started/installation).

All projects created in Snack are publicly available, so you can easily share the link to this project via link, or embed it on a web page with the `<>` button.

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.io/c/snack).

Snack is Open Source. You can find the code on the [GitHub repo](https://github.com/expo/snack).
