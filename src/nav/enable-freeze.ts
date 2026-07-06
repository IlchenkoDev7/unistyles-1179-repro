import { enableFreeze } from 'react-native-screens';

// Flips react-navigation's `freezeOnBlur` default to true for every navigator:
// a blurred screen's React tree is suspended (react-freeze) until it refocuses.
//
// Must run before the first navigator mounts — hence this entry-time side effect.
enableFreeze(true);
