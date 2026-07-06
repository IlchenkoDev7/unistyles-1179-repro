// Bundle entry. Order matters:
//   1. enableFreeze(true) BEFORE any navigator mounts (blurred screens freeze)
//   2. expo-router/entry wires up the router + AppRegistry (routes are eagerly
//      evaluated only AFTER this file finishes)
//   3. unistyles StyleSheet.configure AFTER expo-router/entry, so it is applied
//      before the first route stylesheet is created
import './src/nav/enable-freeze';
import 'expo-router/entry';
import './src/theme/unistyles';
