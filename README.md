# Type Tester

#### Video Demo: https://youtu.be/rBoJuZAD7Mw

## Performance TODO

Each task below is scoped to one commit, in suggested implementation order. These are code-review findings; their impact still needs to be measured on phones.

- [x] **Keep scrolling inside the word box.** Use a ref to the active word and adjust only the word box scroll position to keep the active line at the top, with upcoming text below and no smooth animation. Restart focuses the input with `preventScroll`. Automated regression checks cover active-line alignment, advancement, and cancellation in both dictionaries; a real-phone check with the keyboard open is still pending.
- [x] **Isolate word-list rendering from typing input.** Extracted a memoized WordList with stable array/ref props and its own active-word scrolling effect. React Profiler regression tests in both dictionaries confirm zero word-list renders for character input and timer ticks, and one render per word submission. Active-word highlighting, correct/incorrect statuses, scrolling, and cancellation remain covered by the typing-test suite.
- [x] **Reduce keyboard audio work.** Sound stays always on. Removed duplicate Space/Enter playback and stabilized callbacks. Preload/decode the click once using Web Audio with interactive latency, resume audio when the input is touched/focused, and play a fresh buffer source per key without media seeking. Drop stale clicks during loading/interruption; retain media-element fallback if Web Audio is unavailable or decoding fails. Tests cover buffer reuse, immediate rapid playback, gesture resumption, stale-click suppression, cleanup, fallback, and word submission/scoring. Real-phone responsiveness verification is still pending.
- [x] **Support mobile word submission through input events.** Input changes submit space-delimited words without requiring Space keydown, retain unfinished text, and update scoring/statuses atomically. Desktop Space/Enter remain supported. Composition guards defer submission until completion and suppress a duplicate final input event. Regression tests cover input-only mobile events, multiple words, empty separators, desktop submission, composition event ordering, input clearing, and scoring. Verification with actual iOS and Android keyboards is still pending.
- [ ] **Lazy-load secondary routes.** Keep the typing screen eager and load account and informational pages on demand with a loading fallback. Ensure Profile's MUI dependency is deferred until needed. Verify direct navigation and protected routes, run the production build, and compare initial JavaScript size and phone startup timing before and after.

## Setup

Check readme in /server and /client for instructions on how to install the run the app

# Description:

## Summary

Typetester is a full-stack web application to test typing speed. Users have the option between a randomised list of the 300 most common words in English, or a short story if they prefer to follow a narrative to help them type even faster. The app returns a score in words per minute (wpm), which is 40 wpm on average. Try it out and see how fast you can type!

Users have the option to save their scores to a database, which can be viewed in the profile page - or maybe even the leaderboard page if they manage to make it to the top 20!

### Technologies used

- React (TypeScript), CSS Modules for styling and Jest for unit tests
- Backend: Flask (Python)
- Database: PostgreSQL (e.g. via Neon) for storing user data and scores

## Database

The database layer uses PostgreSQL accessed through SQLAlchemy. The connection URL is supplied via the `DATABASE_URL` environment variable.

It contains a user table that stores an auto incrementing id, a unique username, and a hashed password. The scores table also has an auto incrementing id, associated user id, score, and a created timestamp.

## Backend

The backend of Typetester handles user authentication, score tracking, and leaderboard management. Using Flask, it offers a set of routes for interacting with the application.

- /login: takes a username and password from the front end, checks it against the database and returns a JWT on success
- /register: takes a username and password from the front end and checks to see if they meet the minimum requirement. Adds the user to the user table with a hashed password.
- /status: takes in a JWT token to return a logged in status, user id and username to help with some protected routes.
- /score: handles a post request from the front end containing a wpm score and a JWT token. If no other score has been submitted in the last minute, it is added to the score table.
- /leaderboard: Makes an SQL query for the top 20 scores in the score table and merges it with the corresponding usernames from the user table. This is returned as a list for the front end.
- /personal: This route also returns a list of scores but is dependent on what is sent from the front end. If 'score' then the user making the request will receive a list of their personal top 20 scores. If 'created' then they will receive a list of their last 20 scores

Originally, reloading the app would reset the login state, requiring users to log in again. JWTs resolve this issue by enabling stateless authentication, where the auth data is stored within the token itself, not the server. The token also includes an expiry time (1 hour), allowing users to interact with the app freely within that period without needing to log in again.

## Frontend

- Navbar: Renders register, login and leaderboard options if no user is logged in. It displays the leaderboard, type test, profile and logout links if a user is logged in. It navigates through the application using react-router-dom and logs out by clearing the JWT from session storage. Also contains a responsive hamburger menu for improved usability on smaller screens.

- PrivateRoute: Any route wrapped in this element on the App.tsx file will require a valid user ID. First, the component checks the /status route to see if a users credentials are valid. While this is happened, a "Loading..." message will be displayed. On success, a useState boolean 'loading' is set to false. On failure, the user is directed to the login page and if logged in the user can access the protected route.

