import Vue from 'vue'
import firebase from 'firebase/app'

Vue.use(firebase, {
  firebaseConfig: {
    apiKey: 'AIzaSyAPFjwnT-zd6fMMz5W-Oe5mMxMi3Uo4EP4',
    authDomain: 'npc-official-website.firebaseapp.com',
    databaseURL: 'https://npc-official-website.firebaseio.com',
    projectId: 'npc-official-website',
    storageBucket: 'npc-official-website.appspot.com',
    messagingSenderId: '303485712877',
    appId: '1:303485712877:web:66ab0dddfc8b9e10'
  }
})
