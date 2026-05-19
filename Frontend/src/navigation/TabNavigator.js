//https://reactnavigation.org/docs/bottom-tab-navigator/

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../screens/Home';
import NuevoLibro from '../screens/NuevoLibro';
import Buscador from '../screens/Buscador';
import Perfil from '../screens/Perfil';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ setUsuarioLogueado }){
    return (
        <Tab.Navigator 
        initialRouteName='Home' 
        screenOptions={{ 
            headerShown: false,
            tabBarActiveBackgroundColor: '#7D6461',
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor: 'white',
            tabBarStyle:{
                color: 'white',
                backgroundColor: '#594745',
            }
        }}
        >
            <Tab.Screen 
                name="Home" 
                component={Home}
                options={{
                    tabBarIcon: ({color, size}) => (<FontAwesome name="home" color={color} size={24} />)
                }}
            />
            <Tab.Screen
                name="NuevoLibro"
                component={NuevoLibro}
                options={{
                    tabBarIcon: ({color, size}) => (<Ionicons name="add-circle" color={color} size={24}/>)
                }}
            />
            <Tab.Screen
                name="Buscador"
                component={Buscador}
                options={{
                    tabBarIcon: ({color, size}) => (<MaterialIcons name="search" color={color} size={24} />)
                }}
            />
            <Tab.Screen
                name="Perfil"
                options={{
                    tabBarIcon: ({color, size}) => (<FontAwesome name="user" color={color} size={24}/>),
                }}>
                {(props) => <Perfil {...props} setUsuarioLogueado={setUsuarioLogueado} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}