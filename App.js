import React, { useState, useEffect,useCallback} from 'react';
import { Text, View, TextInput, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, Image, SafeAreaView, FlatList} from 'react-native';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as Device from 'expo-device';

SplashScreen.preventAutoHideAsync();

//My Weather App contains three screens, each with their own uses and functions. The app starts on the Location List screen. On this screen, users can access locations they have added to their list. I am using a Flatlist to display all of the saved locations. The user can add additional locations to their list by pressing the Plus button in the top right, or remove a location from their list by pressing the red button next to each location. I am importing JSON Async Storage, so that the user's lists save even when they completely exit out of the app. There is also a "Reset List" that allows the user to compelely empty their list. (NOTE: If the user's list is completely empty when they exit the app, the next time they open the app, it will have the "Morris" location by default. This is completely intentional.) When the user wishes to add a new location, they can press the Plus button and enter the latitude and longitude of their desired location via TextInputs. The user is not allowed to enter numbers past the given range, and cannot enter a geolocation where the API cannot find a location name. Once the user has created their list, they can click on each individual location to retrieve more specific weather data. On this screen, you can see the rounded integer value of the current temperature, a short description of the weather, as well as the daily high and low temperatures. There is also a five day forecast that displays the weather and temperature for each of the next five days, a "Feel Like" temperature that is recieved directly from the current weather API, a humidity percentage, pressure in hPa, and the percent chance of precipitation. The Wind box portrays a short description of how windy the current environment is, giving wind speed, direction, and gusts (if the retrieved gust value is not undefined).  In this display, there is also a responsive compass whose needle points in the direction that of the wind vector. 

//LIMITATION #1: I have compared the iOS wind information with that of the API, and it is simply not accurate for most cases. Usually, the speed is a few mph off and the degrees are off as well. I do not know why this is, but considering I am retrieving the information directly from the API, I don't think this is my fault. Additionally, some remote locations do not display accurate High and Low temperatures (the high, low, and current temperatures are all the exact same).

//LIMITATION #2: The wind compass doesn't show  up on the web version for some reason.  

//LIMITATION #3: The Async Storage, while it does display the full list of locations, may not display them in the exact order that the user entered them in as - often times it willl exist in a different order. I do not know why this is, but I figure it is not a huge issue.

//LIMITATION #4: Loading Images for the main background and the preview screen take a REALLY long time on older devices (sometimes, rarely, they won't show up at all).

//LIMITATION #5: On Mobile Devices - specifically iOS - there is some strange artifacting with text shadows.