- AuthContext: This file was created because multiple pages were making fetch requests and required the login status. I wanted to clean the code and centralise the authentication logic which led to useContext from React. This is where the calls to /register, /login and /status are made and also where the JWT token is set to token storage. On success, the register and login functions return an object with a success boolean and a message. It also sets userId and username accordingly, which the status function updates accordingly. The logout function clears the token from storage.

- Home: Welcome page displays a link to register or login if no user is authenticated and a link to start a type test if there is a logged in user.

- Register / Login: These pages are forms that take a user input for username and password, validates them, then sends it to the backend via the relevant route. If a user makes an error then a message will be displayed above the submit button detailing the error. The page will render the error message from either the form validation on the front end or the error message from the backend depending on the users input.

- Leaderboard: This page will make a get request to the backend to receive a leaderboard list. It will then map through this object and display the information in a table. A relevant message will appear if there is no data after a successful request or if the data is loading. This page works regardless of logged in state so anyone can view it.

- Profile: The profile page is slightly different to the leaderboard page in that it loads data that is personal to a logged in user. It sits in a protected route, and will send one of two variables to the backend along with the JWT token in a get request to receive either the last 20 scores they submitted or their top 20 scores. The 'Sort By' button will change based on what is being displayed in the table and will send a get request to the backend onClick.

- TypeTest: Last and far from least is the main course of the application. In this file, an array of the 300 most common words is loaded from the dictionary file by default. The user can change this with the "use short story" button which toggles the dictionary state to use the short story.

  - Once the dictionary is loaded, the user can begin to type what they see on screen. This will trigger the handleInputChange to start the test and begin the timer.
  - The timer is defined in a custom hook useTimer which starts with 60 (defined in the timer state) and decrements by 1 every second. When the timer is less than or equal to 0, the time taken is recorded and the test is ended.
  - Every time a key is pressed, the user input is updated to reflect what the user typed. handleKeyPress checks to see if the key is a space or enter. It will check to see if the word that the user typed matches the one in the dictionary. It does this using currentWordIndex, which tracks the number of words the user has typed so far and compares it against the corresponding position in the dictionary array. Next, it updates a separate array that keeps track of which words the user typed correctly and which were wrong. This array is used to dynamically style the words that the user has already typed, between green and red. Finally, all of these are updated to the state and the correctWordsIndex is incremented, as well as the user input being set back to being blank.
  - While the user progresses through the dictionary, current index gets updated. This index is used to point towards the list of words that are being displayed on the screen, which are all wrapped with a span tag. the scrollIntoView function then makes sure that the word in focus, decided by currentWordIndex, is scrolled into view for the user. This way, as the user progresses through the dictionary, the box scrolls for them. I implemented this feature because displaying the entire list in one go meant that a user's eyes would have to jump quite a bit. However, shrinking the box meant that once the user got past the first few lines, the words weren't visible.
  - When the user finishes the test, safeElapsedTime is calculated to ensure no divide by 0 errors occur, and the wpm score is calculated by dividing the number of correct words by the elapsed time, then multiplying by 60. It it done like this so the timer could potentially be changed from 60 s to any time but will still return a words per minute score.
  - A report card will render when the test is finished. This will congratulate the user and display the words per minute, number of correct words and number of wrong words. It'll also provide two buttons for the user to press. The Try Again button triggers the resetTest function, which resets the state object back to the initial state, and clears all the arrays. The save button calls the handleSubmitScore function.
  - This uses the custom hook useSubmitScore to make a post request to the backend with the user's JWT token and their score in wpm. If all goes well then it returns true and if not, returns the error message. If the handleSubmitScore function receives true then then the submit button is disabled to prevent users from spamming post requests to the backend. This is also protected on the backend in case users decided to remove the disabled javascript on the button.
  - The final thing I'd like to mention regarding this file is how it progressed over time. It started off relatively simple with a few functions and states. As the app grew to be more complex, I found that I was using over 10 useStates and multiple functions outside of the return. I began to move some of the logic out into custom hooks and looked into utilising the useReducer to manage and update all my states in one large object. This helped clean the code significantly.

- Responsiveness: To make the application look nice on mobile devices, I designed each page mobile-first. This meant lower padding, appropriate font and for the containers to fill up more of the screen. I then implemented media queries that would adjust the styling when the width of the screen is greater than a certain length. For the most part, I used the rough sizing of an iPad to differentiate between smaller screens and larger screens. Some of the changes include a reshuffling of components using flex (from row to column, like the buttons on the home screen). Another example is how the main card on TypeTest.tsx takes 100% width on smaller screens, but only 80% of larger screens - with a hard limit of 100 rem.

- Testing: Each page and component has its own unit test to ensure the application functions as expected. I implemented these using Jest and React Testing Library. The simple tests include simulating user actions and checking if the desired outcome was achieved. The more challenging tests included mocking the auth hooks to ensure a page loaded in the desired fashion. I also mocked hooks like useNavigate to check if the application was routing when it was meant to. I even mocked async calls to the backend and returned an object resembling what would actually be returned to test out the Profile page.
