import { Alert, Image, Modal, Pressable, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { regionDisplayName } from "./src/helpers";
const App = () => {
  const [username,setUsername] = useState("");
  const [summonerData,setSummonerData] = useState([]);
  const [spectatorData,setSpectatorData] = useState([]);
  const [playerData, setPlayerData] = useState([]);
  const [spellCooldownsState, setSpellCooldownsState] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState('tr1');
  const regions = ['tr1', 'euw1', 'na1','br1','eun1','jp1','kr','la1','la2','oc1','ru','ph2','sg2','th2','tw2','vn2'];
  const api_key = "RGAPI-b270de1e-e9da-4df7-a3c0-b373d2d3ccc9";
  const [summonerDataUrl, setSummonerDataUrl] = useState(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${api_key}`);
  const SPELL_COOLDOWNS = {
    "SummonerFlash.png": 300,
    "SummonerHeal.png": 240,
    "SummonerDot.png": 180,
    "SummonerBarrier.png": 180,
    "SummonerExhaust.png": 210,
    "SummonerTeleport.png": 360,
    "SummonerBoost.png": 210,
    "SummonerHaste.png": 210,
    "SummonerSmite.png": 15,
    "SummonerMana.png": 240,
  };

  function spellImageStyles(spellKey: string) {
    // @ts-ignore
    return spellCooldownsState[spellKey] ?
      { width: 64, height: 64, marginLeft: 10, opacity: 0.3 } : { width: 64, height: 64, marginLeft: 10 };
  }
  function handleUsernameChange(text: string) {
    setUsername(text);
  }
  function getSpellKey(player: never, spellUrl: string) {
    const spellName = spellUrl.split("/").pop();
    return `${player.summonerName}-${spellName}`;
  }
  function handleSpellClick(player: any, spellUrl: string) {
    const spellName = spellUrl.split("/").pop();
    // @ts-ignore
    const spellKey = getSpellKey(player, spellUrl);

    // @ts-ignore
    if (SPELL_COOLDOWNS[spellName] && !spellCooldownsState[spellKey]) {
      // @ts-ignore
      setSpellCooldownsState((prevState) => ({ ...prevState, [spellKey]: SPELL_COOLDOWNS[spellName] }));
      const timerId = setInterval(() => {
        setSpellCooldownsState((prevState) => {
          // @ts-ignore
          if (prevState[spellKey] > 0) {
            // @ts-ignore
            return { ...prevState, [spellKey]: prevState[spellKey] - 1 };
          } else {
            clearInterval(timerId);
            return { ...prevState, [spellKey]: null };
          }
        });
      }, 1000);
    }
  }
  function handleSpellLongPress(player: any, spellUrl: string) {
    // @ts-ignore
    const spellKey = getSpellKey(player, spellUrl);
    setSpellCooldownsState((prevState) => ({ ...prevState, [spellKey]: null }));
  }
  function getSummonerData() {
    axios.get(summonerDataUrl).then((response) => {
      setSummonerData(response.data);
      getSpectatorData(response.data.id);
    }).catch((error) => {
      console.log(error);
    });
  }
  function getSpectatorData(id: any) {
    const spectatorDataUrl = `https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${id}?api_key=${api_key}`;
    axios.get(spectatorDataUrl).then((response) => {
      const data = response.data.participants.map((participant: { teamId: any; spell1Id: any; spell2Id: any; championId: any; profileIconId: any; summonerName: any; }) => {
        return {
          teamId: participant.teamId,
          spell1Id: participant.spell1Id,
          spell2Id: participant.spell2Id,
          championId: participant.championId,
          profileIconId: participant.profileIconId,
          summonerName: participant.summonerName
        }
      });
      setSpectatorData(data);
    }).catch((err) => {
      if (err.response.status === 404) {
        setSummonerData([]);
        Alert.alert("Error", "Summoner is not in game.");
      }
      if (err.response.status === 401) {
        setSummonerData([]);
        Alert.alert("Error", "Api key is invalid.");
      }
      if (err.response.status === 403) {
        setSummonerData([]);
        Alert.alert("Error", "Api key is expired.");
      }
      if (err.response.status === 429) {
        setSummonerData([]);
        Alert.alert("Error", "Api key is rate limited.");
      }
      if (err.response.status === 500) {
        setSummonerData([]);
        Alert.alert("Error", "Internal server error.");
      }
      if (err.response.status === 503) {
        setSummonerData([]);
        Alert.alert("Error", "Service unavailable.");
      }
    })
  }
  function getChampionImageUrl(key :any, data :any) {
    const numberKey = Number(key);
    for (let champion in data) {
      if (Number(data[champion].key) === numberKey) {
        return `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${data[champion].id}.png`;
      }
    }
    return "Champion not found.";
  }
  function getSpellImageUrl(key :any, data :any) {
    const numberKey = Number(key);
    for (let spell in data) {
      if (Number(data[spell].key) === numberKey) {
        return `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/spell/${data[spell].id}.png`;
      }
    }
    return "Spell not found.";
  }
  function getAllChampions(key : any) {
    const championsDataUrl = `http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json`;
    return axios.get(championsDataUrl).then((response) => {
      const url = getChampionImageUrl(key, response.data.data);
      return url;
    });
  }
  function getAllSpells(key : any) {
    const spellsDataUrl = `http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/summoner.json`;
    return axios.get(spellsDataUrl).then((response) => {
      const url = getSpellImageUrl(key, response.data.data);
      return url;
    });
  }
  function formatTime(timeInSeconds: any) {
    if (!Number.isFinite(timeInSeconds)) {
      return "";
    }

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    setSummonerDataUrl(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${api_key}`);
  }, [region, username]);

  useEffect(() => {
    // @ts-ignore
    const userTeam = spectatorData.find(participant => participant.summonerName === username)?.teamId;
    // @ts-ignore
    const otherTeam = spectatorData.filter(participant => participant.teamId !== userTeam);

    const playerDataPromises = otherTeam.map((participant) =>
      Promise.all([
        // @ts-ignore
        getAllChampions(participant.championId),
        // @ts-ignore
        getAllSpells(participant.spell1Id),
        // @ts-ignore
        getAllSpells(participant.spell2Id),
      ]).then(([championUrl, spell1Url, spell2Url]) => ({
        championUrl,
        spell1Url,
        spell2Url,
        // @ts-ignore
        summonerName: participant.summonerName,
      }))
    );

    Promise.all(playerDataPromises).then((players) => {
      setPlayerData(players);
    });
  }, [spectatorData, username]);


  if(spectatorData.length !== 0) {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <StatusBar barStyle="light-content" backgroundColor={'black'}/>
        <View style={{height:'8%', flex:1, justifyContent:'space-between', padding:10, alignItems:'center', flexDirection:'row'}}>
          <Text style={{fontSize:28,marginLeft:10, color: 'black'}}>{summonerData.name}</Text>
          <Pressable
            onPress={() => {setSummonerData([]); setSpectatorData([]); setPlayerData([]); setUsername('')}}
          >
            <Image
              source={{uri :'https://icons.iconarchive.com/icons/icons8/windows-8/256/Science-Multiply-2-icon.png'}}
              style={{width:48,height:48}}
            />
          </Pressable>
        </View>
        <View style={{ height: 1, width: '92%', backgroundColor: 'black', alignSelf: 'center'}} />
        <View style={{height:'92%'}}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom:60 }}>
            {playerData.map((player, index) => (
              <View key={index} style={{marginBottom:20}} >
                <Text style={{fontSize:20,marginBottom:2}}>{player.summonerName}</Text>
                <View style={{ flexDirection: 'row', alignItems:'baseline' }}>
                  <Image source={{ uri: player.championUrl }} style={{ width: 72, height: 72}} />
                  <Pressable
                    onPress={() => handleSpellClick(player, player.spell1Url)}
                    onLongPress={() => handleSpellLongPress(player, player.spell1Url)}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: player.spell1Url }} style={spellImageStyles(getSpellKey(player, player.spell1Url))}/>
                      <Text style={{fontSize: 22 ,color: 'red', position: 'absolute', top: 0, right: 0, bottom: 0, left: 8, textAlign: 'center', textAlignVertical: 'center'}}>{formatTime(spellCooldownsState[getSpellKey(player, player.spell1Url)]) || ''}</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSpellClick(player, player.spell2Url)}
                    onLongPress={() => handleSpellLongPress(player, player.spell2Url)}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: player.spell2Url }} style={spellImageStyles(getSpellKey(player, player.spell2Url))}/>
                      <Text style={{fontSize: 22 ,color: 'red', position: 'absolute', top: 0, right: 0, bottom: 0, left: 8, textAlign: 'center', textAlignVertical: 'center'}}>{formatTime(spellCooldownsState[getSpellKey(player, player.spell2Url)]) || ''}</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={{flex: 1,}}>
      <StatusBar barStyle="light-content" backgroundColor={'black'}/>

      <View style={{flex: 0.1, backgroundColor: 'white'}} />
      <View style={{flex: 3, backgroundColor: 'white'}} >
        <View style={{flex:1 ,alignItems:'center',justifyContent:'center',flexDirection:'column'}}>

          <Image
            source={{uri :'https://icon-library.com/images/league-of-legends-icon-png/league-of-legends-icon-png-17.jpg'}}
            style={{width:100,height:100}}
          />

          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center', marginRight: 30 , marginLeft: 30 , marginTop: 10}}>

            <TouchableOpacity
              style={{ width:'20%', height: 40 , backgroundColor: '#0092eb', justifyContent:'center', alignItems:'center', borderRadius:4}}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{color : 'white' , fontSize:20}}>{regionDisplayName(region)}</Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22}}>
                <View style={{margin: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5}}>
                  {regions.map((regionItem, index) => (
                    <Pressable
                      key={index}
                      style={{borderRadius: 20, padding: 8, elevation: 2, width:80, marginBottom: 4 ,backgroundColor: "#2196F3"}}
                      onPress={() => {
                        setRegion(regionItem);
                        setModalVisible(!modalVisible);
                      }}>
                      <Text style={{color: "white", fontWeight: "bold", textAlign: "center"}}>
                        {regionDisplayName(regionItem)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Modal>
            <TextInput
              onChangeText={text => handleUsernameChange(text)}
              value={username}
              placeholder={"Username"}
              style={{ width:"70%", height:40, borderBottomWidth:1 ,padding:10 ,borderRadius:4, marginLeft:6 , fontSize:20}}
            />
          </View>
          <TouchableOpacity
            style={{ alignItems: 'center', backgroundColor: '#0092eb', padding: 10 , marginTop: 20 , borderRadius:4 , width:90}}
            onPress={ () => {getSummonerData();}}
          >
            <Text style={{ color : 'white' , fontSize:16}}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flex: 1, backgroundColor: 'white'}} />
    </View>
  );
}
export default App;