export default function App() {
  
  const [screen, setScreen] = useState(1); 
  const [city, setcity] = useState();
  const [highTemp, setHighTemp] = useState(0);
  const [lowTemp, setLowTemp] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentWeather, setCurrentWeather] = useState([]);
  const [weatherImage, setWeatherImage] = useState(require('./assets/sunny.webp'))
  const [row0, setRow0] = useState([]);
  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [row3, setRow3] = useState([]);
  const [row4, setRow4] = useState([]);
  const [angle, setAngle] = useState();
  const [feelsLike, setFeelsLike] = useState();
  const [humidityPercent, setHumidityPercent] = useState();
  const [pressure, setPressure] = useState();
  const [locationList, setLocationList] = useState([]);
  const [pop, setPop] = useState();
  const [windText, setWindText] = useState();
  const [text, onChangeText] = useState();
  const [textTwo, onChangeTextTwo] = useState();

  const [justStarted, setJustStarted] = useState(true); // On User Opens App
  useEffect(() => {
    if (justStarted) {
      setList();
      setJustStarted(false);
    }
  }, [justStarted])

  const storeList = async (newvalue) => { // On User Edits Location List
    try {
      const jsonValue = JSON.stringify(newvalue)
      await AsyncStorage.setItem('locationList', jsonValue)
    } catch (err) {
      console.error(err);
    }
  }

  const setList = async () => { // On User Opens App
      try {
        const value = await AsyncStorage.getItem('locationList');
        if (value !== null && value !== "undefined" && JSON.parse(value).length !== 0) {
          for (let i = 0; i < JSON.parse(value).length; i++) {
            addToList(parseFloat(JSON.parse(value)[i].lat), parseFloat(JSON.parse(value)[i].lon))
          }
        } else {
          addToList(40.8478, -74.5747);
        }
      } catch(err) {
          console.error(err);
        }
  };

  function capitalize (key) { // Proffesionalize lowercase string
    let str = '';
    for (i = 0; i < key.length; i++) { 
      let letter = key.substring(i, i + 1);
      if (i == 0 || key.substring(i - 1, i) == " ") {
        str += letter.toUpperCase();
      } else {
        str += letter;
      }
    }

    return str;
  }

  function getImage (weather, sunset, sunrise, dt, description) { // Retrieve an Image Based on Weather Conditions

    let weatherPreview = (require('./assets/sunny.webp'));
    if (weather == "Drizzle" || weather == "Rain") {
      weatherPreview = (require('./assets/Drizzle2.jpg'));
    }
    if (weather == "Snow") {
      weatherPreview = (require('./assets/Snow.jpg'))
    }
    if (weather == "Clouds" && (dt > sunset)) {
      weatherPreview = (require('./assets/cloudynight.jpg'))
    }
    if (weather == "Clouds" && (dt > sunset) && description == "overcast clouds") {
      weatherPreview = (require('./assets/cloudyday.jpg'))
    }
    if (weather == "Clouds" && (dt < sunset && dt > sunrise)) {
      weatherPreview = (require('./assets/cloudyday.jpg'))
    }
    if ((weather == "Clouds" && (dt < sunset && dt > sunrise) && description == "few clouds") || (weather == "Clear" && (dt < sunset && dt > sunrise))) {
      weatherPreview = (require('./assets/sunny.webp'));
    }
    if (weather == "Thunderstorm" || weather == "Squall") {
      weatherPreview = (require('./assets/thunderstorm.jpg'));
    }
    if (weather == "Clear" && (dt > sunset) || (dt < sunrise)) {
      weatherPreview = (require('./assets/clearnight.jpg'));
    }
    if (weather == "Tornado") {
      weatherPreview = (require('./assets/tornado.png'));
    }
    if (weather == "Ash") {
      weatherPreview = (require('./assets/ash.jpg'));
    }
    if (weather == "Dust" || weather == "Sand") {
      weatherPreview = (require('./assets/dust.jpg'));
    }
    if (weather == "Fog" || weather == "Mist" || weather == "Smoke" || weather == "Haze") {
      weatherPreview = (require('./assets/fog.jpg'));
    }    

    return weatherPreview;
  }

  function removeFromList (numKey) { // On User Removes Location from List
    let arrX = [...locationList];
    let tempArray = [];
    arrX.splice(numKey, 1);
    for (let i = 0; i < arrX.length; i++) {
      arrX[i].id = i;
    } 
    for (let j = 0; j < arrX.length; j++) {
      tempArray.push({lat: parseFloat(arrX[j].lat), lon: parseFloat(arrX[j].lon)})
    }   
    setLocationList(arrX);
    storeList(tempArray);
  }

  function addToList(latitude, longitude) { // On User Adds Location to List
    return fetch( "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=9953de032bc81ae0f4c8bdc428333c90&units=Imperial" )
        
    .then((response) => response.json())
    .then((data) => {

      let existBoolean = false; //Checking if the location user added already exists in the list.
      for (var i = 0; i < locationList.length; i++) {
        if (locationList[i].name == data.name) {
          existBoolean = true;
        }
      }

      if (!existBoolean) { //If the location is a new location that does not exist in the list already.
        let weatherImage = getImage(data.weather[0].main, data.sys.sunset, data.sys.sunrise, data.dt, data.weather[0].description);
        if (!(data.name == "")) {
          let arrX = [...locationList, {
            name: data.name,
            temperature: data.main.temp,
            id: 0,
            lat: parseFloat(latitude),
            lon: parseFloat(longitude),
            weather: capitalize(data.weather[0].description),
            preview: weatherImage              
            }];

          if (!justStarted) { //If the location is added manually by the user
            let tempArray = [];
            for (let i = 0; i < arrX.length; i++) {
              arrX[i].id = i;
              tempArray.push({lat: parseFloat(arrX[i].lat), lon: parseFloat(arrX[i].lon)});
            }               
            storeList(tempArray);
            setLocationList(arrX);                
          } else {
              setLocationList((locationList) => [...locationList, {
                name: arrX[0].name,
                temperature: arrX[0].temperature,
                id: locationList.length,
                lat: arrX[0].lat,
                lon: arrX[0].lon,
                weather: arrX[0].weather,
                preview: arrX[0].preview
              }]);
            } 
          } else {
              alert("Location data not found.");
            }
      }
    })

        .catch((error) => {
          console.error(error);
        });
  }

  function weatherForecast(latitude, longitude) { // Generate Future Information
      return fetch ('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=da5f06a7a1567b823d685052ed30635a&units=Imperial')

      .then(response=>response.json())
      .then(data2 => {

        let futureTempArray = [];
        let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < data2.list.length; i++) {
          let str = data2.list[i].dt_txt;
          let dateStr = str.substring(0, 10) + "T" + str.substring(11) + "Z";
          let forecastDate = new Date(dateStr);
          if (str.substring(12, 13) == "2") {
            futureTempArray.push([
              data2.list[i].main.temp,
              data2.list[i].weather[0].main,
              days[forecastDate.getDay()],
              'http://openweathermap.org/img/wn/' + data2.list[i].weather[0].icon + '@2x.png'
              ])
          }
        }

        setPop(data2.list[0].pop * 100);
        setRow0(futureTempArray[0]);
        setRow1(futureTempArray[1]);
        setRow2(futureTempArray[2]);
        setRow3(futureTempArray[3]);
        setRow4(futureTempArray[4]);
      })

      .catch((error) => {
      console.error(error);
    }); 
  }     

  function weatherInfo (latitude, longitude) { // Generate Current Information
      return fetch ('https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=da5f06a7a1567b823d685052ed30635a&units=Imperial')

      .then(response=>response.json())
      .then(data => {

        setCurrentWeather(capitalize(data.weather[0].description))
        setcity(data.name);
        setCurrentTemp(data.main.temp);
        setLowTemp(data.main.temp_min);
        setHighTemp(data.main.temp_max);
        setFeelsLike(data.main.feels_like);
        setHumidityPercent(data.main.humidity);
        setPressure(data.main.pressure);
        setAngle(parseFloat(data.wind.deg));
        setWeatherImage(getImage(data.weather[0].main, data.sys.sunset, data.sys.sunrise, data.dt, data.weather[0].description));

        if (data.wind.gust != undefined) {
          setWindText('Wind speed is currently ' + data.wind.speed + ' mph, at a bearing of ' + (360 - parseFloat(data.wind.deg)) + '°N. There are gusts of up to ' + data.wind.gust + ' mph.')
        } else {
          setWindText('Wind speed is currently ' + data.wind.speed + ' mph, at a bearing of ' + (360 - parseFloat(data.wind.deg)) + '°N.')
        }
      })
      .catch((error) => {
      console.error(error);
    });
  }

  const [fontsLoaded] = useFonts({ // Importing Custom Fonts
    'sfns': require('./assets/SFNSDisplay-Regular.otf')
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const Item = ({ name, temp, id, weather, preview }) => ( // Individual List Component
    <View style={styles.item} onLayout={onLayoutRootView}>
      <TouchableOpacity onPress={() => {weatherForecast(locationList[id].lat, locationList[id].lon); weatherInfo(locationList[id].lat, locationList[id].lon); setScreen(0)}} style={{width: '90%', height: '100%'}}>
        <Image style={styles.listImageContainer} source={preview} resizeMode='cover' />
        <View style={styles.locationButton}>
          <View style={{alignSelf: 'flex-end', height: '90%', flexDirection: 'column', width: '70%', justifyContent: 'flex-start'}}>
            <Text style={[styles.listText, {textAlign: 'left', fontSize: 30, marginBottom: '0%', marginLeft: '8%', height: '60%', marginTop: '1%'}]}>
            {name}
            </Text>
            <Text style={[styles.listText, {textAlign: 'left', fontSize: 15, marginTop: '0%', marginBottom: '10%', marginLeft: '8%',}]}>
            {weather}
            </Text>
          </View>  
          <View style={{height: '90%', alignSelf: 'flex-end', width: '30%', alignItems: 'flex-end', justifyContent: 'flex-start'}}>
            <Text style={[styles.listText, {textAlign: 'right', fontSize: 50, marginLeft: '8%', height: '100%'}]}>
            {Math.round(temp)}°
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton} onPress={() => {removeFromList(id);}}>
        <Text style={styles.removeText}>-</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => ( // Rendering Item for Flat List
    <Item name={item.name} temp={item.temperature} id={item.id} weather={item.weather} preview={item.preview}/>
  );

  const ForecastRow = ({day, image, temp}) => ( // Individual 5-Day Forecast Row
    <View style={styles.forecastRow}>
      <Text style={[styles.paragraph, styles.day, {width: '20%', textAlign: 'left'}]}> {day} </Text>
      <Image style={{width: '40%', height: '80%', alignSelf: 'flex-start'}} resizeMode='contain' source={{uri: image}} />
      <Text style={[styles.paragraph, styles.day, {textAlign: 'right'}]}> {temp}° </Text>
    </View>
  );

  const onChanged = (text, num) => { // Prevent unwanted characters in Text Input
    let newText = '';
    let numbers = '-0123456789.';

    for (var i = 0; i < text.length; i++) {
      if (numbers.indexOf(text[i]) > -1) {
        newText = newText + text[i];
      } else {
        alert('Please enter numbers only');
      }
    }
    if (num == 1) {
      onChangeText(newText);
    } else {
      onChangeTextTwo(newText);
    }
  };

  if (screen == 0) { // Full Weather Information Screen
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ImageBackground style={{  position: 'absolute', 
          top: 0,
          left: 0, 
          right: 0, 
          bottom: 0, 
          height: '98%',
          width: '100%'
          }} source={weatherImage} resizeMode='cover' />
        <ScrollView contentContainerStyle={{paddingBottom: '140%'}}>
          <View style={styles.headerContainer}>
            <Text style = {styles.header}>
            {city}
            </Text>
            <Text style = {[styles.header, {margin: 0, fontSize: 100}]}>
            {Math.round(currentTemp)}°
            </Text>
            <Text style = {[styles.header, {margin: 0, fontSize: 18}]}>
            {currentWeather}
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '69%', marginTop: "1%"}}>
              <Text style = {[styles.header, {margin: 0, fontSize: 18}]}>
              L: {lowTemp}°
              </Text>
              <Text style = {[styles.header, {margin: 0, fontSize: 18}]}>
              H: {highTemp}°
              </Text>            
            </View>
          </View>
          <View style={[styles.forecastView, {marginTop: '10%'}]}>
            <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center'}}>
              <Text style={styles.categoryLabel}>
              🗓️ 5 DAY FORECAST
              </Text>
            </View>
            <ForecastRow day={row0[2]} image={row0[3]} temp={row0[0]} />
            <ForecastRow day={row1[2]} image={row1[3]} temp={row1[0]} />
            <ForecastRow day={row2[2]} image={row2[3]} temp={row2[0]} />
            <ForecastRow day={row3[2]} image={row3[3]} temp={row3[0]} />
            <ForecastRow day={row4[2]} image={row4[3]} temp={row4[0]} />
          </View>
          <View style={{flexDirection: 'row', height: '10%', justifyContent: 'space-between', marginVertical: '10%', width: '90%', alignSelf: 'center'}}>
            <View style={[styles.forecastView, {width: '45%', left: '0%', height: '100%'}]}>
              <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center'}}>
                <Text style={styles.categoryLabel}> FEELS LIKE </Text>
              </View>
              <Text style={styles.feelsLike}> {Math.round(feelsLike)}° </Text>
            </View>
            <View style={[styles.forecastView, {width: '45%', left: '0%', height: '100%'}]}>
              <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center'}}>
                <Text style={styles.categoryLabel}> HUMIDITY </Text>
              </View>
              <Text style={styles.feelsLike}> {Math.round(humidityPercent)}% </Text>
            </View>
          </View>
          <View style={[styles.forecastView, {height: '35%'}]}>
            <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center',}}>
              <Text style={styles.categoryLabel}> 💨 WIND </Text>
            </View>
            <Text style={[styles.feelsLike, {fontSize: 15, padding: 10}]}> {windText} </Text>
            <View style={styles.compassContainer}>
              <Image
                source={require('./assets/compassneedle.png')}
                style={{
                  width: '60%',
                  height: '60%',
                  position: 'absolute',
                  transform: [{ rotate: -1 * angle + 'deg' }],
                }}
                resizeMode='contain'
              />
              <Image
                source={require('./assets/compass_bg.png')}
                style={{
                  height: '70%',
                  width: '70%',
                  justifyContent: 'center',
                  transform: [{rotate: 270 + 'deg'}]
                }}
                resizeMode= 'contain'
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', height: '15%', justifyContent: 'space-between', marginVertical: '10%', width: '90%', alignSelf: 'center'}}>
            <View style={[styles.forecastView, {width: '45%', left: '0%', height: '100%'}]}>
              <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center'}}>
                <Text style={[styles.categoryLabel, {fontSize: 15}]}> PRESSURE </Text>
              </View>
              <Text style={[styles.feelsLike, {fontSize: 40}]}> {pressure} hPa </Text>
            </View>
            <View style={[styles.forecastView, {width: '45%', left: '0%', height: '100%'}]}>
              <View style={{borderBottomWidth: 1, borderColor: '#b3bbce', width: '90%', alignSelf: 'center'}}>
                <Text style={[styles.categoryLabel, {fontSize: 15}]}> PRECIPITATION CHANCE </Text>
              </View>
              <Text style={styles.feelsLike}> {Math.round(pop)}% </Text>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity onPress={()=> {setScreen(1);}}>
          <Text style={[styles.paragraph, {color: '#fff'}]}>
          Select New Location 📍
          </Text>
        </TouchableOpacity>
      </View>
  );
}
  if (screen == 1) { // Weather List Screen
    return (
      <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
        <TouchableOpacity style={{
          height: '10%',
          justifyContent: 'center',
          backgroundColor: '#44c35a',
          borderRadius: (Device.osName == 'iPadOS' || Device.osName == 'iOS') ? '75%' : 90,
          width: '20%',
          alignItems: 'center',
          alignSelf: 'flex-end',
          marginRight: '5%',
          overflow: 'hidden'
          }}
      onPress={() => {setScreen(2)}}>
          <Text style={[styles.addLocation, { overflow: 'hidden'}]}> + </Text>
        </TouchableOpacity>
        <Text style = {[styles.addLocation, {width: '90%', alignSelf: 'center'}]}>
        Weather
        </Text>
        <ScrollView>
          <FlatList
            data={locationList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{marginBottom: 10}}   
          />
        </ScrollView> 
        <TouchableOpacity onPress={()=> {
          storeList([]);
          setLocationList((locationList) => []);
        }}>
          <Text style={[styles.paragraph, {color: '#fff'}]}>
          Reset List
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen == 2) { // Enter Geolocation Screen
    return (
      <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
        <TouchableOpacity onPress={() => {setScreen(1)}}>
          <Text style={[styles.addLocation, {marginTop: '10%', color: '#fff', fontSize: 20, width: '90%', alignSelf: 'center'}]}>
          ⏪Back
          </Text>
        </TouchableOpacity>
        <Text style = {[styles.addLocation, {width: '90%', alignSelf: 'center', fontSize: 20}]}>
        Enter Geolocation...
        </Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChanged(text, 1)}
          value={text}
          placeholderTextColor={'grey'}
          keyboardType={"default"}
          placeholder={"Latitude"}
        />
        <TextInput
          style={styles.input}
          onChangeText={(text) => onChanged(text, 2)}
          value={textTwo}
          placeholderTextColor={'grey'}
          keyboardType={"default"}
          placeholder={"Longitude"}
        />
        <TouchableOpacity onPress={() => {
          if (parseFloat(text).toFixed(6) >= -90 && parseFloat(text).toFixed(6) <= 90 && parseFloat(textTwo).toFixed(6) >= -180 && parseFloat(textTwo).toFixed(6) <= 180) {
            addToList(parseFloat(text).toFixed(6), parseFloat(textTwo).toFixed(6));
            onChangeText('');
            onChangeTextTwo('');
            setScreen(1);
          } else {
            alert("Latitude must be from -90 to 90 degrees, and Longitude must be from -180 to 180 degrees.");
            onChangeText('');
            onChangeTextTwo('');
          }
       }}
        style={styles.addButton}
        >
          <Text style={styles.addLocation}> Add Location </Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({ // Custom Styles
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#18191A',
    paddingVertical: '5%', 
  },
  header:{
    fontFamily: 'sfns',
    fontSize: 40,
    color: '#f3fbfe',
    textAlign: 'center',
    textShadowOffset: {width: 2, height: 3},
    textShadowRadius: 3,
    textShadowColor: "#000",
  },
  paragraph: {
    margin: 10,
    fontFamily: 'sfns',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontFamily:'sfns',
    backgroundColor: 'white',
    width: "90%",
    fontSize: 30,
  },
  headerContainer: {
    marginVertical: '10%',
    marginTop: '15%',
    height: '15%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
  },
  day: {
    color: '#f3fbfe',
    fontSize: 18,
    height: '100%',
    textAlign: 'left',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    top: '1%',
    fontFamily: 'sfns',
  },
  forecastView: {
    width: '90%',
    height: '45%',
    justifyContent: 'flex-start',
    left: '5%',
    backgroundColor: '#8a92a5',
    borderRadius: (Device.osName == 'iOS' || Device.osName == 'iPadOS') ? '5%' : 15,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 3, height: 5},
    shadowRadius: 2,
    shadowOpacity: 1,
    opacity: 0.9,
    elevation: 5,
  },
  categoryLabel: {
    fontFamily: 'sfns',
    fontSize: 18,
    textAlign: 'left',
    color: '#b3bbce',
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
    paddingVertical: '10%'
  },
  feelsLike: {
    fontFamily: 'sfns',
    fontSize: 45,
    color: '#f3fbfe',
    textAlign: 'center',   
  },
  compassContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: '10%'
  },
  addLocation: {
    fontSize: 50,
    color: '#f3fbfe',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#44c35a',
    padding: 10,
    textAlign: 'center'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  locationButton: {
    width: '100%',
    height: '90%',
    marginHorizontal: '5%',
    borderRadius: '10%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  listText: {
    fontFamily: 'sfns',
    fontSize: 18,
    textAlign: 'center',
    textShadowOffset: {width: 2, height: 3},
    textShadowRadius: 3,
    textShadowColor: "#000",
    justifyContent: 'flex-start',
    color: 'white',
    alignSelf: 'flex-start'
  },
  forecastRow: {
    flexDirection: 'row',
    height: '15%',
    borderBottomWidth: 1,
    borderColor: '#b3bbce',
    width: '90%',
    alignSelf: 'center',
    overflow: 'hidden'
  },
  removeButton: {
    borderRadius: (Device.osName == 'iOS' || Device.osName == 'iPadOS') ? '50%' : 15,
    backgroundColor: 'red', 
    width: 30,
    height: 30,
    marginRight: '2%',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  listImageContainer: {
    position: 'absolute', 
    top: '10%',
    left: "5%", 
    right: 0, 
    bottom: 0, 
    height: '90%',
    width: '100%',
    borderRadius: (Device.osName == 'iOS' || Device.osName == 'iPadOS') ? '15%' : 15
  },
  removeText : {
    fontSize: 25,
    overflow: 'hidden',
    color: '#fff',
    fontFamily: 'sfns',
    textAlign: 'center'
  }
});